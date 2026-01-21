const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function fixPasswords() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hospital-feedback');
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      if (!user.password.startsWith('$2')) {
        console.log(`Hashing password for: ${user.email}`);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        await User.updateOne({ _id: user._id }, { password: hash });
        console.log(`Updated: ${user.email}`);
      } else {
        console.log(`Already hashed: ${user.email}`);
      }
    }

    console.log('All passwords checked/updated.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

fixPasswords();
