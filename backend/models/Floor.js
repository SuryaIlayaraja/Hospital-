const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema(
  {
    floorNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    floorName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    departments: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
floorSchema.index({ floorNumber: 1 });

const Floor = mongoose.model("Floor", floorSchema);

module.exports = Floor;



