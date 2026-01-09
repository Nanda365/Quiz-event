const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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

    try { // Opening try block for user.save()
      await user.save(); // Attempt to save the user
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

exports.forgotPassword = async (req, res) => {
  try {
    const { email, name, newPassword } = req.body;
    const user = await User.findOne({ email, name });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
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
