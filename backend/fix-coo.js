// Fix COO password - bypass save hooks
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function fixCOO() {
  try {
    await mongoose.connect("mongodb://localhost:27017/hospital-feedback");
    console.log("✅ Connected to MongoDB");

    // Get User collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Delete COO
    await usersCollection.deleteOne({ email: "coo@hospital.com" });
    console.log("✅ Deleted COO user");
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("COO@2026", salt);
    
    // Insert directly to bypass hooks
    await usersCollection.insertOne({
      email: "coo@hospital.com",
      password: hashedPassword,
      role: "COO",
      department: null,
      departmentName: null,
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log("✅ COO user created with hashed password");
    
    // Test login
    const User = require('./models/User');
    const testUser = await User.findOne({ email: "coo@hospital.com" });
    const isValid = await testUser.comparePassword("COO@2026");
    console.log("🔐 Password verification:", isValid);
    
    if (isValid) {
      console.log("\n✅ SUCCESS! You can now log in with:");
      console.log("Email: coo@hospital.com");
      console.log("Password: COO@2026");
    } else {
      console.log("\n❌ Password still doesn't match");
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

fixCOO();
