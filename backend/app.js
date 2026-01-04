// ===================================================================
// FILE: backend/app.js
// Express App Setup & Middleware
// REPLACE YOUR EXISTING FILE WITH THIS
// ===================================================================
const webhookRoutes = require('./routes/webhook.routes');
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
// CORS configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://krishi-raksha-8fjb.vercel.app';

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Allow localhost on any port for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      return callback(null, true);
    }

    // Allow specific production domains
    const allowedOrigins = [
      FRONTEND_URL,
      'https://your-frontend-domain.com',  // Your production frontend URL
      // Add more production URLs here
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow known hosting providers with dynamic domains
    if (origin.includes('onrender.com') || origin.includes('vercel.app') || origin.includes('netlify.app')) {
      return callback(null, true);
    }

    console.warn('Blocked CORS origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11) choke on 204
};

app.use(cors(corsOptions));
// Handle preflight OPTIONS requests for all routes
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
try {
  const authRoutes = require('./routes/auth.routes');
  const farmerRoutes = require('./routes/farmer.routes');
  const claimRoutes = require('./routes/claim.routes');
  const blockchainRoutes = require('./routes/blockchain.routes');
  const payoutRoutes = require('./routes/payout.routes');

  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/farmers', farmerRoutes);
  app.use('/api/claims', claimRoutes);
  app.use('/api', blockchainRoutes); // blockchain routes at /api/blockchain/...
  app.use('/api/payouts', payoutRoutes);
  
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error);
  throw error;
}

// Update the health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to KRISHI RAKSHA API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      farmers: '/api/farmers',
      claims: '/api/claims',
      blockchain: '/api/blockchain',
      payouts: '/api/payouts',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;