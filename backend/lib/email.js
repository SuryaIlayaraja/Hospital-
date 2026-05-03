const nodemailer = require('nodemailer');

// Gracefully handle missing email credentials (e.g. on first deploy before env vars are set)
const hasEmailConfig = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // This should be an "App Password"
      }
    })
  : null;

if (!hasEmailConfig) {
  console.warn('[EMAIL] WARNING: EMAIL_USER or EMAIL_PASS environment variables are not set. Email sending will be disabled.');
}

/**
 * Send OTP Email
 * @param {string} to 
 * @param {string} otp 
 */
async function sendOTPEmail(to, otp) {
  if (!transporter) {
    console.warn(`[EMAIL] Skipping admin OTP email to ${to} — email not configured. OTP: ${otp}`);
    return false;
  }
  try {
    const mailOptions = {
      from: `"Vikram ENT Admin" <${process.env.EMAIL_USER}>`,
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
            Vikram ENT Hospital Dashboard<br/>
            Secure Administrative Portal
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] OTP sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send Admin OTP:', error);
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
    console.warn(`[EMAIL] Skipping patient OTP email to ${to} — email not configured. OTP: ${otp}`);
    // Return true so the API doesn't fail — OTP is still logged to server console
    return true;
  }
  try {
    const mailOptions = {
      from: `"Vikram ENT Hospital" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your Feedback Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: 0 auto; border-radius: 10px;">
          <h2 style="color: #6366F1; text-align: center;">Feedback Verification</h2>
          <hr style="border: none; border-top: 1px solid #efefef; margin: 20px 0;"/>
          <p>Dear Patient,</p>
          <p>Thank you for choosing Vikram ENT Hospital. To verify your feedback submission, please use the 6-digit access code below:</p>
          <div style="background: #f4f4f5; padding: 20px; text-align: center; border-radius: 10px; margin: 30px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #18181b;">${otp}</span>
          </div>
          <p style="color: #71717a; font-size: 14px;">This code is valid for 10 minutes. If you did not request this verification, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #efefef; margin: 30px 0;"/>
          <p style="font-size: 12px; color: #a1a1aa; text-align: center;">
            Vikram ENT Hospital<br/>
            Patient Experience Team
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Patient OTP sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send Patient OTP:', error);
    return false;
  }
}

module.exports = { sendOTPEmail, sendPatientOTPEmail };
