import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AnswerSheet from './models/AnswerSheet.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB.");

  const res = await AnswerSheet.updateMany(
    { _id: '6a507bc2e0b98e54164d446e' },
    { $set: { status: 'pending' } }
  );

  console.log("Updated", res);

  process.exit(0);
}

run();
