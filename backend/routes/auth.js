const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getSupabase } = require("../lib/supabase");
const { authenticate } = require("../middleware/authMiddleware");
const { departmentRowToClient } = require("../lib/mappers");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

async function fetchUserWithDepartment(userId) {
  const supabase = getSupabase();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, role, department_id, department_name, is_active, last_login, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();
  if (error || !user) return null;

  let department = null;
  if (user.department_id) {
    const { data: dept } = await supabase
      .from("departments")
      .select("*")
      .eq("id", user.department_id)
      .maybeSingle();
    if (dept) department = departmentRowToClient(dept);
  }

  return { ...user, department };
}

router.post("/request-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, is_active")
      .ilike("email", email.toLowerCase())
      .maybeSingle();

    if (error || !user) {
      // For security, still return success but don't do anything
      return res.json({
        success: true,
        message: "If your email is registered, you will receive an OTP shortly.",
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact administrator.",
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    const { error: updateError } = await supabase
      .from("users")
      .update({
        otp_code: otp,
        otp_expires_at: expiresAt,
        otp_last_sent_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("OTP update error:", updateError);
      return res.status(500).json({ success: false, message: "Failed to generate OTP" });
    }

    const { sendOTPEmail } = require("../lib/email");
    await sendOTPEmail(email, otp);

    // MOCK EMAIL SENDING - In production, use NodeMailer, SendGrid, etc.
    console.log("------------------------------------------");
    console.log(`[AUTH] OTP for ${email}: ${otp}`);
    console.log("------------------------------------------");

    res.json({
      success: true,
      message: "OTP sent successfully to your registered email.",
    });
  } catch (e) {
    console.error("Request OTP error:", e);
    res.status(500).json({ success: false, message: "Failed to process request." });
  }
});

router.post("/login-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .ilike("email", email.toLowerCase())
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or OTP",
      });
    }

    if (user.otp_code !== otp.trim()) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP code",
      });
    }

    const now = new Date();
    const expiresAt = new Date(user.otp_expires_at);
    if (now > expiresAt) {
      return res.status(401).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated.",
      });
    }

    // Clear OTP and update last login
    await supabase
      .from("users")
      .update({
        otp_code: null,
        otp_expires_at: null,
        last_login: now.toISOString(),
      })
      .eq("id", user.id);

    const full = await fetchUserWithDepartment(user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        department: user.department_id,
        departmentName: user.department_name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userData = {
      id: full.id,
      email: full.email,
      role: full.role,
      department: full.department,
      departmentName: full.department_name,
      lastLogin: full.last_login,
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
      data: { token, user: userData },
    });
  } catch (e) {
    console.error("OTP login error:", e);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  // Keeping this for backward compatibility if needed, but UI will use OTP
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Hardcoded Admin Fallback
    if (email.toLowerCase() === "suryailayarajaprof@gmail.com" && password === "COO@2026") {
      const adminUser = {
        id: "00000000-0000-0000-0000-000000000000",
        email: "suryailayarajaprof@gmail.com",
        role: "COO",
        department: null,
        departmentName: null,
        lastLogin: new Date().toISOString()
      };

      const token = jwt.sign(
        {
          userId: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          department: adminUser.department,
          departmentName: adminUser.departmentName,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        message: "Login successful",
        token,
        user: adminUser,
        data: { token, user: adminUser },
      });
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .ilike("email", email.toLowerCase())
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact administrator.",
      });
    }

    // Fallback: if password is 'admin123' (special case or for development)
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    const full = await fetchUserWithDepartment(user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        department: user.department_id,
        departmentName: user.department_name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userData = {
      id: full.id,
      email: full.email,
      role: full.role,
      department: full.department,
      departmentName: full.department_name,
      lastLogin: full.last_login,
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
      data: { token, user: userData },
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
});

router.post("/verify", authenticate, async (req, res) => {
  try {
    const full = await fetchUserWithDepartment(req.user.userId);
    if (!full) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const userData = {
      id: full.id,
      email: full.email,
      role: full.role,
      department: full.department,
      departmentName: full.department_name,
      lastLogin: full.last_login,
    };

    res.json({
      success: true,
      user: userData,
      data: { user: userData },
    });
  } catch (e) {
    console.error("Token verification error:", e);
    res.status(500).json({ success: false, message: "Token verification failed" });
  }
});

router.post("/change-password", authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
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

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, password")
      .eq("id", req.user.userId)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await supabase.from("users").update({ password: hash }).eq("id", user.id);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (e) {
    console.error("Change password error:", e);
    res.status(500).json({ success: false, message: "Failed to change password" });
  }
});

router.post("/seed-users", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: departments, error: dErr } = await supabase
      .from("departments")
      .select("id, department_name")
      .order("serial_number", { ascending: true });

    if (dErr) throw dErr;
    if (!departments?.length) {
      return res.status(400).json({
        success: false,
        message: "No departments found. Please seed departments first.",
      });
    }

    await supabase.from("users").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const rows = [
      {
        email: "suryailayarajaprof@gmail.com",
        password: bcrypt.hashSync("COO@2026", 10),
        role: "COO",
        department_id: null,
        department_name: null,
        is_active: true,
      },
    ];

    for (const dept of departments) {
      const deptEmail = dept.department_name
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");
      rows.push({
        email: `${deptEmail}@hospital.com`,
        password: bcrypt.hashSync("Super@2026", 10),
        role: "Supervisor",
        department_id: dept.id,
        department_name: dept.department_name,
        is_active: true,
      });
    }

    const { error: insErr } = await supabase.from("users").insert(rows);
    if (insErr) throw insErr;

    res.json({
      success: true,
      message: "Users seeded successfully",
      count: rows.length,
      users: rows.map((u) => ({
        email: u.email,
        role: u.role,
        department: u.department_name,
      })),
    });
  } catch (e) {
    console.error("Error seeding users:", e);
    res.status(500).json({
      success: false,
      message: "Failed to seed users",
      error: e.message,
    });
  }
});

router.get("/users", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "COO") {
      return res.status(403).json({
        success: false,
        message: "Access denied. COO only.",
      });
    }

    const supabase = getSupabase();
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, role, department_id, department_name, is_active, last_login, created_at, updated_at")
      .order("role")
      .order("email");

    if (error) throw error;

    const withDept = [];
    for (const u of users || []) {
      let department = null;
      if (u.department_id) {
        const { data: dept } = await supabase
          .from("departments")
          .select("*")
          .eq("id", u.department_id)
          .maybeSingle();
        if (dept) department = departmentRowToClient(dept);
      }
      withDept.push({
        id: u.id,
        email: u.email,
        role: u.role,
        department,
        departmentName: u.department_name,
        isActive: u.is_active,
        lastLogin: u.last_login,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      });
    }

    res.json({ success: true, data: withDept, count: withDept.length });
  } catch (e) {
    console.error("Error fetching users:", e);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

module.exports = router;
