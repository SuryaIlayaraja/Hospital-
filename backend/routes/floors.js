const express = require("express");
const Floor = require("../models/Floor");

const router = express.Router();

// Get all floors
router.get("/all", async (req, res) => {
  try {
    const floors = await Floor.find().sort({ floorNumber: 1 });
    res.json({
      success: true,
      data: floors,
      count: floors.length,
    });
  } catch (error) {
    console.error("Error fetching floors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch floors",
    });
  }
});

// Get a single floor by ID
router.get("/:id", async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.id);
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }
    res.json({
      success: true,
      data: floor,
    });
  } catch (error) {
    console.error("Error fetching floor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch floor",
    });
  }
});

// Create a new floor
router.post("/create", async (req, res) => {
  try {
    const { floorNumber, floorName, description, departments } = req.body;

    // Validate required fields
    if (!floorNumber || !floorName) {
      return res.status(400).json({
        success: false,
        message: "Floor number and floor name are required",
      });
    }

    // Check if floor number already exists
    const existingFloor = await Floor.findOne({ floorNumber });
    if (existingFloor) {
      return res.status(400).json({
        success: false,
        message: "Floor number already exists",
      });
    }

    const floor = new Floor({
      floorNumber,
      floorName,
      description: description || "",
      departments: departments || [],
      isActive: true,
    });

    await floor.save();

    res.status(201).json({
      success: true,
      message: "Floor created successfully",
      data: floor,
    });
  } catch (error) {
    console.error("Error creating floor:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Floor number already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create floor",
    });
  }
});

// Update a floor
router.put("/:id", async (req, res) => {
  try {
    const { floorNumber, floorName, description, departments, isActive } = req.body;

    // Check if floor exists
    const floor = await Floor.findById(req.params.id);
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    // If floor number is being changed, check if new number already exists
    if (floorNumber && floorNumber !== floor.floorNumber) {
      const existingFloor = await Floor.findOne({ floorNumber });
      if (existingFloor) {
        return res.status(400).json({
          success: false,
          message: "Floor number already exists",
        });
      }
    }

    // Update floor
    if (floorNumber !== undefined) floor.floorNumber = floorNumber;
    if (floorName !== undefined) floor.floorName = floorName;
    if (description !== undefined) floor.description = description;
    if (departments !== undefined) floor.departments = departments;
    if (isActive !== undefined) floor.isActive = isActive;

    await floor.save();

    res.json({
      success: true,
      message: "Floor updated successfully",
      data: floor,
    });
  } catch (error) {
    console.error("Error updating floor:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Floor number already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update floor",
    });
  }
});

// Delete a floor
router.delete("/:id", async (req, res) => {
  try {
    const floor = await Floor.findByIdAndDelete(req.params.id);
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    res.json({
      success: true,
      message: "Floor deleted successfully",
      data: floor,
    });
  } catch (error) {
    console.error("Error deleting floor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete floor",
    });
  }
});

module.exports = router;



