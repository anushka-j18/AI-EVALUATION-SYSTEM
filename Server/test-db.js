import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Evaluation from './models/Evaluation.js';
import AnswerSheet from './models/AnswerSheet.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB.");

  const scripts = await AnswerSheet.find({ status: "evaluated" });
  console.log("Evaluated Scripts:", scripts.map(s => ({
    _id: s._id,
    studentName: s.studentName,
    assignedTo: s.assignedTo
  })));

  for (let s of scripts) {
    const evalFound = await Evaluation.findOne({ answerSheetId: s._id });
    console.log(`Evaluation for script ${s._id}:`, evalFound ? `Found! teacherId: ${evalFound.teacherId}` : "NOT FOUND");
  }

  process.exit(0);
}

run();
