const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const PATIENT_JWT_EXPIRES_IN = process.env.PATIENT_JWT_EXPIRES_IN || "7d";

const OTP_TTL_MINUTES = parseInt(process.env.OTP_TTL_MINUTES || "5", 10);
const OTP_RESEND_COOLDOWN_SECONDS = parseInt(
  process.env.OTP_RESEND_COOLDOWN_SECONDS || "30",
  10
);
const OTP_DEV_RETURN = process.env.NODE_ENV !== "production";

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(phone, otp) {
  const secret = process.env.OTP_HASH_SECRET || JWT_SECRET;
  return crypto
    .createHash("sha256")
    .update(`${secret}:${phone}:${otp}`)
    .digest("hex");
}

// Request OTP
router.post("/request-otp", async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    if (!phone || phone.length < 10) {
      return res.status(400).json({ success: false, message: "Valid phone is required" });
    }

    const now = new Date();
    const otp = generateOtp();
    const otpHash = hashOtp(phone, otp);
    const otpExpiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

    const existing = await Patient.findOne({ phone }).select("+otpLastSentAt");
    if (existing?.otpLastSentAt) {
      const secondsSince = Math.floor((now.getTime() - existing.otpLastSentAt.getTime()) / 1000);
      if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${OTP_RESEND_COOLDOWN_SECONDS - secondsSince}s before requesting OTP again`,
        });
      }
    }

    const patient = await Patient.findOneAndUpdate(
      { phone },
      {
        $set: {
          phone,
          otpHash,
          otpExpiresAt,
          otpLastSentAt: now,
        },
      },
      { upsert: true, new: true }
    );

    // TODO: integrate SMS provider (Twilio, etc). For now: log OTP.
    console.log(`[OTP] phone=${phone} otp=${otp} expires=${otpExpiresAt.toISOString()}`);

    res.json({
      success: true,
      message: "OTP sent",
      data: { phone, expiresAt: otpExpiresAt.toISOString() },
      ...(OTP_DEV_RETURN ? { otp } : {}),
    });
  } catch (error) {
    console.error("request-otp error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    const otp = String(req.body?.otp || "").trim();
    if (!phone || phone.length < 10 || otp.length !== 6) {
      return res.status(400).json({ success: false, message: "Phone and 6-digit OTP are required" });
    }

    const patient = await Patient.findOne({ phone }).select("+otpHash +otpExpiresAt");
    if (!patient || !patient.otpHash || !patient.otpExpiresAt) {
      return res.status(401).json({ success: false, message: "OTP not requested" });
    }

    if (patient.otpExpiresAt.getTime() < Date.now()) {
      return res.status(401).json({ success: false, message: "OTP expired" });
    }

    const expected = patient.otpHash;
    const provided = hashOtp(phone, otp);
    if (expected !== provided) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    patient.isVerified = true;
    patient.otpHash = undefined;
    patient.otpExpiresAt = undefined;
    await patient.save();

    const token = jwt.sign(
      { patientId: patient._id, phone, role: "Patient" },
      JWT_SECRET,
      { expiresIn: PATIENT_JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      patient: { id: patient._id, phone, isVerified: true },
      data: { token, patient: { id: patient._id, phone, isVerified: true } },
    });
  } catch (error) {
    console.error("verify-otp error:", error);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
});

module.exports = router;

