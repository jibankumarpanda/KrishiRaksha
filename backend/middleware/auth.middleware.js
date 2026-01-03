// ===================================================================
// FILE: backend/middleware/auth.middleware.js
// ===================================================================

const jwt = require('jsonwebtoken');
const FarmerModel = require('../models/farmer.model');

// Verify JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // For development/testing, accept mock token
    if (token === 'mock-jwt-token-12345') {
      req.farmerId = 'mock-farmer-id-12345';
      req.farmer = {
        id: 'mock-farmer-id-12345',
        name: 'Test Farmer',
        email: 'test@example.com',
        phone: '+919876543210',
        is_phone_verified: true,
        is_email_verified: true
      };
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get farmer from database
    const farmer = await FarmerModel.findById(decoded.id);
    
    if (!farmer) {
      return res.status(401).json({ error: 'Farmer not found' });
    }
    
    // Attach farmer to request
    req.farmer = farmer;
    req.farmerId = farmer.id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Verify MetaMask signature (optional additional security)
exports.verifyMetaMask = async (req, res, next) => {
  try {
    const { metamaskAddress, signature, message } = req.body;
    
    if (!metamaskAddress || !signature || !message) {
      return res.status(400).json({ error: 'MetaMask verification data missing' });
    }
    
    // Verify signature matches address
    const { ethers } = require('ethers');
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== metamaskAddress.toLowerCase()) {
      return res.status(401).json({ error: 'MetaMask signature verification failed' });
    }
    
    // Check if address matches farmer's registered address
    if (req.farmer.metamask_address?.toLowerCase() !== metamaskAddress.toLowerCase()) {
      return res.status(401).json({ error: 'MetaMask address mismatch' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'MetaMask verification failed' });
  }
};

// Check if phone is verified
exports.requirePhoneVerified = (req, res, next) => {
  if (!req.farmer.is_phone_verified) {
    return res.status(403).json({ error: 'Phone verification required' });
  }
  next();
};

// Check if email is verified
exports.requireEmailVerified = (req, res, next) => {
  if (!req.farmer.is_email_verified) {
    return res.status(403).json({ error: 'Email verification required' });
  }
  next();
};