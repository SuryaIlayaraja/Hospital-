const express = require("express");
const Ticket = require("../models/Ticket");

const router = express.Router();

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

    const ticket = new Ticket({
      id,
      title,
      description: description || "",
      severity,
      department,
      issueCategory,
      status: "open",
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
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

module.exports = router;
