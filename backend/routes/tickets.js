const express = require("express");
const Ticket = require("../models/Ticket");
const { authenticate } = require("../middleware/authMiddleware");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Get all tickets
router.get("/all", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
  }
});

// Create a new ticket
router.post("/create", async (req, res) => {
  try {
    const { title, description, severity, department, issueCategory } = req.body;

    // Validate required fields
    if (!title || !severity || !department || !issueCategory) {
      return res.status(400).json({
        success: false,
        message: "Title, severity, department, and issue category are required",
      });
    }

    // Validate issueCategory
    const validCategories = ["Delay", "Misbehavior", "Overcharging", "Hygiene", "Equipment"];
    if (!validCategories.includes(issueCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue category",
      });
    }

    // Generate unique ID
    const id = `TICKET-${Date.now()}`;

    // Generate patient chat token (return once; store only hash)
    const patientChatToken = crypto.randomBytes(24).toString("hex");
    const patientChatTokenHash = crypto
      .createHash("sha256")
      .update(patientChatToken)
      .digest("hex");

    const ticket = new Ticket({
      id,
      title,
      description: description || "",
      severity,
      department,
      issueCategory,
      status: "open",
      patientChatTokenHash,
    });

    // If patient JWT is provided, attach ownership
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET);
        if (decoded?.role === "Patient" && decoded?.patientId) {
          ticket.patientId = decoded.patientId;
          ticket.patientPhone = decoded.phone || null;
        }
      }
    } catch {
      // ignore invalid patient token (ticket can still be created anonymously)
    }

    await ticket.save();

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
      patientChatToken,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create ticket",
    });
  }
});

// Update ticket status
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["open", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const ticket = await Ticket.findOneAndUpdate(
      { id },
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.json({
      success: true,
      message: "Ticket updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update ticket",
    });
  }
});

// Delete a ticket
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findOneAndDelete({ id });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete ticket",
    });
  }
});

// Get tickets by department (auth-protected)
router.get("/department/:departmentName", authenticate, async (req, res) => {
  try {
    const { departmentName } = req.params;

    // Supervisors can only access their own department's tickets
    if (
      req.user.role === "Supervisor" &&
      req.user.departmentName !== departmentName
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own department's tickets.",
      });
    }

    const tickets = await Ticket.find({
      department: { $regex: new RegExp(`^${departmentName}$`, "i") },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  } catch (error) {
    console.error("Error fetching department tickets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department tickets",
    });
  }
});

// Get escalated tickets (>24h old, not resolved) - COO only
router.get("/escalated", authenticate, async (req, res) => {
  try {
    // Only COO can view escalated tickets
    if (req.user.role !== "COO") {
      return res.status(403).json({
        success: false,
        message: "Access denied. COO only.",
      });
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const escalatedTickets = await Ticket.find({
      status: { $ne: "resolved" },
      createdAt: { $lt: twentyFourHoursAgo },
    }).sort({ createdAt: 1 }); // Oldest first

    res.json({
      success: true,
      data: escalatedTickets,
      count: escalatedTickets.length,
    });
  } catch (error) {
    console.error("Error fetching escalated tickets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch escalated tickets",
    });
  }
});

module.exports = router;
