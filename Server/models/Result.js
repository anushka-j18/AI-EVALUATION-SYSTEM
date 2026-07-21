import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    subjects: [
      {
        subjectName: { type: String, required: true },
        marksObtained: { type: Number, required: true },
        maxMarks: { type: Number, required: true },
      },
    ],
    totalMarksObtained: { type: Number, required: true },
    totalMaxMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String, required: true },
    passStatus: { type: String, enum: ["Pass", "Fail"], required: true },
    isPublished: { type: Boolean, default: false }, // Admin must publish it for students to see
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure a student has only one result per exam
resultSchema.index({ student: 1, exam: 1 }, { unique: true });

const Result = mongoose.model("Result", resultSchema);
export default Result;
