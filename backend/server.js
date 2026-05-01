const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Ensure required environment variables are set
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    console.error(`ERROR: Missing required environment variable: ${env}`);
    process.exit(1);
  }
});

const app = express();

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://taskmaster-xi-ochre.vercel.app', // Added common Vercel URL seen earlier
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check route
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'Backend Working', 
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Root route to prevent "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Taskmaster API is running. Use /api/status for more info.');
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// SERVE FRONTEND IN PRODUCTION
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// MongoDB Connection & Seeding
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      console.log('🌱 Seeding default admin user...');
      await User.create({
        name: 'Default Admin',
        email: 'admin@taskmaster.com',
        password: 'admin123',
        role: 'Admin'
      });
      console.log('✅ Default admin created: admin@taskmaster.com / admin123');
    }
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
  }
};

console.log("ENV CHECK (MONGO_URI exists):", !!process.env.MONGO_URI); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    seedAdmin();
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Removed process.exit(1) to keep the server alive for debugging
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
