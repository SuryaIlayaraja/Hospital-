const mongoose = require("mongoose");

// Schema for escalation level personnel
const EscalationLevelSchema = new mongoose.Schema({
  designation: {
    type: String,
    required: true,
    trim: true,
  },
  access: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    default: "",
  },
  phone: {
    type: String,
    trim: true,
    default: "",
  },
});

const departmentSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    departmentName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    // First Level - Ward/Unit Supervisors
    firstLevel: {
      type: EscalationLevelSchema,
      required: true,
    },
    // Second Level - Department Heads/Managers
    secondLevel: {
      type: EscalationLevelSchema,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// COO Schema - Single entity for the organization
const cooSchema = new mongoose.Schema(
  {
    designation: {
      type: String,
      required: true,
      default: "COO",
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    access: {
      type: String,
      required: true,
      default: "All Departments",
      trim: true,
    },
    wardAccess: {
      type: String,
      required: true,
      default: "All Wards",
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update the updatedAt field before saving
departmentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

departmentSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

cooSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

cooSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Department = mongoose.model("Department", departmentSchema);
const COO = mongoose.model("COO", cooSchema);

module.exports = { Department, COO };
