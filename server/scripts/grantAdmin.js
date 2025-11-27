import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tastetrail';

const email = process.argv[2];

if (!email) {
  console.error('Usage: node grantAdmin.js <email>');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found for email:', email);
      process.exit(2);
    }

    user.role = 'admin';
    await user.save();

    console.log(`Granted admin role to ${email}`);
    console.log('User:', { _id: user._id.toString(), email: user.email, role: user.role });
    process.exit(0);
  } catch (err) {
    console.error('Error granting admin:', err.message);
    process.exit(3);
  }
};

run();
