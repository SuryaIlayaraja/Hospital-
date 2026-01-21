// Debug login script
const mongoose = require('mongoose');
const User = require('./models/User');

async function testLogin() {
  try {
    // Connect to MongoDB
    require('dotenv').config();
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/hospital-feedback";
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");
    console.log("URI:", mongoURI.split('@')[1] || mongoURI); // Log redacted URI 


    // Find COO user
    const cooUser = await User.findOne({ email: "coo@hospital.com" });
    
    if (!cooUser) {
      console.log("❌ COO user not found!");
      return;
    }
    
    console.log("\n✅ COO user found:");
    console.log("Email:", cooUser.email);
    console.log("Role:", cooUser.role);
    console.log("Has password:", !!cooUser.password);
    
    // Test password
    const isPasswordValid = await cooUser.comparePassword("COO@2026");
    console.log("\n🔐 Password test result:", isPasswordValid);
    
    if (!isPasswordValid) {
      console.log("❌ Password does not match!");
      console.log("Trying to update password...");
      
      // Update password
      cooUser.password = "COO@2026";
      await cooUser.save();
      console.log("✅ Password updated!");
      
      // Test again
      const retestPassword = await cooUser.comparePassword("COO@2026");
      console.log("🔐 Retest result:", retestPassword);
    }
    
    await mongoose.connection.close();
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testLogin();
