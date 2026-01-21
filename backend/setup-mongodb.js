#!/usr/bin/env node

/**
 * MongoDB Setup Script for Hospital Feedback System
 * This script helps you test your MongoDB connection and set up initial data
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

// Test MongoDB connection
async function testConnection() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-feedback';
    log(`🔌 Connecting to MongoDB...`, 'blue');
    log(`📍 URI: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`, 'blue');
    
    await mongoose.connect(mongoURI);
    log('✅ MongoDB connected successfully!', 'green');
    
    // Test database operations
    await testDatabaseOperations();
    
    return true;
  } catch (error) {
    log('❌ MongoDB connection failed!', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

// Test database operations
async function testDatabaseOperations() {
  try {
    log('\n🧪 Testing database operations...', 'blue');
    
    // Test OPD feedback creation
    const testOPDFeedback = new OPDFeedback({
      name: 'Test Patient',
      uhid: 'TEST001',
      date: '2024-01-15',
      mobile: '9876543210',
      overallExperience: 'Excellent',
      appointmentBooking: 'Good',
      receptionStaff: 'Excellent',
      hospitalCleanliness: 'Good',
      comments: 'This is a test feedback entry'
    });
    
    await testOPDFeedback.save();
    log('✅ OPD feedback test entry created', 'green');
    
    // Test IPD feedback creation
    const testIPDFeedback = new IPDFeedback({
      name: 'Test Patient IPD',
      uhid: 'TEST002',
      date: '2024-01-15',
      mobile: '9876543211',
      overallExperience: 'Good',
      registrationProcess: 'Excellent',
      roomReadiness: 'Good',
      doctorExplanation: 'Excellent',
      comments: 'This is a test IPD feedback entry'
    });
    
    await testIPDFeedback.save();
    log('✅ IPD feedback test entry created', 'green');
    
    // Count documents
    const opdCount = await OPDFeedback.countDocuments();
    const ipdCount = await IPDFeedback.countDocuments();
    
    log(`📊 Database Statistics:`, 'blue');
    log(`   OPD Feedbacks: ${opdCount}`, 'yellow');
    log(`   IPD Feedbacks: ${ipdCount}`, 'yellow');
    
    // Clean up test data
    await OPDFeedback.deleteOne({ uhid: 'TEST001' });
    await IPDFeedback.deleteOne({ uhid: 'TEST002' });
    log('🧹 Test data cleaned up', 'green');
    
  } catch (error) {
    log('❌ Database operations failed!', 'red');
    log(`Error: ${error.message}`, 'red');
    throw error;
  }
}

// Show connection info
function showConnectionInfo() {
  log('\n📋 MongoDB Setup Information:', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-feedback';
  
  if (mongoURI.includes('mongodb+srv://')) {
    log('🌐 Using MongoDB Atlas (Cloud)', 'green');
    log('   Make sure your IP is whitelisted', 'yellow');
  } else {
    log('💻 Using Local MongoDB', 'green');
    log('   Make sure MongoDB service is running', 'yellow');
  }
  
  log('\n🔧 Environment Variables:', 'blue');
  log(`   MONGODB_URI: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`, 'yellow');
  log(`   PORT: ${process.env.PORT || '5000'}`, 'yellow');
  log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`, 'yellow');
  
  log('\n📚 Available Collections:', 'blue');
  log('   - opdfeedbacks (OPD feedback data)', 'yellow');
  log('   - ipdfeedbacks (IPD feedback data)', 'yellow');
  
  log('\n🚀 Next Steps:', 'blue');
  log('   1. Start your backend server: npm run dev', 'yellow');
  log('   2. Test API endpoints with your frontend', 'yellow');
  log('   3. Submit some feedback to see data in MongoDB', 'yellow');
}

// Main function
async function main() {
  log('🏥 Hospital Feedback System - MongoDB Setup', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  
  showConnectionInfo();
  
  const connected = await testConnection();
  
  if (connected) {
    log('\n🎉 Setup completed successfully!', 'green');
    log('Your MongoDB is ready for the hospital feedback system.', 'green');
  } else {
    log('\n💥 Setup failed!', 'red');
    log('Please check your MongoDB configuration and try again.', 'red');
    log('\n📖 See MONGODB_SETUP_GUIDE.md for detailed instructions.', 'yellow');
    process.exit(1);
  }
  
  // Close connection
  await mongoose.connection.close();
  log('\n👋 Connection closed. Goodbye!', 'blue');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log('❌ Unhandled error:', 'red');
  log(error.message, 'red');
  process.exit(1);
});

// Run the setup
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testConnection, testDatabaseOperations };
