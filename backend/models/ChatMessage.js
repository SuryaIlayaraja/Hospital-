const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    senderType: {
      type: String,
      required: true,
      enum: ["admin", "patient"],
    },
    senderId: {
      type: String,
      required: false,
      trim: true,
    },
    message: {
      type: String,
      required: false,
      trim: true,
      maxlength: 2000,
    },
    attachments: [
      {
        kind: {
          type: String,
          required: true,
          enum: ["file", "image"],
        },
        url: { type: String, required: true },
        name: { type: String, required: true },
        mime: { type: String, required: false },
        size: { type: Number, required: false },
      },
    ],
    readBy: {
      adminAt: { type: Date, required: false },
      patientAt: { type: Date, required: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);

