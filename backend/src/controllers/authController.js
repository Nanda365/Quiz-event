const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/mailer');

exports.register = async (req, res) => {
  try {
    console.log('Register request received. Body:', req.body);
    const { name, email, password, college, state, mobile, interestedCategories } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn('Registration failed: User already exists for email:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password, college, state, mobile, interestedCategories });

    try {
      await user.save();
      console.log('User saved successfully to DB:', user);
    } catch (saveError) {
      console.error('Error saving user to database:', saveError);
      if (saveError.name === 'ValidationError') {
        const errors = {};
        for (const field in saveError.errors) {
          errors[field] = saveError.errors[field].message;
        }
        return res.status(400).json({ message: 'Validation failed', errors });
      }
      return res.status(500).json({ message: 'Database save error', error: saveError.message });
    }
    
    let token;
    try {
      token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      console.log('JWT token generated.');
    } catch (jwtError) {
      console.error('Error generating JWT token:', jwtError);
      return res.status(500).json({ message: 'Token generation error', error: jwtError.message });
    }

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'Lax',
    });
    console.log('Cookie set for user with token.');
    console.log('Sending successful registration response with user and token.');
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    console.error('General registration process error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 3600000, // 1 hour
      sameSite: 'Lax', // Adjust as needed
    });

    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.sendResetCode = async (req, res) => {
  console.log('Inside sendResetCode function');
  try {
    const { email } = req.body;
    console.log('Received email for reset:', email); // New log
    const user = await User.findOne({ email });
    console.log('User found in DB:', user); // New log

    if (!user) {
      console.log('User not found for email:', email); // New log
      return res.status(404).json({ message: 'User not found' });
    }

    const resetCode = crypto.randomBytes(3).toString('hex'); // 6-digit hex code
    user.passwordResetToken = resetCode;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    console.log('User object before saving reset token:', user); // New log
    await user.save();
    console.log('User object after saving reset token:', user); // New log

    try {
      const message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Pinnacle Portal Password Reset</h2>
          <p style="font-size: 16px; color: #555;">You requested a password reset. Please use the following code to reset your password. The code is valid for 10 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 18px; color: #555;">Your password reset code is:</p>
            <div style="background-color: #f2f2f2; border-radius: 5px; padding: 15px 25px; display: inline-block;">
              <strong style="font-size: 24px; color: #d9534f; letter-spacing: 2px;">${resetCode}</strong>
            </div>
          </div>
          <p style="font-size: 14px; color: #888; text-align: center;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `;

      await sendEmail({
        email: user.email,
        subject: 'Your password reset code (valid for 10 min)',
        message: message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'There was an error sending the email. Try again later!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({
      email,
      passwordResetToken: code,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
