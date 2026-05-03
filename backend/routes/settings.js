const express = require("express");
const { getSupabase } = require("../lib/supabase");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Get settings
router.get("/", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("hospital_settings")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    // Return current settings or default ones if not found
    const settings = data || {
      hospital_name: "Vikram ENT Hospital",
      hospital_location: "Coimbatore",
      contact_email: "info@vikramhospital.com",
      contact_phone: "+91 422 1234567",
      whatsapp_number: "+91 9876543210",
      chat_support_link: "https://wa.me/919876543210",
      show_testimonials: true,
      years_experience: 55,
      expert_doctors: 20,
      successful_procedures: "5,00,000+",
      lives_touched: "50,00,000+"
    };

    res.json({ success: true, data: settings });
  } catch (e) {
    console.error("Error fetching settings:", e);
    // Always return default values on any DB error to keep the frontend working
    return res.json({
      success: true,
      data: {
        hospital_name: "Vikram ENT Hospital",
        hospital_location: "Coimbatore",
        contact_email: "info@vikramhospital.com",
        contact_phone: "+91 422 1234567",
        whatsapp_number: "+91 9876543210",
        chat_support_link: "https://wa.me/919876543210",
        show_testimonials: true,
        years_experience: 55,
        expert_doctors: 20,
        successful_procedures: "5,00,000+",
        lives_touched: "50,00,000+"
      }
    });
  }
});

// Update settings (COO only)
router.put("/", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "COO") {
      return res.status(403).json({
        success: false,
        message: "Access denied. COO only.",
      });
    }

    const { 
        hospital_name, 
        hospital_location, 
        contact_email, 
        contact_phone, 
        whatsapp_number, 
        chat_support_link,
        show_testimonials,
        years_experience,
        expert_doctors,
        successful_procedures,
        lives_touched
    } = req.body;

    const supabase = getSupabase();
    
    // Check if settings record exists
    const { data: existing } = await supabase
        .from("hospital_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

    let result;
    const updateData = {
        hospital_name,
        hospital_location,
        contact_email,
        contact_phone,
        whatsapp_number,
        chat_support_link,
        show_testimonials,
        years_experience,
        expert_doctors,
        successful_procedures,
        lives_touched,
        updated_at: new Date().toISOString()
    };

    if (existing) {
        result = await supabase
            .from("hospital_settings")
            .update(updateData)
            .eq("id", existing.id);
    } else {
        result = await supabase
            .from("hospital_settings")
            .insert([updateData]);
    }

    if (result.error) throw result.error;

    res.json({ success: true, message: "Settings updated successfully" });
  } catch (e) {
    console.error("Error updating settings:", e);
    
    // Check if table missing
    if (e.message.includes('relation "hospital_settings" does not exist')) {
        return res.status(400).json({ 
            success: false, 
            message: "Database table 'hospital_settings' not found. Please create it in Supabase dashboard first." 
        });
    }
    
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
});

module.exports = router;
