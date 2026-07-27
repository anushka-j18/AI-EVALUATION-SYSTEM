import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';
dotenv.config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await Admin.updateOne(
      { email: 'admin@gmail.com' },
      { $set: { password: hashedPassword } }
    );
    console.log('Password updated to: admin123');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

resetPassword();
