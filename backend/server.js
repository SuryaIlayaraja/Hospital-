const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const feedbackRoutes = require("./routes/feedback");
const ticketRoutes = require("./routes/tickets");
const floorRoutes = require("./routes/floors");
const doctorRoutes = require("./routes/doctors");
const departmentRoutes = require("./routes/departments");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - must be before other middleware
// Allow all origins in development, specific origin in production
const corsOptions = {
  origin: process.env.NODE_ENV === "production" 
    ? (process.env.FRONTEND_URL || "http://localhost:5173")
    : true, // Allow all origins in development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200, // Support legacy browsers
};
app.use(cors(corsOptions));

// Security middleware - configure helmet to not interfere with CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for development
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req, res) => process.env.NODE_ENV !== "production", // Disable in development
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/hospital-feedback";
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/floors", floorRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/departments", departmentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Hospital Feedback API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hospital Feedback API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: {
        login: "POST /api/auth/login",
        verify: "POST /api/auth/verify",
        changePassword: "POST /api/auth/change-password",
        seedUsers: "POST /api/auth/seed-users",
        getUsers: "GET /api/auth/users",
      },
      feedback: {
        submitOPD: "POST /api/feedback/opd",
        submitIPD: "POST /api/feedback/ipd",
        getAll: "GET /api/feedback/all",
        getOPD: "GET /api/feedback/opd",
        getIPD: "GET /api/feedback/ipd",
        getStats: "GET /api/feedback/stats",
      },
      tickets: {
        getAll: "GET /api/tickets/all",
        create: "POST /api/tickets/create",
        update: "PUT /api/tickets/:id",
        delete: "DELETE /api/tickets/:id",
      },
      floors: {
        getAll: "GET /api/floors/all",
        getOne: "GET /api/floors/:id",
        create: "POST /api/floors/create",
        update: "PUT /api/floors/:id",
        delete: "DELETE /api/floors/:id",
      },
      doctors: {
        getAll: "GET /api/doctors/all",
        getActive: "GET /api/doctors/active",
        getOne: "GET /api/doctors/:id",
        create: "POST /api/doctors/create",
        update: "PUT /api/doctors/:id",
        delete: "DELETE /api/doctors/:id",
      },
      departments: {
        getAll: "GET /api/departments/all",
        getOne: "GET /api/departments/:id",
        create: "POST /api/departments/create",
        update: "PUT /api/departments/:id",
        delete: "DELETE /api/departments/:id",
        getHierarchy: "GET /api/departments/:id/hierarchy",
        getCOO: "GET /api/departments/coo/info",
        updateCOO: "PUT /api/departments/coo/update",
        seed: "POST /api/departments/seed",
      },
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
  console.log(`📝 API Documentation: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
