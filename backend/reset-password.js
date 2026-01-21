// Simple script to reset COO password
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetCOOPassword() {
  try {
    await mongoose.connect("mongodb://localhost:27017/hospital-feedback");
    console.log("✅ Connected to MongoDB");

    const User = mongoose.model('User');
    
    // Find and update COO
    const cooUser = await User.findOne({ email: "coo@hospital.com" });
    
    if (!cooUser) {
      console.log("❌ COO not found");
      return;
    }
    
    // Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("COO@2026", salt);
    
    // Update directly in database
    await User.updateOne(
      { email: "coo@hospital.com" },
      { $set: { password: hashedPassword } }
    );
    
    console.log("✅ COO password reset successfully!");
    
    // Verify
    const updatedUser = await User.findOne({ email: "coo@hospital.com" });
    const isValid = await bcrypt.compare("COO@2026", updatedUser.password);
    console.log("🔐 Password verification:", isValid);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

resetCOOPassword();
