// ===================================================================
// FILE: backend/routes/auth.routes.js
// REPLACE YOUR EXISTING FILE WITH THIS
// ===================================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validatePhone, validateEmail, validateOTP } = require('../middleware/validation.middleware');

// Step 1: Send phone OTP
router.post('/send-phone-otp', validatePhone, authController.sendPhoneOTP);

// Step 2: Verify phone OTP
router.post('/verify-phone-otp', validatePhone, validateOTP, authController.verifyPhoneOTP);

// Step 3: Send email OTP
router.post('/send-email-otp', validateEmail, authController.sendEmailOTP);

// Step 4: Verify email OTP
router.post('/verify-email-otp', validateEmail, validateOTP, authController.verifyEmailOTP);

// Step 5: Complete registration
router.post('/register', authController.register);

// Login
router.post('/login', validatePhone, authController.login);

// Get current farmer (protected route)
router.get('/me', verifyToken, authController.getCurrentFarmer);

// Connect MetaMask wallet
router.post('/connect-metamask', verifyToken, authController.connectMetaMask);

module.exports = router;