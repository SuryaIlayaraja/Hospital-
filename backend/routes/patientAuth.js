const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { getSupabase } = require("../lib/supabase");

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

router.post("/request-otp", async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    if (!phone || phone.length < 10) {
      return res.status(400).json({ success: false, message: "Valid phone is required" });
    }

    const supabase = getSupabase();
    const now = new Date();
    const otp = generateOtp();
    const otpHash = hashOtp(phone, otp);
    const otpExpiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    const { data: existing } = await supabase
      .from("patients")
      .select("otp_last_sent_at")
      .eq("phone", phone)
      .maybeSingle();

    if (existing?.otp_last_sent_at) {
      const secondsSince = Math.floor(
        (now.getTime() - new Date(existing.otp_last_sent_at).getTime()) / 1000
      );
      if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${OTP_RESEND_COOLDOWN_SECONDS - secondsSince}s before requesting OTP again`,
        });
      }
    }

    const { error } = await supabase.from("patients").upsert(
      {
        phone,
        otp_hash: otpHash,
        otp_expires_at: otpExpiresAt,
        otp_last_sent_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
      { onConflict: "phone" }
    );

    if (error) throw error;

    console.log(`[OTP] phone=${phone} otp=${otp} expires=${otpExpiresAt}`);

    res.json({
      success: true,
      message: "OTP sent",
      data: { phone, expiresAt: otpExpiresAt },
      ...(OTP_DEV_RETURN ? { otp } : {}),
    });
  } catch (error) {
    console.error("request-otp error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    const otp = String(req.body?.otp || "").trim();
    if (!phone || phone.length < 10 || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Phone and 6-digit OTP are required",
      });
    }

    const supabase = getSupabase();
    const { data: patient, error } = await supabase
      .from("patients")
      .select("id, otp_hash, otp_expires_at")
      .eq("phone", phone)
      .maybeSingle();

    if (error || !patient || !patient.otp_hash || !patient.otp_expires_at) {
      return res.status(401).json({ success: false, message: "OTP not requested" });
    }

    if (new Date(patient.otp_expires_at).getTime() < Date.now()) {
      return res.status(401).json({ success: false, message: "OTP expired" });
    }

    if (patient.otp_hash !== hashOtp(phone, otp)) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    await supabase
      .from("patients")
      .update({
        is_verified: true,
        otp_hash: null,
        otp_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", patient.id);

    const token = jwt.sign(
      { patientId: patient.id, phone, role: "Patient" },
      JWT_SECRET,
      { expiresIn: PATIENT_JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      patient: { id: patient.id, phone, isVerified: true },
      data: { token, patient: { id: patient.id, phone, isVerified: true } },
    });
  } catch (error) {
    console.error("verify-otp error:", error);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
});

module.exports = router;
