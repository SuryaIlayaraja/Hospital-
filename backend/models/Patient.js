const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otpHash: {
      type: String,
      required: false,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      required: false,
      select: false,
    },
    otpLastSentAt: {
      type: Date,
      required: false,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);

