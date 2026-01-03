// backend/config/mail.js
// Using SendGrid (Works on Render/Railway)
// ===================================================================
const sgMail = require('@sendgrid/mail');

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (email, otp) => {
  if (!email || !otp) {
    console.error('❌ Email and OTP are required');
    return false;
  }

  console.log(`📧 Sending OTP via SendGrid to: ${email}`);

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL, // Must be verified in SendGrid
    subject: 'KRISHI RAKSHA - Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1a365d; margin-bottom: 10px;">Welcome to KRISHI RAKSHA! 🌾</h1>
          <p style="color: #4a5568; font-size: 16px;">Your verification code is:</p>
        </div>
        <div style="background: #f7fafc; border: 1px dashed #cbd5e0; padding: 15px; text-align: center; margin: 20px 0; border-radius: 6px;">
          <h2 style="color: #2d3748; font-size: 32px; letter-spacing: 4px; margin: 0; padding: 10px 0;">${otp}</h2>
        </div>
        <p style="color: #4a5568; font-size: 14px; line-height: 1.5;">This code will expire in 10 minutes.</p>
        <p style="color: #718096; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Your KRISHI RAKSHA verification code is: ${otp}\n\nThis code will expire in 10 minutes.`
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email sent successfully via SendGrid:', {
      to: email,
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('❌ SendGrid email failed:', {
      to: email,
      error: error.message,
      response: error.response ? error.response.body : null,
      timestamp: new Date().toISOString()
    });
    return false;
  }
};

module.exports = { sendVerificationEmail };