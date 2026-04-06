const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dns = require("dns");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
require("dotenv").config();

// Fix for DNS resolution issues with MongoDB Atlas on some Windows environments
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const feedbackRoutes = require("./routes/feedback");
const ticketRoutes = require("./routes/tickets");
const floorRoutes = require("./routes/floors");
const doctorRoutes = require("./routes/doctors");
const departmentRoutes = require("./routes/departments");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const patientAuthRoutes = require("./routes/patientAuth");
const settingsRoutes = require("./routes/settings");
const testimonialRoutes = require("./routes/testimonials");
const {
  findTicketById,
  insertChatMessage,
  markAllMessagesRead,
} = require("./lib/socketDb");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - must be before other middleware
// Allow all origins in development, specific origin in production
const corsOptions = {
  origin: true, // Allow any origin that makes the request (required for dynamic subdomains + credentials)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-chat-token"],
  credentials: true,
  optionsSuccessStatus: 200, // Support legacy browsers
};
app.use(cors(corsOptions));

// Security middleware - configure helmet to not interfere with CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
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

// Ensure uploads directory exists and serve it
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Supabase: tables must exist (run supabase/migrations/001_initial_schema.sql). Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
try {
  const { getSupabase } = require("./lib/supabase");
  getSupabase();
  console.log("✅ Supabase client initialized");
} catch (e) {
  console.error("❌ Supabase configuration error:", e.message);
  process.exit(1);
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patient-auth", patientAuthRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/floors", floorRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/testimonials", testimonialRoutes);

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

const httpServer = http.createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: corsOptions,
});

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

