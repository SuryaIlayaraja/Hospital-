#!/usr/bin/env node

/**
 * Sample Data Generator for Hospital Feedback System
 * This script adds realistic sample data to MongoDB for testing and demonstration
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { OPDFeedback, IPDFeedback } = require('./models/Feedback');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Sample data
const sampleOPDFeedback = [
  {
    name: 'Rajesh Kumar',
    uhid: 'UHID001234',
    date: '2024-01-15',
    mobile: '9876543210',
    overallExperience: 'Excellent',
    appointmentBooking: 'Excellent',
    receptionStaff: 'Good',
    billingProcess: 'Excellent',
    nursingCare: 'Good',
    labStaffSkilled: 'Excellent',
    labWaitingTime: 'Good',
    radiologyStaffSkilled: 'Excellent',
    radiologyWaitingTime: 'Fair',
    pharmacyWaitingTime: 'Good',
    medicationDispensed: 'Excellent',
    drugExplanation: 'Good',
    counsellingSession: 'Excellent',
    audiologyStaffSkilled: 'Good',
    hospitalCleanliness: 'Excellent',
    nominateEmployee: 'Dr. Sharma was very professional and helpful',
    comments: 'Overall excellent experience. Staff was courteous and efficient.',
    timestamp: new Date('2024-01-15T09:30:00Z')
  },
  {
    name: 'Priya Sharma',
    uhid: 'UHID001235',
    date: '2024-01-15',
    mobile: '9876543211',
    overallExperience: 'Good',
    appointmentBooking: 'Good',
    receptionStaff: 'Excellent',
    billingProcess: 'Good',
    nursingCare: 'Excellent',
    labStaffSkilled: 'Good',
    labWaitingTime: 'Excellent',
    radiologyStaffSkilled: 'Good',
    radiologyWaitingTime: 'Good',
    pharmacyWaitingTime: 'Excellent',
    medicationDispensed: 'Good',
    drugExplanation: 'Excellent',
    counsellingSession: 'Good',
    audiologyStaffSkilled: 'Excellent',
    hospitalCleanliness: 'Good',
    nominateEmployee: 'Nurse Patel provided excellent care',
    comments: 'Good service overall. Could improve waiting times.',
    timestamp: new Date('2024-01-15T11:15:00Z')
  },
  {
    name: 'Amit Singh',
    uhid: 'UHID001236',
    date: '2024-01-16',
    mobile: '9876543212',
    overallExperience: 'Fair',
    appointmentBooking: 'Fair',
    receptionStaff: 'Good',
    billingProcess: 'Fair',
    nursingCare: 'Good',
    labStaffSkilled: 'Fair',
    labWaitingTime: 'Poor',
    radiologyStaffSkilled: 'Good',
    radiologyWaitingTime: 'Fair',
    pharmacyWaitingTime: 'Poor',
    medicationDispensed: 'Good',
    drugExplanation: 'Fair',
    counsellingSession: 'Good',
    audiologyStaffSkilled: 'Fair',
    hospitalCleanliness: 'Good',
    nominateEmployee: '',
    comments: 'Service was okay but waiting times were too long.',
    timestamp: new Date('2024-01-16T14:20:00Z')
  },
  {
    name: 'Sunita Devi',
    uhid: 'UHID001237',
    date: '2024-01-16',
    mobile: '9876543213',
    overallExperience: 'Excellent',
    appointmentBooking: 'Excellent',
    receptionStaff: 'Excellent',
    billingProcess: 'Excellent',
    nursingCare: 'Excellent',
    labStaffSkilled: 'Excellent',
    labWaitingTime: 'Good',
    radiologyStaffSkilled: 'Excellent',
    radiologyWaitingTime: 'Good',
    pharmacyWaitingTime: 'Excellent',
    medicationDispensed: 'Excellent',
    drugExplanation: 'Excellent',
    counsellingSession: 'Excellent',
    audiologyStaffSkilled: 'Excellent',
    hospitalCleanliness: 'Excellent',
    nominateEmployee: 'Dr. Gupta and Nurse Kumar were outstanding',
    comments: 'Exceptional service! Every staff member was professional and caring.',
    timestamp: new Date('2024-01-16T16:45:00Z')
  },
  {
    name: 'Vikram Joshi',
    uhid: 'UHID001238',
    date: '2024-01-17',
    mobile: '9876543214',
    overallExperience: 'Good',
    appointmentBooking: 'Good',
    receptionStaff: 'Good',
    billingProcess: 'Excellent',
    nursingCare: 'Good',
    labStaffSkilled: 'Good',
    labWaitingTime: 'Good',
    radiologyStaffSkilled: 'Good',
    radiologyWaitingTime: 'Good',
    pharmacyWaitingTime: 'Good',
    medicationDispensed: 'Good',
    drugExplanation: 'Good',
    counsellingSession: 'Good',
    audiologyStaffSkilled: 'Good',
    hospitalCleanliness: 'Good',
    nominateEmployee: 'Reception staff was very helpful',
    comments: 'Satisfactory experience. Everything went smoothly.',
    timestamp: new Date('2024-01-17T10:30:00Z')
  }
];

const sampleIPDFeedback = [
  {
    name: 'Ramesh Agarwal',
    uhid: 'UHID002001',
    date: '2024-01-15',
    mobile: '9876543215',
    overallExperience: 'Excellent',
    registrationProcess: 'Excellent',
    roomReadiness: 'Good',
    roomCleanliness: 'Excellent',
    doctorExplanation: 'Excellent',
    nurseCommunication: 'Excellent',
    planExplanation: 'Good',
    promptnessAttending: 'Excellent',
    pharmacyTimeliness: 'Good',
    billingCourtesy: 'Excellent',
    operationsHospitality: 'Excellent',
    dischargeProcess: 'Excellent',
    nominateEmployee: 'Dr. Verma and the entire nursing team were exceptional',
    comments: 'Outstanding care during my stay. The medical team was professional and compassionate.',
    timestamp: new Date('2024-01-15T08:00:00Z')
  },
  {
    name: 'Meera Patel',
    uhid: 'UHID002002',
    date: '2024-01-15',
    mobile: '9876543216',
    overallExperience: 'Good',
    registrationProcess: 'Good',
    roomReadiness: 'Excellent',
    roomCleanliness: 'Good',
    doctorExplanation: 'Good',
    nurseCommunication: 'Excellent',
    planExplanation: 'Good',
    promptnessAttending: 'Good',
    pharmacyTimeliness: 'Excellent',
    billingCourtesy: 'Good',
    operationsHospitality: 'Good',
    dischargeProcess: 'Good',
    nominateEmployee: 'Nurse Singh was very caring',
    comments: 'Good overall experience. Room was clean and comfortable.',
    timestamp: new Date('2024-01-15T12:30:00Z')
  },
  {
    name: 'Kiran Reddy',
    uhid: 'UHID002003',
    date: '2024-01-16',
    mobile: '9876543217',
    overallExperience: 'Fair',
    registrationProcess: 'Fair',
    roomReadiness: 'Good',
    roomCleanliness: 'Fair',
    doctorExplanation: 'Good',
    nurseCommunication: 'Fair',
    planExplanation: 'Fair',
    promptnessAttending: 'Fair',
    pharmacyTimeliness: 'Good',
    billingCourtesy: 'Fair',
    operationsHospitality: 'Good',
    dischargeProcess: 'Fair',
    nominateEmployee: '',
    comments: 'Average experience. Some delays in service delivery.',
    timestamp: new Date('2024-01-16T15:20:00Z')
  },
  {
    name: 'Anita Desai',
    uhid: 'UHID002004',
    date: '2024-01-16',
    mobile: '9876543218',
    overallExperience: 'Excellent',
    registrationProcess: 'Excellent',
    roomReadiness: 'Excellent',
    roomCleanliness: 'Excellent',
    doctorExplanation: 'Excellent',
    nurseCommunication: 'Excellent',
    planExplanation: 'Excellent',
    promptnessAttending: 'Excellent',
    pharmacyTimeliness: 'Excellent',
    billingCourtesy: 'Excellent',
    operationsHospitality: 'Excellent',
    dischargeProcess: 'Excellent',
    nominateEmployee: 'Dr. Kumar and Nurse Sharma provided exceptional care',
    comments: 'Perfect experience! Every aspect of care was excellent.',
    timestamp: new Date('2024-01-16T18:15:00Z')
  },
  {
    name: 'Suresh Nair',
    uhid: 'UHID002005',
    date: '2024-01-17',
    mobile: '9876543219',
    overallExperience: 'Good',
    registrationProcess: 'Good',
    roomReadiness: 'Good',
    roomCleanliness: 'Good',
    doctorExplanation: 'Good',
    nurseCommunication: 'Good',
    planExplanation: 'Good',
    promptnessAttending: 'Good',
    pharmacyTimeliness: 'Good',
    billingCourtesy: 'Good',
    operationsHospitality: 'Good',
    dischargeProcess: 'Good',
    nominateEmployee: 'All staff members were professional',
    comments: 'Satisfactory stay. Everything was handled well.',
    timestamp: new Date('2024-01-17T09:45:00Z')
  }
];

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-feedback';
    await mongoose.connect(mongoURI);
    log('✅ Connected to MongoDB', 'green');
  } catch (error) {
    log('❌ MongoDB connection failed!', 'red');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Add sample data
async function addSampleData() {
  try {
    log('\n📝 Adding sample OPD feedback data...', 'blue');
    
    // Clear existing data (optional)
    const clearData = process.argv.includes('--clear');
    if (clearData) {
      await OPDFeedback.deleteMany({});
      await IPDFeedback.deleteMany({});
      log('🧹 Cleared existing data', 'yellow');
    }
    
    // Add OPD feedback
    const opdResults = await OPDFeedback.insertMany(sampleOPDFeedback);
    log(`✅ Added ${opdResults.length} OPD feedback entries`, 'green');
    
    // Add IPD feedback
    log('\n📝 Adding sample IPD feedback data...', 'blue');
    const ipdResults = await IPDFeedback.insertMany(sampleIPDFeedback);
    log(`✅ Added ${ipdResults.length} IPD feedback entries`, 'green');
    
    // Show statistics
    const opdCount = await OPDFeedback.countDocuments();
    const ipdCount = await IPDFeedback.countDocuments();
    
    log('\n📊 Database Statistics:', 'blue');
    log(`   OPD Feedbacks: ${opdCount}`, 'yellow');
    log(`   IPD Feedbacks: ${ipdCount}`, 'yellow');
    log(`   Total Feedbacks: ${opdCount + ipdCount}`, 'yellow');
    
    log('\n🎉 Sample data added successfully!', 'green');
    log('You can now view this data in MongoDB Compass:', 'blue');
    log('   Database: hospital-feedback', 'yellow');
    log('   Collections: opdfeedbacks, ipdfeedbacks', 'yellow');
    
  } catch (error) {
    log('❌ Error adding sample data!', 'red');
    log(`Error: ${error.message}`, 'red');
  }
}

// Main function
async function main() {
  log('🏥 Hospital Feedback System - Sample Data Generator', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  await connectDB();
  await addSampleData();
  
  // Close connection
  await mongoose.connection.close();
  log('\n👋 Connection closed. Sample data ready!', 'blue');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log('❌ Unhandled error:', 'red');
  log(error.message, 'red');
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { addSampleData, sampleOPDFeedback, sampleIPDFeedback };
