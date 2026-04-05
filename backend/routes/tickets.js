const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("@clerk/backend");
const { getSupabase } = require("../lib/supabase");
const { authenticate } = require("../middleware/authMiddleware");
const { ticketRowToClient } = require("../lib/mappers");

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

/** Signed-in patient (Clerk): only tickets linked to this user — safe for production. */
router.get("/mine", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }
    const token = authHeader.substring(7);
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      return res.status(503).json({
        success: false,
        message: "Clerk verification is not configured on the server",
      });
    }
    let payload;
    try {
      payload = await verifyToken(token, { secretKey });
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }
    const clerkUserId = payload.sub;
    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: "Invalid session" });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({
      success: true,
      data: (data || []).map(ticketRowToClient),
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching my tickets:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tickets" });
  }
});

/** Staff dashboard only — never expose to anonymous clients. */
router.get("/all", authenticate, async (req, res) => {
  try {
    if (!["COO", "Supervisor"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({
      success: true,
      data: (data || []).map(ticketRowToClient),
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch tickets" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const {
      title,
      description,
      severity,
      department,
      issueCategory,
      clerkUserId,
    } = req.body;

    if (!title || !severity || !department || !issueCategory) {
      return res.status(400).json({
        success: false,
        message: "Title, severity, department, and issue category are required",
      });
    }

    const validCategories = [
      "Delay",
      "Misbehavior",
      "Overcharging",
      "Hygiene",
      "Equipment",
    ];
    if (!validCategories.includes(issueCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue category",
      });
    }
    const id = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const patientChatToken = crypto.randomBytes(24).toString("hex");
    const patientChatTokenHash = crypto
      .createHash("sha256")
      .update(patientChatToken)
      .digest("hex");

    const row = {
      id,
      title,
      description: description || "",
      severity,
      department,
      issue_category: issueCategory,
      status: "open",
      patient_chat_token_hash: patientChatTokenHash,
      ...(clerkUserId ? { clerk_user_id: clerkUserId } : {}),
    };

    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET);
        if (decoded?.role === "Patient" && decoded?.patientId) {
          row.patient_id = decoded.patientId;
          row.patient_phone = decoded.phone || null;
        }
      }
    } catch {
      // ignore
    }

    const supabase = getSupabase();
    let { data, error } = await supabase
      .from("tickets")
      .insert(row)
      .select("*")
      .single();
    // DBs created before migration 006 have no clerk_user_id column — retry without it
    if (
      error &&
      typeof error.message === "string" &&
      error.message.includes("clerk_user_id")
    ) {
      const { clerk_user_id: _drop, ...withoutClerk } = row;
      const retry = await supabase
        .from("tickets")
        .insert(withoutClerk)
        .select("*")
        .single();
      data = retry.data;
      error = retry.error;
    }
    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticketRowToClient(data),
      patientChatToken,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create ticket" });
  }
});

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

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    res.json({
      success: true,
      message: "Ticket updated successfully",
      data: ticketRowToClient(data),
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update ticket" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();
    const { error } = await supabase.from("tickets").delete().eq("id", id);
    if (error) throw error;

    res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete ticket" });
  }
});

router.get("/department/:departmentName", authenticate, async (req, res) => {
  try {
    const { departmentName } = req.params;

    if (
      req.user.role === "Supervisor" &&
      req.user.departmentName !== departmentName
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only view your own department's tickets.",
      });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .ilike("department", departmentName)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: (data || []).map(ticketRowToClient),
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching department tickets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department tickets",
    });
  }
});

router.get("/escalated", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "COO") {
      return res.status(403).json({
        success: false,
        message: "Access denied. COO only.",
      });
    }

    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .neq("status", "resolved")
      .lt("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: (data || []).map(ticketRowToClient),
      count: data?.length || 0,
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
