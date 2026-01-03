// ===================================================================
// FILE: backend/services/otp.service.js
// ===================================================================

const OTPModel = require('../models/otp.model');
const { sendPhoneOTP } = require('../config/otp');
const { sendVerificationEmail } = require('../config/mail');

class OTPService {
  // Generate 6-digit OTP
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send phone OTP
  static async sendPhoneOTP(phone) {
    try {
      const otp = this.generateOTP();
      
      // Save to database
      await OTPModel.create(phone, otp, 'phone');
      
      // Send via Twilio
      await sendPhoneOTP(phone, otp);
      
      return { success: true, message: 'OTP sent to phone' };
    } catch (error) {
      console.error('Send phone OTP failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send email OTP
  static async sendEmailOTP(email) {
    try {
      const otp = this.generateOTP();
      
      // Save to database
      await OTPModel.create(email, otp, 'email');
      
      // Send via Gmail
      await sendVerificationEmail(email, otp);
      
      return { success: true, message: 'OTP sent to email' };
    } catch (error) {
      console.error('Send email OTP failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Verify OTP
  static async verifyOTP(identifier, otp, type) {
    try {
      const otpRecord = await OTPModel.findValid(identifier, otp, type);
      
      if (!otpRecord) {
        return { success: false, error: 'Invalid or expired OTP' };
      }
      
      // Mark as verified
      await OTPModel.markAsVerified(otpRecord.id);
      
      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('Verify OTP failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean expired OTPs (run periodically)
  static async cleanExpiredOTPs() {
    try {
      await OTPModel.deleteExpired();
      console.log('✅ Expired OTPs cleaned');
    } catch (error) {
      console.error('Clean OTPs failed:', error);
    }
  }
}

module.exports = OTPService;
