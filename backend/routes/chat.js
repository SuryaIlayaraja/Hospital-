const express = require("express");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { getSupabase } = require("../lib/supabase");
const { authenticate } = require("../middleware/authMiddleware");
const { chatMessageRowToClient } = require("../lib/mappers");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

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
  limits: { fileSize: 10 * 1024 * 1024 },
});

async function getTicketById(ticketId) {
  const supabase = getSupabase();
  const { data } = await supabase.from("tickets").select("*").eq("id", ticketId).maybeSingle();
  return data;
}

const requireTicketAccess = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    // Per-ticket secret: check first so anonymous tickets work even when the browser
    // also sends a patient OTP JWT (Patient bearer alone requires ticket.patient_id).
    const chatToken =
      (typeof req.headers["x-chat-token"] === "string" ? req.headers["x-chat-token"].trim() : "") ||
      (typeof req.query.token === "string" ? req.query.token.trim() : "");

    if (chatToken) {
      const tokenHash = crypto.createHash("sha256").update(chatToken).digest("hex");
      const t = await getTicketById(ticketId);
      if (t?.patient_chat_token_hash && t.patient_chat_token_hash === tokenHash) {
        req.patient = { ticketId };
        return next();
      }
      // Wrong/missing hash — fall through; Bearer may still authorize linked tickets.
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET);
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          departmentName: decoded.departmentName,
          patientId: decoded.patientId,
          phone: decoded.phone,
        };
      } catch {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }

      if (req.user?.role === "Patient") {
        const t = await getTicketById(ticketId);
        if (
          !t ||
          !t.patient_id ||
          String(t.patient_id) !== String(req.user.patientId)
        ) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
      }
      return next();
    }

    if (chatToken) {
      return res.status(403).json({ success: false, message: "Invalid chat token" });
    }

    return res.status(401).json({ success: false, message: "Missing chat token or authorization" });
  } catch (error) {
    console.error("requireTicketAccess error:", error);
    res.status(500).json({ success: false, message: "Failed to authorize chat access" });
  }
};

router.get("/:ticketId", requireTicketAccess, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;

    res.json({
      success: true,
      data: (data || []).map(chatMessageRowToClient),
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
});

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

router.post("/:ticketId", authenticate, async (req, res) => {
  try {
    if (req.user?.role === "Patient") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const { ticketId } = req.params;
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const attachments = Array.isArray(req.body?.attachments) ? req.body.attachments : [];
    if (!message && attachments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message or attachment is required",
      });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        ticket_id: ticketId,
        sender_type: "admin",
        sender_id: req.user?.userId ? String(req.user.userId) : null,
        message,
        attachments,
      })
      .select("*")
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: chatMessageRowToClient(data) });
  } catch (error) {
    console.error("Error sending chat message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

router.post("/:ticketId/read", authenticate, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const now = new Date().toISOString();
    const supabase = getSupabase();

    const { data: rows, error: fetchErr } = await supabase
      .from("chat_messages")
      .select("id, read_by")
      .eq("ticket_id", ticketId);

    if (fetchErr) throw fetchErr;

    for (const r of rows || []) {
      const rb = { ...(r.read_by || {}), adminAt: now };
      await supabase.from("chat_messages").update({ read_by: rb }).eq("id", r.id);
    }

    res.json({
      success: true,
      data: { ticketId, role: "admin", readAt: now },
    });
  } catch (error) {
    console.error("Error marking chat as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark read" });
  }
});

module.exports = router;
