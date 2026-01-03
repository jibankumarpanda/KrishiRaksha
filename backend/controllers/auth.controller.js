// ===================================================================
// FILE: backend/controllers/auth.controller.js
// Authentication Controller - Phone OTP, Email, Password, Registration
// ===================================================================

const FarmerModel = require('../models/farmer.model');
const OTPService = require('../services/otp.service');
const jwt = require('jsonwebtoken');

class AuthController {
  // STEP 1: Send phone OTP
  async sendPhoneOTP(req, res) {
    try {
      const { phone } = req.body;

      // Check if farmer already exists
      const existingFarmer = await FarmerModel.findByPhone(phone);
      if (existingFarmer && existingFarmer.is_phone_verified) {
        return res.status(400).json({ 
          error: 'Phone number already registered. Please login.' 
        });
      }

      // Send OTP
      const result = await OTPService.sendPhoneOTP(phone);

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'OTP sent to your phone',
      });
    } catch (error) {
      console.error('Send phone OTP error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // STEP 2: Verify phone OTP
  async verifyPhoneOTP(req, res) {
    try {
      const { phone, otp } = req.body;

      const result = await OTPService.verifyOTP(phone, otp, 'phone');

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'Phone verified successfully',
      });
    } catch (error) {
      console.error('Verify phone OTP error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // STEP 3: Send email OTP
  async sendEmailOTP(req, res) {
    try {
      const { email } = req.body;

      // Check if email already exists
      const existingFarmer = await FarmerModel.findByEmail(email);
      if (existingFarmer && existingFarmer.is_email_verified) {
        return res.status(400).json({ 
          error: 'Email already registered. Please login.' 
        });
      }

      // Send OTP
      const result = await OTPService.sendEmailOTP(email);

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'OTP sent to your email',
      });
    } catch (error) {
      console.error('Send email OTP error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // STEP 4: Verify email OTP
  async verifyEmailOTP(req, res) {
    try {
      const { email, otp } = req.body;

      const result = await OTPService.verifyOTP(email, otp, 'email');

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      console.error('Verify email OTP error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // STEP 5: Complete farmer registration (one-time)
  async register(req, res) {
    try {
      const {
        phone,
        email,
        password,
        name,
        village,
        district,
        state,
        landSizeAcres,
        cropType,
        upiId,
        bankAccountNumber,
        bankIfscCode,
        bankName,
        farmerPhotoUrl,
        farmPhotoUrl,
      } = req.body;

      // Check if farmer already exists
      const existingFarmer = await FarmerModel.findByPhone(phone);
      if (existingFarmer) {
        return res.status(400).json({ error: 'Farmer already registered' });
      }

      // Create farmer
      const farmer = await FarmerModel.create({
        phone,
        email,
        password,
        name,
        village,
        district,
        state,
        landSizeAcres,
        cropType,
        upiId,
        bankAccountNumber,
        bankIfscCode,
        bankName,
        farmerPhotoUrl,
        farmPhotoUrl,
      });

      // Mark phone and email as verified
      await FarmerModel.verifyPhone(farmer.id);
      await FarmerModel.verifyEmail(farmer.id);

      // Generate JWT token
      const token = jwt.sign(
        { id: farmer.id, phone: farmer.phone },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        farmer: {
          id: farmer.id,
          name: farmer.name,
          phone: farmer.phone,
          email: farmer.email,
        },
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Login with phone + password
  async login(req, res) {
    try {
      const { phone, password } = req.body;

      // Find farmer
      const farmer = await FarmerModel.findByPhone(phone);
      if (!farmer) {
        return res.status(401).json({ error: 'Invalid phone or password' });
      }

      // Verify password
      const isValidPassword = await FarmerModel.verifyPassword(
        password,
        farmer.password_hash
      );

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid phone or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: farmer.id, phone: farmer.phone },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        farmer: {
          id: farmer.id,
          name: farmer.name,
          phone: farmer.phone,
          email: farmer.email,
          metamaskAddress: farmer.metamask_address,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get current farmer (using JWT token)
  async getCurrentFarmer(req, res) {
    try {
      const farmer = req.farmer; // Set by auth middleware

      res.json({
        success: true,
        farmer: {
          id: farmer.id,
          name: farmer.name,
          phone: farmer.phone,
          email: farmer.email,
          village: farmer.village,
          district: farmer.district,
          state: farmer.state,
          landSizeAcres: farmer.land_size_acres,
          cropType: farmer.crop_type,
          upiId: farmer.upi_id,
          bankAccountNumber: farmer.bank_account_number,
          metamaskAddress: farmer.metamask_address,
          isPhoneVerified: farmer.is_phone_verified,
          isEmailVerified: farmer.is_email_verified,
        },
      });
    } catch (error) {
      console.error('Get farmer error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Connect MetaMask wallet
  async connectMetaMask(req, res) {
    try {
      const { metamaskAddress } = req.body;
      const farmerId = req.farmerId;

      await FarmerModel.updateMetaMaskAddress(farmerId, metamaskAddress);

      res.json({
        success: true,
        message: 'MetaMask wallet connected successfully',
        metamaskAddress,
      });
    } catch (error) {
      console.error('MetaMask connect error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();