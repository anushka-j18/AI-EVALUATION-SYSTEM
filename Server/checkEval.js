import mongoose from 'mongoose';
import Evaluation from './models/Evaluation.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const ev = await Evaluation.findOne({});
    console.log(ev);
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

check();
