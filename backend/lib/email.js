const nodemailer = require('nodemailer');

// Brevo (Sendinblue) SMTP - Free tier: 300 emails/day, no domain required
// Sign up at brevo.com, go to SMTP & API > SMTP to get these credentials
const hasEmailConfig = !!(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS);

const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,  // Your Brevo login email
        pass: process.env.BREVO_SMTP_PASS,  // Your Brevo SMTP key (NOT your login password)
      }
    })
  : null;

const FROM_NAME = 'Vikram ENT Hospital';
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || process.env.BREVO_SMTP_USER || 'noreply@vikramhospital.com';

if (!hasEmailConfig) {
  console.warn('[EMAIL] WARNING: BREVO_SMTP_USER or BREVO_SMTP_PASS not set. OTPs will only be logged to console.');
}

/**
 * Send Admin Login OTP Email
 * @param {string} to 
 * @param {string} otp 
 */
async function sendOTPEmail(to, otp) {
  if (!transporter) {
    console.warn(`[EMAIL] Admin OTP for ${to}: ${otp} (email not configured)`);
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME} Admin" <${FROM_EMAIL}>`,
      to,
      subject: 'Your Admin Login Access Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: 0 auto; border-radius: 10px;">
          <h2 style="color: #6366F1; text-align: center;">Secure Admin Login</h2>
          <hr style="border: none; border-top: 1px solid #efefef; margin: 20px 0;"/>
          <p>Hello Administrator,</p>
          <p>To securely access your hospital dashboard, please use the 6-digit access code below:</p>
          <div style="background: #f4f4f5; padding: 20px; text-align: center; border-radius: 10px; margin: 30px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #18181b;">${otp}</span>
          </div>
          <p style="color: #71717a; font-size: 14px;">This code is valid for 10 minutes. If you did not request this login, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #efefef; margin: 30px 0;"/>
          <p style="font-size: 12px; color: #a1a1aa; text-align: center;">
            Vikram ENT Hospital Dashboard<br/>Secure Administrative Portal
          </p>
        </div>
      `
    });
    console.log(`[EMAIL] Admin OTP sent to ${to}`);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send Admin OTP:', error.message);
    return false;
  }
}

/**
 * Send Patient Feedback OTP Email
 * @param {string} to 
 * @param {string} otp 
 */
async function sendPatientOTPEmail(to, otp) {
  if (!transporter) {
    console.warn(`[EMAIL] Patient OTP for ${to}: ${otp} (email not configured — check Render logs)`);
    return true; // return true so the API still responds with success
  }
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: 'Your Feedback Verification Code — Vikram ENT Hospital',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: 0 auto; border-radius: 10px;">
          <h2 style="color: #6366F1; text-align: center;">Feedback Verification</h2>
          <hr style="border: none; border-top: 1px solid #efefef; margin: 20px 0;"/>
          <p>Dear Patient,</p>
          <p>Thank you for choosing Vikram ENT Hospital. To submit your feedback, please use the 6-digit verification code below:</p>
          <div style="background: #f4f4f5; padding: 20px; text-align: center; border-radius: 10px; margin: 30px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #18181b;">${otp}</span>
          </div>
          <p style="color: #71717a; font-size: 14px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #efefef; margin: 30px 0;"/>
          <p style="font-size: 12px; color: #a1a1aa; text-align: center;">
            Vikram ENT Hospital<br/>Patient Experience Team
          </p>
        </div>
      `
    });
    console.log(`[EMAIL] Patient OTP sent to ${to}`);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send Patient OTP:', error.message);
    return false;
  }
}

module.exports = { sendOTPEmail, sendPatientOTPEmail };

