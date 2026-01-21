const express = require("express");
const { Department, COO } = require("../models/Department");

const router = express.Router();

// ============================================
// DEPARTMENT ROUTES
// ============================================

// Get all departments
router.get("/all", async (req, res) => {
  try {
    const departments = await Department.find().sort({ serialNumber: 1 });
    res.json({
      success: true,
      data: departments,
      count: departments.length,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
});

// Get a single department by ID
router.get("/:id", async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }
    res.json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department",
    });
  }
});

// Create a new department
router.post("/create", async (req, res) => {
  try {
    const { departmentName, firstLevel, secondLevel } = req.body;

    // Validate required fields
    if (!departmentName || !firstLevel || !secondLevel) {
      return res.status(400).json({
        success: false,
        message: "Department name, first level, and second level are required",
      });
    }

    // Validate first level structure
    if (!firstLevel.designation || !firstLevel.access) {
      return res.status(400).json({
        success: false,
        message: "First level designation and access are required",
      });
    }

    // Validate second level structure
    if (!secondLevel.designation || !secondLevel.access) {
      return res.status(400).json({
        success: false,
        message: "Second level designation and access are required",
      });
    }

    // Get the next serial number
    const lastDepartment = await Department.findOne().sort({ serialNumber: -1 });
    const nextSerialNumber = lastDepartment ? lastDepartment.serialNumber + 1 : 1;

    const department = new Department({
      serialNumber: nextSerialNumber,
      departmentName,
      firstLevel: {
        designation: firstLevel.designation,
        access: firstLevel.access,
        email: firstLevel.email || "",
        phone: firstLevel.phone || "",
      },
      secondLevel: {
        designation: secondLevel.designation,
        access: secondLevel.access,
        email: secondLevel.email || "",
        phone: secondLevel.phone || "",
      },
    });

    await department.save();

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Department with this name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create department",
    });
  }
});

// Update a department
router.put("/:id", async (req, res) => {
  try {
    const { departmentName, firstLevel, secondLevel, isActive } = req.body;

    const updateData = {};
    if (departmentName) updateData.departmentName = departmentName;
    if (firstLevel) {
      updateData.firstLevel = {
        designation: firstLevel.designation,
        access: firstLevel.access,
        email: firstLevel.email || "",
        phone: firstLevel.phone || "",
      };
    }
    if (secondLevel) {
      updateData.secondLevel = {
        designation: secondLevel.designation,
        access: secondLevel.access,
        email: secondLevel.email || "",
        phone: secondLevel.phone || "",
      };
    }
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Department with this name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update department",
    });
  }
});

// Delete a department
router.delete("/:id", async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete department",
    });
  }
});

// ============================================
// COO ROUTES
// ============================================

// Get COO (there should only be one)
router.get("/coo/info", async (req, res) => {
  try {
    let coo = await COO.findOne();
    
    // If no COO exists, create a default one
    if (!coo) {
      coo = new COO({
        designation: "COO",
        name: "Chief Operating Officer",
        access: "All Departments",
        wardAccess: "All Wards",
      });
      await coo.save();
    }

    res.json({
      success: true,
      data: coo,
    });
  } catch (error) {
    console.error("Error fetching COO:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch COO information",
    });
  }
});

// Update COO
router.put("/coo/update", async (req, res) => {
  try {
    const { designation, name, access, wardAccess, email, phone, isActive } = req.body;

    let coo = await COO.findOne();

    if (!coo) {
      // Create new COO if doesn't exist
      coo = new COO({
        designation: designation || "COO",
        name: name || "Chief Operating Officer",
        access: access || "All Departments",
        wardAccess: wardAccess || "All Wards",
        email: email || "",
        phone: phone || "",
      });
    } else {
      // Update existing COO
      if (designation) coo.designation = designation;
      if (name) coo.name = name;
      if (access) coo.access = access;
      if (wardAccess) coo.wardAccess = wardAccess;
      if (email !== undefined) coo.email = email;
      if (phone !== undefined) coo.phone = phone;
      if (typeof isActive === "boolean") coo.isActive = isActive;
    }

    await coo.save();

    res.json({
      success: true,
      message: "COO updated successfully",
      data: coo,
    });
  } catch (error) {
    console.error("Error updating COO:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update COO",
    });
  }
});

// Get escalation hierarchy for a specific department
router.get("/:id/hierarchy", async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const coo = await COO.findOne();

    res.json({
      success: true,
      data: {
        departmentName: department.departmentName,
        firstLevel: department.firstLevel,
        secondLevel: department.secondLevel,
        nextLevel: coo || {
          designation: "COO",
          access: "All Departments",
          wardAccess: "All Wards",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching department hierarchy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department hierarchy",
    });
  }
});

