const express = require("express");
const Doctor = require("../models/Doctor");

const router = express.Router();

// Debug: Log all requests to doctors routes
router.use((req, res, next) => {
  console.log(`[Doctors Route] ${req.method} ${req.path}`);
  next();
});

// Test endpoint to verify routes are working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Doctors routes are working!",
  });
});

// Get all doctors
router.get("/all", async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .select("-__v");
    res.json({
      success: true,
      data: doctors,
      count: doctors.length,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
});

// Get active doctors only
router.get("/active", async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select("-__v");
    res.json({
      success: true,
      data: doctors,
      count: doctors.length,
    });
  } catch (error) {
    console.error("Error fetching active doctors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active doctors",
    });
  }
});

// Get a single doctor by ID
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-__v");
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
    });
  }
});

// Create a new doctor
router.post("/create", async (req, res) => {
  try {
    console.log("Doctor create request received:", req.body);
    const { name, studies, specialization, displayOrder, image } = req.body;

    // Validate required fields
    if (!name || !studies) {
      return res.status(400).json({
        success: false,
        message: "Name and studies are required",
      });
    }

    // Validate image size if it's a base64 string (max 5MB)
    if (image && image.startsWith("data:image")) {
      const base64Length = image.length - (image.indexOf(",") + 1);
      const sizeInBytes = (base64Length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      if (sizeInMB > 5) {
        return res.status(400).json({
          success: false,
          message: "Image size exceeds 5MB limit. Please use a smaller image.",
        });
      }
    }

    const doctor = new Doctor({
      name,
      studies,
      specialization: specialization || "",
      image: image || "",
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      isActive: true,
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor,
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

// Update a doctor
router.put("/:id", async (req, res) => {
  try {
    console.log("Doctor update request received for ID:", req.params.id);
    const { name, studies, specialization, isActive, displayOrder, image } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Validate image size if it's a base64 string (max 5MB)
    if (image && image.startsWith("data:image")) {
      const base64Length = image.length - (image.indexOf(",") + 1);
      const sizeInBytes = (base64Length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      if (sizeInMB > 5) {
        return res.status(400).json({
          success: false,
          message: "Image size exceeds 5MB limit. Please use a smaller image.",
        });
      }
    }

    // Update fields
    if (name !== undefined) doctor.name = name;
    if (studies !== undefined) doctor.studies = studies;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (isActive !== undefined) doctor.isActive = isActive === "true" || isActive === true;
    if (displayOrder !== undefined) doctor.displayOrder = parseInt(displayOrder);
    if (image !== undefined) doctor.image = image;

    await doctor.save();

    res.json({
      success: true,
      message: "Doctor updated successfully",
      data: doctor,
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

// Delete a doctor
router.delete("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await Doctor.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Doctor deleted successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
    });
  }
});

module.exports = router;

