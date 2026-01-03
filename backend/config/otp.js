// ===================================================================
// FILE 3: backend/config/otp.js
// SMS OTP Configuration (using Twilio)
// ===================================================================

const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendPhoneOTP = async (phoneNumber, otp) => {
  try {
    await client.messages.create({
      body: `Your KRISHI RAKSHA verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber, // Format: +91XXXXXXXXXX
    });
    console.log('✅ SMS sent to:', phoneNumber);
    return true;
  } catch (error) {
    console.error('❌ SMS send failed:', error.message);
    return false;
  }
};

module.exports = { sendPhoneOTP };