// ===================================================================
// FILE: backend/server.js
// Server Entry Point
// REPLACE YOUR EXISTING FILE WITH THIS
// ===================================================================

require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');
const blockchainService = require('./services/blockchain.service');
const OTPService = require('./services/otp.service');

const PORT = process.env.PORT || 5000;

// Initialize services
async function initializeServices() {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize blockchain service
    blockchainService.initialize();
    
    // Setup blockchain event listeners
    // blockchainService.setupEventListeners(); // Uncomment if you add this method
    
    // Clean expired OTPs periodically (every 1 hour)
    setInterval(() => {
      OTPService.cleanExpiredOTPs();
    }, 60 * 60 * 1000);
    
    console.log('✅ All services initialized');
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
   console.log(`🔍 Starting server on PORT: ${PORT} (from env: ${process.env.PORT})`);
  await initializeServices();
  
  app.listen(PORT, '0.0.0.0', () => {  // ⭐ Added '0.0.0.0'
    console.log('');
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   KRISHI RAKSHA API SERVER RUNNING    ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log('');
    console.log(`🚀 Server:         http://localhost:${PORT}`);
    console.log(`📡 API Endpoint:   http://localhost:${PORT}/api`);
    console.log(`❤️  Health Check:  http://localhost:${PORT}/health`);
    console.log(`⛓️  Blockchain:     Connected to Celo Alfajores`);
    console.log(`📦 Database:       Connected to Supabase`);
    console.log('');
    console.log('Available Routes:');
    console.log('  POST /api/auth/send-phone-otp');
    console.log('  POST /api/auth/verify-phone-otp');
    console.log('  POST /api/auth/send-email-otp');
    console.log('  POST /api/auth/verify-email-otp');
    console.log('  POST /api/auth/register');
    console.log('  POST /api/auth/login');
    console.log('  GET  /api/auth/me');
    console.log('  GET  /api/farmers/dashboard');
    console.log('  POST /api/farmers/predict-yield');
    console.log('  PUT  /api/farmers/profile');
    console.log('  GET  /api/farmers/:id');
    console.log('  POST /api/claims');
    console.log('  GET  /api/claims');
    console.log('  GET  /api/blockchain/claim/:claimId');
    console.log('');
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();