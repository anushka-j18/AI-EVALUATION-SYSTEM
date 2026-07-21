import mongoose from "mongoose";

const examRegistrationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    feeStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
  },
  { timestamps: true }
);

// Ensure a student can only register for an exam once
examRegistrationSchema.index({ student: 1, exam: 1 }, { unique: true });

const ExamRegistration = mongoose.model("ExamRegistration", examRegistrationSchema);
export default ExamRegistration;
