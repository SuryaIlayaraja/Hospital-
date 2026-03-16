const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    issueCategory: {
      type: String,
      required: true,
      enum: ["Delay", "Misbehavior", "Overcharging", "Hygiene", "Equipment"],
      default: "Delay",
    },
    status: {
      type: String,
      required: true,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    // Patient chat access (hash of secret token returned at ticket creation)
    patientChatTokenHash: {
      type: String,
      required: false,
      select: false,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: false,
      index: true,
    },
    patientPhone: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Update the updatedAt field before saving
ticketSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Update the updatedAt field before updating
ticketSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);
