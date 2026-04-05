const express = require("express");
const { getSupabase } = require("../lib/supabase");
const { floorRowToClient } = require("../lib/mappers");

const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("floors")
      .select("*")
      .order("floor_number", { ascending: true });
    if (error) throw error;
    res.json({
      success: true,
      data: (data || []).map(floorRowToClient),
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching floors:", error);
    res.status(500).json({ success: false, message: "Failed to fetch floors" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("floors").select("*").eq("id", req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, message: "Floor not found" });
    }
    res.json({ success: true, data: floorRowToClient(data) });
  } catch (error) {
    console.error("Error fetching floor:", error);
    res.status(500).json({ success: false, message: "Failed to fetch floor" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { floorNumber, floorName, description, departments } = req.body;
    if (!floorNumber || !floorName) {
      return res.status(400).json({
        success: false,
        message: "Floor number and floor name are required",
      });
    }

    const supabase = getSupabase();
    const { data: existing } = await supabase
      .from("floors")
      .select("id")
      .eq("floor_number", floorNumber)
      .maybeSingle();
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Floor number already exists",
      });
    }

    const { data, error } = await supabase
      .from("floors")
      .insert({
        floor_number: floorNumber,
        floor_name: floorName,
        description: description || "",
        departments: Array.isArray(departments) ? departments : [],
        is_active: true,
      })
      .select("*")
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Floor created successfully",
      data: floorRowToClient(data),
    });
  } catch (error) {
    console.error("Error creating floor:", error);
    res.status(500).json({ success: false, message: "Failed to create floor" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { floorNumber, floorName, description, departments, isActive } = req.body;
    const supabase = getSupabase();

    const { data: floor, error: fErr } = await supabase
      .from("floors")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (fErr) throw fErr;
    if (!floor) {
      return res.status(404).json({ success: false, message: "Floor not found" });
    }

    if (floorNumber && floorNumber !== floor.floor_number) {
      const { data: dup } = await supabase
        .from("floors")
        .select("id")
        .eq("floor_number", floorNumber)
        .maybeSingle();
      if (dup && dup.id !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: "Floor number already exists",
        });
      }
    }

    const updates = {
      updated_at: new Date().toISOString(),
    };
    if (floorNumber !== undefined) updates.floor_number = floorNumber;
    if (floorName !== undefined) updates.floor_name = floorName;
    if (description !== undefined) updates.description = description;
    if (departments !== undefined) updates.departments = departments;
    if (isActive !== undefined) updates.is_active = isActive === "true" || isActive === true;

    const { data, error } = await supabase
      .from("floors")
      .update(updates)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Floor updated successfully",
      data: floorRowToClient(data),
    });
  } catch (error) {
    console.error("Error updating floor:", error);
    res.status(500).json({ success: false, message: "Failed to update floor" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: floor } = await supabase.from("floors").select("*").eq("id", req.params.id).maybeSingle();
    if (!floor) {
      return res.status(404).json({ success: false, message: "Floor not found" });
    }
    await supabase.from("floors").delete().eq("id", req.params.id);
    res.json({
      success: true,
      message: "Floor deleted successfully",
      data: floorRowToClient(floor),
    });
  } catch (error) {
    console.error("Error deleting floor:", error);
    res.status(500).json({ success: false, message: "Failed to delete floor" });
  }
});

module.exports = router;
