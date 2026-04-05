const express = require("express");
const { getSupabase } = require("../lib/supabase");
const { doctorRowToClient } = require("../lib/mappers");

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[Doctors Route] ${req.method} ${req.path}`);
  next();
});

router.get("/test", (req, res) => {
  res.json({ success: true, message: "Doctors routes are working!" });
});

router.get("/all", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({
      success: true,
      data: (data || []).map(doctorRowToClient),
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ success: false, message: "Failed to fetch doctors" });
  }
});

router.get("/active", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({
      success: true,
      data: (data || []).map(doctorRowToClient),
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching active doctors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active doctors",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("doctors").select("*").eq("id", req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.json({ success: true, data: doctorRowToClient(data) });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ success: false, message: "Failed to fetch doctor" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { name, studies, specialization, displayOrder, image } = req.body;
    if (!name || !studies) {
      return res.status(400).json({
        success: false,
        message: "Name and studies are required",
      });
    }

    if (image && image.startsWith("data:image")) {
      const base64Length = image.length - (image.indexOf(",") + 1);
      const sizeInBytes = (base64Length * 3) / 4;
      if (sizeInBytes / (1024 * 1024) > 5) {
        return res.status(400).json({
          success: false,
          message: "Image size exceeds 5MB limit. Please use a smaller image.",
        });
      }
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("doctors")
      .insert({
        name,
        studies,
        specialization: specialization || "",
        image: image || "",
        display_order: displayOrder ? parseInt(displayOrder, 10) : 0,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctorRowToClient(data),
    });
  } catch (error) {
    console.error("Error creating doctor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create doctor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, studies, specialization, isActive, displayOrder, image } = req.body;
    const supabase = getSupabase();

    const { data: doctor, error: findErr } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (image && image.startsWith("data:image")) {
      const base64Length = image.length - (image.indexOf(",") + 1);
      const sizeInBytes = (base64Length * 3) / 4;
      if (sizeInBytes / (1024 * 1024) > 5) {
        return res.status(400).json({
          success: false,
          message: "Image size exceeds 5MB limit. Please use a smaller image.",
        });
      }
    }

    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (studies !== undefined) updates.studies = studies;
    if (specialization !== undefined) updates.specialization = specialization;
    if (isActive !== undefined) updates.is_active = isActive === "true" || isActive === true;
    if (displayOrder !== undefined) updates.display_order = parseInt(displayOrder, 10);
    if (image !== undefined) updates.image = image;

    const { data, error } = await supabase
      .from("doctors")
      .update(updates)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Doctor updated successfully",
      data: doctorRowToClient(data),
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update doctor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: doctor } = await supabase.from("doctors").select("*").eq("id", req.params.id).maybeSingle();
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    await supabase.from("doctors").delete().eq("id", req.params.id);
    res.json({
      success: true,
      message: "Doctor deleted successfully",
      data: doctorRowToClient(doctor),
    });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ success: false, message: "Failed to delete doctor" });
  }
});

module.exports = router;
