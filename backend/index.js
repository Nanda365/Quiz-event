require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./src/routes/auth');
const quizRoutes = require('./src/routes/quiz');
const adminQuizRoutes = require('./src/routes/adminQuiz');
const adminUserRoutes = require('./src/routes/adminUser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;

const User = require('./src/models/User');

// Connect to database
connectDB().then(async () => {
  // Create admin user if not exists
  const adminEmail = 'admin@pinnacle.com';
  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    const adminUser = new User({
      name: 'Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'admin123', // Use environment variable for admin password. IMPORTANT: Set ADMIN_PASSWORD in your .env file.
      college: 'AdminCollege', // Placeholder for admin college
      mobile: '1234567890',   // Placeholder for admin mobile
      role: 'admin',
    });
    await adminUser.save();
    console.log('Admin user created');
  }
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin/quizzes', adminQuizRoutes);
app.use('/api/admin/users', adminUserRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;