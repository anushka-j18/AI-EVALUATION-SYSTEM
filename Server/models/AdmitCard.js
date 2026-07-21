import mongoose from "mongoose";

const admitCardSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    uniqueId: { type: String, required: true, unique: true }, // For QR code/Reference
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure a student has only one admit card per exam
admitCardSchema.index({ student: 1, exam: 1 }, { unique: true });

const AdmitCard = mongoose.model("AdmitCard", admitCardSchema);
export default AdmitCard;
