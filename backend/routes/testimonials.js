const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { authenticate, requireCOO } = require("../middleware/authMiddleware");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET all testimonials
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new testimonial (COO only)
router.post("/", authenticate, requireCOO, async (req, res) => {
  try {
    const { name, role, hospital, text, image, order_index } = req.body;
    
    if (!name || !role || !text) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("testimonials")
      .insert([{ name, role, hospital, text, image, order_index: order_index || 0 }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE testimonial (COO only)
router.put("/:id", authenticate, requireCOO, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, hospital, text, image, order_index } = req.body;

    const { data, error } = await supabase
      .from("testimonials")
      .update({ name, role, hospital, text, image, order_index, updated_at: new Date() })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE all testimonials (COO only)
router.delete("/", authenticate, requireCOO, async (req, res) => {
  try {
    const { error } = await supabase.from("testimonials").delete().neq("id", 0); // Delete all
    if (error) throw error;
    res.json({ success: true, message: "All testimonials deleted successfully" });
  } catch (error) {
    console.error("Error deleting all testimonials:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE testimonial by ID (COO only)
router.delete("/:id", authenticate, requireCOO, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
