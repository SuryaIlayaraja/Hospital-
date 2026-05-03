const { Resend } = require('resend');

// Gracefully handle missing Resend API key
const hasEmailConfig = !!(process.env.RESEND_API_KEY);

const resend = hasEmailConfig ? new Resend(process.env.RESEND_API_KEY) : null;

// The "from" address:
//   - If you have NOT verified a domain in Resend, use: onboarding@resend.dev  (works only for sending to your own verified email)
//   - If you HAVE verified a domain (e.g. vikramhospital.com), use: noreply@vikramhospital.com
const FROM_ADDRESS = process.env.RESEND_FROM || 'onboarding@resend.dev';

if (!hasEmailConfig) {
  console.warn('[EMAIL] WARNING: RESEND_API_KEY is not set. OTPs will only be logged to the console.');
}

/**
 * Send Admin Login OTP Email
 * @param {string} to 
 * @param {string} otp 
 */
async function sendOTPEmail(to, otp) {
  if (!resend) {
    console.warn(`[EMAIL] Skipping admin OTP email to ${to} — Resend not configured. OTP: ${otp}`);
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
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
    });
    if (error) {
      console.error('[EMAIL ERROR] Failed to send Admin OTP:', error);
      return false;
    }
    console.log(`[EMAIL] Admin OTP sent to ${to}`);
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
  if (!resend) {
    console.warn(`[EMAIL] Skipping patient OTP email to ${to} — Resend not configured. OTP: ${otp}`);
    // Still return true so the API succeeds — admin can see OTP in Render logs
    return true;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: 'Your Feedback Verification Code — Vikram ENT Hospital',
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
    });
    if (error) {
      console.error('[EMAIL ERROR] Failed to send Patient OTP:', error);
      return false;
    }
    console.log(`[EMAIL] Patient OTP sent to ${to}`);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send Patient OTP:', error);
    return false;
  }
}

module.exports = { sendOTPEmail, sendPatientOTPEmail };

