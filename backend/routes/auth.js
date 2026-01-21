const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { Department } = require("../models/Department");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// JWT Secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ============================================
// LOGIN
// ============================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).populate(
      "department"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact administrator.",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        department: user.department?._id || null,
        departmentName: user.departmentName || null,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return success with token and user info
    // Providing both flat and wrapped 'data' for backwards compatibility
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      department: user.department,
      departmentName: user.departmentName,
      lastLogin: user.lastLogin,
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
      data: {
        token,
        user: userData,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// ============================================
// VERIFY TOKEN
// ============================================
router.post("/verify", authenticate, async (req, res) => {
  try {
    // If authenticate middleware passes, token is valid
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("department");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      department: user.department,
      departmentName: user.departmentName,
      lastLogin: user.lastLogin,
    };

    res.json({
      success: true,
      user: userData,
      data: {
        user: userData,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Token verification failed",
    });
  }
});

// ============================================
// CHANGE PASSWORD
// ============================================
router.post("/change-password", authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify old password
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
});

// ============================================
// SEED USERS (Development/Setup)
// ============================================
router.post("/seed-users", async (req, res) => {
  try {
    // Clear existing users
    await User.deleteMany({});

    // Get all departments
    const departments = await Department.find().sort({ serialNumber: 1 });

    if (departments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No departments found. Please seed departments first.",
      });
    }

    const users = [];

    // Create COO account data
    const cooData = {
      email: "coo@hospital.com",
      password: "COO@2026",
      role: "COO",
      department: null,
      departmentName: null,
      isActive: true,
    };
    users.push(cooData);

    // Create supervisor account data for each department
    for (const dept of departments) {
      const deptEmail = dept.departmentName
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");

      const supervisorData = {
        email: `${deptEmail}@hospital.com`,
        password: "Super@2026",
        role: "Supervisor",
        department: dept._id,
        departmentName: dept.departmentName,
        isActive: true,
      };
      users.push(supervisorData);
    }

    // Save all users. We save them individually so that the 'save' middleware 
    // in the User model is guaranteed to run and hash the passwords.
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }

    res.json({
      success: true,
      message: "Users seeded successfully",
      count: users.length,
      users: users.map((u) => ({
        email: u.email,
        role: u.role,
        department: u.departmentName,
      })),
    });
  } catch (error) {
    console.error("Error seeding users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed users",
      error: error.message,
    });
  }
});

// ============================================
// GET ALL USERS (COO only)
// ============================================
router.get("/users", authenticate, async (req, res) => {
  try {
    // Only COO can view all users
    if (req.user.role !== "COO") {
      return res.status(403).json({
        success: false,
        message: "Access denied. COO only.",
      });
    }

    const users = await User.find()
      .select("-password")
      .populate("department")
      .sort({ role: 1, email: 1 });

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

module.exports = router;
