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
      password: process.env.ADMIN_PASSWORD || 'admin,,123', // Use environment variable for admin password. IMPORTANT: Set ADMIN_PASSWORD in your .env file.
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
  max: 10000, // limit each IP to 10000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests, please try again later."
  },
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin/quizzes', adminQuizRoutes);
app.use('/api/admin/users', adminUserRoutes);

// Redis health-check API
app.get('/api/redis-health', async (req, res) => {
    let redisClient;
    try {
        const redis = require('redis');
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            return res.status(500).json({
                status: 'Redis not configured',
                error: 'REDIS_URL is not defined in environment variables.',
            });
        }

        redisClient = redis.createClient({
            url: redisUrl,
            socket: {
                tls: true,
                rejectUnauthorized: false
            }
        });

        await redisClient.connect();

        const reply = await redisClient.ping();

        if (reply === 'PONG') {
            // Also test SET/GET as a fuller verification
            const testKey = 'health-check-key';
            await redisClient.set(testKey, 'ok', { EX: 10 });
            const result = await redisClient.get(testKey);

            if (result === 'ok') {
                res.status(200).json({
                    status: 'Redis working',
                    message: 'PING and SET/GET successful',
                });
            } else {
                throw new Error('SET/GET command failed.');
            }
        } else {
            throw new Error('PING command did not return PONG.');
        }

    } catch (error) {
        res.status(500).json({
            status: 'Redis not working',
            error: error.message,
        });
    } finally {
        if (redisClient && redisClient.isOpen) {
            await redisClient.quit();
        }
    }
});


// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;