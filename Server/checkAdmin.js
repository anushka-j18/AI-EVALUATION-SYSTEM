import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const admin = await Admin.findOne({ email: 'admin@gmail.com' });
    if (admin) {
      console.log('Admin found:', admin);
    } else {
      console.log('No admin found with email admin@gmail.com');
    }
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

check();