// Seed initial departments (for development/setup)
router.post("/seed", async (req, res) => {
  try {
    const initialDepartments = [
      {
        serialNumber: 1,
        departmentName: "Nursing",
        firstLevel: { designation: "Nursing Supervisor", access: "Particular Ward" },
        secondLevel: { designation: "Chief Nursing Officer", access: "All Wards of Nursing Department" },
      },
      {
        serialNumber: 2,
        departmentName: "Operations",
        firstLevel: { designation: "Operations Executive", access: "Particular Ward" },
        secondLevel: { designation: "Head Operations / Manager", access: "All Wards of Operations Department" },
      },
      {
        serialNumber: 3,
        departmentName: "House Keeping",
        firstLevel: { designation: "House Keeping Supervisor", access: "Particular Ward" },
        secondLevel: { designation: "House Keeping Manager", access: "All Wards of House Keeping Department" },
      },
      {
        serialNumber: 4,
        departmentName: "Maintenance",
        firstLevel: { designation: "Maintenance Supervisor", access: "Particular Ward" },
        secondLevel: { designation: "Maintenance Manager", access: "All Wards of Maintenance Department" },
      },
      {
        serialNumber: 5,
        departmentName: "Medical",
        firstLevel: { designation: "Deputy Medical Superintendant", access: "Particular Ward" },
        secondLevel: { designation: "Medical Superintendant", access: "All Wards of Medical Department" },
      },
      {
        serialNumber: 6,
        departmentName: "F&B",
        firstLevel: { designation: "Dietician", access: "Particular Ward" },
        secondLevel: { designation: "F&B Manager", access: "All Wards of F&B Department" },
      },
      {
        serialNumber: 7,
        departmentName: "Security",
        firstLevel: { designation: "Assistant Security Officer", access: "Particular Ward" },
        secondLevel: { designation: "Security Officer", access: "All Wards of Security Department" },
      },
      {
        serialNumber: 8,
        departmentName: "Transport",
        firstLevel: { designation: "Ambulance/Transport Incharge", access: "All Wards" },
        secondLevel: { designation: "Transport Manager", access: "All Wards of Transport Department" },
      },
      {
        serialNumber: 9,
        departmentName: "IT",
        firstLevel: { designation: "IT Executive", access: "All Wards" },
        secondLevel: { designation: "IT Manager", access: "All Wards" },
      },
      {
        serialNumber: 10,
        departmentName: "Laundry",
        firstLevel: { designation: "Laundry Supervisor", access: "All Wards" },
        secondLevel: { designation: "Laundry Manager", access: "All Wards" },
      },
      {
        serialNumber: 11,
        departmentName: "Billing",
        firstLevel: { designation: "Asst Manager Billing", access: "All Wards" },
        secondLevel: { designation: "Billing Manager", access: "All Wards" },
      },
      {
        serialNumber: 12,
        departmentName: "Insurance / TPA",
        firstLevel: { designation: "Asst Manager Insurance", access: "All Wards" },
        secondLevel: { designation: "Billing Manager", access: "All Wards" },
      },
      {
        serialNumber: 13,
        departmentName: "MRD",
        firstLevel: { designation: "Asst Manager Medical Records", access: "All Wards" },
        secondLevel: { designation: "Manager Medical Records", access: "All Wards" },
      },
      {
        serialNumber: 14,
        departmentName: "Lab",
        firstLevel: { designation: "Lab Incharge", access: "All Wards" },
        secondLevel: { designation: "Head of Lab Services", access: "All Wards" },
      },
      {
        serialNumber: 15,
        departmentName: "Radiology",
        firstLevel: { designation: "Radiology In Charge", access: "All Wards" },
        secondLevel: { designation: "Head of Radiology Services", access: "All Wards" },
      },
      {
        serialNumber: 16,
        departmentName: "Blood Bank",
        firstLevel: { designation: "Blood Bank In Charge", access: "All Wards" },
        secondLevel: { designation: "Head of Blood Bank", access: "All Wards" },
      },
    ];

    // Clear existing departments
    await Department.deleteMany({});

    // Insert new departments
    await Department.insertMany(initialDepartments);

    // Create/Update COO
    await COO.deleteMany({});
    await COO.create({
      designation: "COO",
      name: "Chief Operating Officer",
      access: "All Departments",
      wardAccess: "All Wards",
    });

    res.json({
      success: true,
      message: "Departments seeded successfully",
      count: initialDepartments.length,
    });
  } catch (error) {
    console.error("Error seeding departments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed departments",
    });
  }
});

module.exports = router;