const getAdminFromHandshake = (socket) => {
  try {
    const authToken = socket.handshake.auth?.token;
    const authHeader =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      "";

    console.log("[Socket Auth] Full handshake auth object:", {
      auth: Object.keys(socket.handshake.auth || {}),
      authTokenValue: authToken ? `${authToken.substring(0, 30)}...` : null,
      authHeader: authHeader ? `${authHeader.substring(0, 30)}...` : null,
      hasBearer: authHeader.startsWith("Bearer "),
    });

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      console.log("[Socket Auth] No token found after extraction");
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("[Socket Auth] Admin authenticated:", {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      departmentName: decoded.departmentName,
    };
  } catch (error) {
    console.log("[Socket Auth] Admin authentication failed:", error.message);
    return null;
  }
};

const getPatientTokenFromHandshake = (socket) => {
  const t = socket.handshake.auth?.chatToken;
  return typeof t === "string" ? t : "";
};

const getPatientJwtFromHandshake = (socket) => {
  const t = socket.handshake.auth?.patientToken;
  return typeof t === "string" ? t : "";
};

const cryptoHash = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

io.on("connection", (socket) => {
  const admin = getAdminFromHandshake(socket);
  socket.data.role = admin ? "admin" : "patient";
  socket.data.userId = admin?.userId;
  socket.data.chatToken = admin ? null : getPatientTokenFromHandshake(socket);
  socket.data.patientToken = admin ? null : getPatientJwtFromHandshake(socket);
  socket.data.clerkUserId = admin ? null : socket.handshake.auth?.clerkUserId;
  socket.data.patientId = null;

  if (admin) {
    socket.join("admins");
  }

  socket.on("join_ticket", async ({ ticketId }) => {
    try {
      if (!ticketId) return;

      console.log(
        `[Chat] ${socket.data.role} trying to join ticket: ${ticketId}`,
      );

      // Patient must prove access token for this ticket
      if (socket.data.role === "patient") {
        if (socket.data.patientToken) {
          let decoded;
          try {
            decoded = jwt.verify(socket.data.patientToken, JWT_SECRET);
          } catch {
            socket.emit("join_error", {
              ticketId,
              message: "Invalid patient token",
            });
            return;
          }
          if (decoded?.role !== "Patient" || !decoded?.patientId) {
            socket.emit("join_error", { ticketId, message: "Unauthorized" });
            return;
          }
          socket.data.patientId = decoded.patientId;
          const t = await findTicketById(ticketId);
          if (
            !t ||
            !t.patient_id ||
            String(t.patient_id) !== String(decoded.patientId)
          ) {
            socket.emit("join_error", {
              ticketId,
              message: "Ticket not found or access denied",
            });
            return;
          }
        } else {
          const token = socket.data.chatToken;
          if (!token) {
            socket.emit("join_error", {
              ticketId,
              message: "No chat token provided",
            });
            return;
          }
          const tokenHash = cryptoHash(token);
          const t = await findTicketById(ticketId);
          console.log(
            `[join_ticket] ticketId=${ticketId} tokenHash=${tokenHash} storedHash=${t?.patient_chat_token_hash}`,
          );
          if (
            !t ||
            !t.patient_chat_token_hash ||
            t.patient_chat_token_hash !== tokenHash
          ) {
            socket.emit("join_error", {
              ticketId,
              message: "Invalid or missing chat token",
            });
            return;
          }
        }
      }

      socket.join(`ticket:${ticketId}`);
      io.to(`ticket:${ticketId}`).emit("presence", {
        ticketId,
        adminOnline: getRoomCount(io, `ticket:${ticketId}`, "admin") > 0,
        patientOnline: getRoomCount(io, `ticket:${ticketId}`, "patient") > 0,
      });
    } catch (error) {
      console.error("join_ticket error:", error);
      socket.emit("join_error", {
        ticketId,
        message: "Server error joining ticket",
      });
    }
  });

  socket.on("leave_ticket", ({ ticketId }) => {
    if (!ticketId) return;
    socket.leave(`ticket:${ticketId}`);
    io.to(`ticket:${ticketId}`).emit("presence", {
      ticketId,
      adminOnline: getRoomCount(io, `ticket:${ticketId}`, "admin") > 0,
      patientOnline: getRoomCount(io, `ticket:${ticketId}`, "patient") > 0,
    });
  });

  socket.on("typing", ({ ticketId, isTyping }) => {
    if (!ticketId) return;
    socket.to(`ticket:${ticketId}`).emit("typing", {
      ticketId,
      from: socket.data.role,
      isTyping: !!isTyping,
    });
  });

  socket.on("mark_read", async ({ ticketId }) => {
    try {
      if (!ticketId) return;
      const now = new Date();
      const role = socket.data.role;
      const field =
        role === "admin" ? "adminAt" : role === "patient" ? "patientAt" : null;
      if (!field) return;

      await markAllMessagesRead(ticketId, field, now.toISOString());

      io.to(`ticket:${ticketId}`).emit("read_receipt", {
        ticketId,
        role,
        readAt: now.toISOString(),
      });
    } catch (error) {
      console.error("Socket mark_read error:", error);
    }
  });

  socket.on("send_message", async ({ ticketId, message, attachments }) => {
    try {
      const cleanMessage = typeof message === "string" ? message.trim() : "";
      const cleanAttachments = Array.isArray(attachments) ? attachments : [];
      if (!ticketId || (!cleanMessage && cleanAttachments.length === 0)) return;

      // Patient must be authorized for this ticket
      if (socket.data.role === "patient") {
        if (socket.data.patientToken) {
          let decoded;
          try {
            decoded = jwt.verify(socket.data.patientToken, JWT_SECRET);
          } catch {
            socket.emit("chat_error", { message: "Invalid patient token" });
            return;
          }
          if (decoded?.role !== "Patient" || !decoded?.patientId) {
            socket.emit("chat_error", { message: "Unauthorized" });
            return;
          }
          const t = await findTicketById(ticketId);
          if (
            !t ||
            !t.patient_id ||
            String(t.patient_id) !== String(decoded.patientId)
          ) {
            socket.emit("chat_error", { message: "Access denied" });
            return;
          }
        } else {
          const token = socket.data.chatToken;
          if (!token) {
            socket.emit("chat_error", { message: "No chat token" });
            return;
          }
          const tokenHash = cryptoHash(token);
          const t = await findTicketById(ticketId);
          if (
            !t ||
            !t.patient_chat_token_hash ||
            t.patient_chat_token_hash !== tokenHash
          ) {
            socket.emit("chat_error", { message: "Invalid chat token" });
            return;
          }
        }
      }

      const senderType = socket.data.role === "admin" ? "admin" : "patient";

      const doc = await insertChatMessage({
        ticket_id: ticketId,
        sender_type: senderType,
        sender_id: socket.data.userId ? String(socket.data.userId) : null,
        message: cleanMessage,
        attachments: cleanAttachments,
      });

      io.to(`ticket:${ticketId}`).emit("new_message", doc);
      io.to("admins").emit("ticket_message", { ticketId, message: doc });
    } catch (error) {
      console.error("Socket send_message error:", error);
      socket.emit("chat_error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    // broadcast presence updates for any joined ticket rooms
    try {
      for (const room of socket.rooms) {
        if (typeof room === "string" && room.startsWith("ticket:")) {
          const ticketId = room.substring("ticket:".length);
          io.to(room).emit("presence", {
            ticketId,
            adminOnline: getRoomCount(io, room, "admin") > 0,
            patientOnline: getRoomCount(io, room, "patient") > 0,
          });
        }
      }
    } catch {
      // ignore
    }
  });
});

function getRoomCount(ioInstance, roomName, role) {
  const room = ioInstance.sockets.adapter.rooms.get(roomName);
  if (!room) return 0;
  let count = 0;
  for (const socketId of room) {
    const s = ioInstance.sockets.sockets.get(socketId);
    if (s?.data?.role === role) count += 1;
  }
  return count;
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`,
  );
  console.log(`📝 API Documentation: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});
