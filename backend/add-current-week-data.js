#!/usr/bin/env node

/**
 * Add sample feedback data for current week (December 22-28, 2025)
 */

const mongoose = require("mongoose");
require("dotenv").config();

const { OPDFeedback, IPDFeedback } = require("./models/Feedback");

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

const log = (message, color = "reset") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Generate dates for current week (Monday Dec 22 to Sunday Dec 28, 2025)
const getWeekDates = () => {
  const dates = [];
  const start = new Date(2025, 11, 22); // December 22, 2025 (Monday)
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const weekDates = getWeekDates();
const experiences = ["Excellent", "Good", "Fair", "Poor"];

// Sample OPD data
const generateOPDData = () => {
  const data = [];
  const names = [
    "Rajesh Kumar",
    "Sunita Devi",
    "Vikram Joshi",
    "Priya Singh",
    "Arjun Patel",
  ];

  for (let day = 0; day < weekDates.length; day++) {
    for (let i = 0; i < 2; i++) {
      const date = weekDates[day];
      const name = names[(day * 2 + i) % names.length];
      const experience =
        experiences[Math.floor(Math.random() * experiences.length)];

      data.push({
        name: name + "_OPD_" + day,
        uhid: "UHID" + Math.random().toString().substring(2, 9),
        date: date.toISOString().split("T")[0],
        mobile: "9" + Math.random().toString().substring(2, 11),
        overallExperience: experience,
        appointmentBooking:
          experiences[Math.floor(Math.random() * experiences.length)],
        receptionStaff:
          experiences[Math.floor(Math.random() * experiences.length)],
        billingProcess:
          experiences[Math.floor(Math.random() * experiences.length)],
        nursingCare:
          experiences[Math.floor(Math.random() * experiences.length)],
        labStaffSkilled:
          experiences[Math.floor(Math.random() * experiences.length)],
        labWaitingTime:
          experiences[Math.floor(Math.random() * experiences.length)],
        radiologyStaffSkilled:
          experiences[Math.floor(Math.random() * experiences.length)],
        radiologyWaitingTime:
          experiences[Math.floor(Math.random() * experiences.length)],
        pharmacyWaitingTime:
          experiences[Math.floor(Math.random() * experiences.length)],
        medicationDispensed:
          experiences[Math.floor(Math.random() * experiences.length)],
        drugExplanation:
          experiences[Math.floor(Math.random() * experiences.length)],
        counsellingSession:
          experiences[Math.floor(Math.random() * experiences.length)],
        audiologyStaffSkilled:
          experiences[Math.floor(Math.random() * experiences.length)],
        hospitalCleanliness:
          experiences[Math.floor(Math.random() * experiences.length)],
        nominateEmployee: "Staff member " + i,
        comments: "Test feedback for day " + day,
        timestamp: new Date(
          date.getTime() + Math.random() * 24 * 60 * 60 * 1000
        ),
      });
    }
  }
  return data;
};

// Sample IPD data
const generateIPDData = () => {
  const data = [];
  const names = [
    "Ramesh Agarwal",
    "Meera Patel",
    "Kiran Reddy",
    "Anita Desai",
    "Suresh Nair",
  ];

  for (let day = 0; day < weekDates.length; day++) {
    for (let i = 0; i < 2; i++) {
      const date = weekDates[day];
      const name = names[(day * 2 + i) % names.length];
      const experience =
        experiences[Math.floor(Math.random() * experiences.length)];

      data.push({
        name: name + "_IPD_" + day,
        uhid: "UHID" + Math.random().toString().substring(2, 9),
        date: date.toISOString().split("T")[0],
        mobile: "9" + Math.random().toString().substring(2, 11),
        overallExperience: experience,
        registrationProcess:
          experiences[Math.floor(Math.random() * experiences.length)],
        roomReadiness:
          experiences[Math.floor(Math.random() * experiences.length)],
        roomCleanliness:
          experiences[Math.floor(Math.random() * experiences.length)],
        doctorExplanation:
          experiences[Math.floor(Math.random() * experiences.length)],
        nurseCommunication:
          experiences[Math.floor(Math.random() * experiences.length)],
        planExplanation:
          experiences[Math.floor(Math.random() * experiences.length)],
        promptnessAttending:
          experiences[Math.floor(Math.random() * experiences.length)],
        pharmacyTimeliness:
          experiences[Math.floor(Math.random() * experiences.length)],
        billingCourtesy:
          experiences[Math.floor(Math.random() * experiences.length)],
        operationsHospitality:
          experiences[Math.floor(Math.random() * experiences.length)],
        dischargeProcess:
          experiences[Math.floor(Math.random() * experiences.length)],
        nominateEmployee: "Staff member " + i,
        comments: "Test IPD feedback for day " + day,
        timestamp: new Date(
          date.getTime() + Math.random() * 24 * 60 * 60 * 1000
        ),
      });
    }
  }
  return data;
};

async function main() {
  try {
    log("\n🏥 Adding Feedback Data for Current Week (Dec 22-28, 2025)", "blue");
    log("━".repeat(60), "blue");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hospital-feedback"
    );
    log("✅ Connected to MongoDB", "green");

    // Generate data
    const opdData = generateOPDData();
    const ipdData = generateIPDData();

    // Insert OPD data
    log("\n📝 Adding OPD feedback data...", "yellow");
    const opdResult = await OPDFeedback.insertMany(opdData);
    log(`✅ Added ${opdResult.length} OPD feedback entries`, "green");

    // Insert IPD data
    log("\n📝 Adding IPD feedback data...", "yellow");
    const ipdResult = await IPDFeedback.insertMany(ipdData);
    log(`✅ Added ${ipdResult.length} IPD feedback entries`, "green");

    log("\n🎉 Current week data added successfully!", "green");
    log("The day-wise analysis charts should now display data.", "green");

    await mongoose.connection.close();
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
    process.exit(1);
  }
}

main();
