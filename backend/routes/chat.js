const express = require("express");
const path = require("path");
const multer = require("multer");
const ChatMessage = require("../models/ChatMessage");
const { authenticate } = require("../middleware/authMiddleware");
const Ticket = require("../models/Ticket");
const crypto = require("crypto");

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const requireTicketAccess = async (req, res, next) => {
  try {
    // Admin access (JWT)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // could be admin OR patient JWT; authenticate will parse and attach req.user
      await new Promise((resolve) => authenticate(req, res, resolve));
      if (req.user?.role === "Patient") {
        const { ticketId } = req.params;
        const t = await Ticket.findOne({ id: ticketId });
        if (!t || !t.patientId || String(t.patientId) !== String(req.user.patientId)) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
      }
      return next();
    }

    // Patient access (ticket token)
    const token =
      (typeof req.headers["x-chat-token"] === "string" ? req.headers["x-chat-token"] : "") ||
      (typeof req.query.token === "string" ? req.query.token : "");

    if (!token) {
      return res.status(401).json({ success: false, message: "Missing chat token" });
    }

    const { ticketId } = req.params;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const t = await Ticket.findOne({ id: ticketId }).select("+patientChatTokenHash");
    if (!t || !t.patientChatTokenHash || t.patientChatTokenHash !== tokenHash) {
      return res.status(403).json({ success: false, message: "Invalid chat token" });
    }

    req.patient = { ticketId };
    next();
  } catch (error) {
    console.error("requireTicketAccess error:", error);
    res.status(500).json({ success: false, message: "Failed to authorize chat access" });
  }
};

// Get chat history for a ticket (public: patient has no auth in current app)
router.get("/:ticketId", requireTicketAccess, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);

    const messages = await ChatMessage.find({ ticketId })
      .sort({ createdAt: 1 })
      .limit(limit);

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
});

// Upload a file/image for a ticket chat (admin OR patient-with-token)
router.post("/:ticketId/upload", requireTicketAccess, upload.single("file"), async (req, res) => {
  try {
    const { ticketId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "File is required" });
    }

    const isImage = typeof req.file.mimetype === "string" && req.file.mimetype.startsWith("image/");
    const url = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      data: {
        ticketId,
        kind: isImage ? "image" : "file",
        url,
        name: req.file.originalname,
        mime: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Error uploading chat file:", error);
    res.status(500).json({ success: false, message: "Failed to upload file" });
  }
});

// Send message via REST (admin-only; patients should use socket)
router.post("/:ticketId", authenticate, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const attachments = Array.isArray(req.body?.attachments) ? req.body.attachments : [];
    if (!message && attachments.length === 0) {
      return res.status(400).json({ success: false, message: "Message or attachment is required" });
    }

    const doc = await ChatMessage.create({
      ticketId,
      senderType: "admin",
      senderId: req.user?.userId,
      message,
      attachments,
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error("Error sending chat message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

// Mark chat as read (admin-only; patient read is via socket for now)
router.post("/:ticketId/read", authenticate, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const role = "admin";
    const now = new Date();

    await ChatMessage.updateMany(
      { ticketId, "readBy.adminAt": { $exists: false } },
      { $set: { "readBy.adminAt": now } }
    );

    res.json({ success: true, data: { ticketId, role, readAt: now.toISOString() } });
  } catch (error) {
    console.error("Error marking chat as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark read" });
  }
});

module.exports = router;

