const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// ============================================
// AUTHENTICATE - Verify JWT Token
// ============================================
const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login.",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      department: decoded.department,
      departmentName: decoded.departmentName,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }
    
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please login again.",
    });
  }
};

// ============================================
// REQUIRE COO - Restrict to COO only
// ============================================
const requireCOO = (req, res, next) => {
  if (req.user.role !== "COO") {
    return res.status(403).json({
      success: false,
      message: "Access denied. COO privileges required.",
    });
  }
  next();
};

// ============================================
// REQUIRE ROLE - Flexible role checking
// ============================================
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

// ============================================
// FILTER BY DEPARTMENT - Add department filter to query
// ============================================
const filterByDepartment = (req, res, next) => {
  // If user is COO, no filter needed (access to all)
  if (req.user.role === "COO") {
    req.departmentFilter = {}; // No filter
  } else if (req.user.departmentName) {
    // Supervisor - filter by their department
    req.departmentFilter = { department: req.user.departmentName };
  } else {
    // No department assigned - no access
    req.departmentFilter = { _id: null }; // Will match nothing
  }
  
  next();
};

module.exports = {
  authenticate,
  requireCOO,
  requireRole,
  filterByDepartment,
};
