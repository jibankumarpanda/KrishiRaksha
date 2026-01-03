// backend/test-email.js
require('dotenv').config();
const { sendVerificationEmail } = require('./config/mail');

async function testEmail() {
  const email = 'pandajiban331@gmail.com'; // Replace with your email
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Random 6-digit OTP
  
  console.log(`Sending test email to: ${email}`);
  console.log(`Test OTP: ${otp}`);
  
  const success = await sendVerificationEmail(email, otp);
  console.log(success ? '✅ Email sent successfully!' : '❌ Failed to send email');
}

testEmail().catch(console.error);