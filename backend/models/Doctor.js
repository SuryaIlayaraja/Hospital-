const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    studies: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    specialization: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
doctorSchema.index({ name: 1 });
doctorSchema.index({ isActive: 1, displayOrder: 1 });

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;



