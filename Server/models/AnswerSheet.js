import mongoose from "mongoose";

const answerSheetSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    rollNumber: { type: String, required: true },
    questionPaper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionPaper",
      required: true,
    },
    fileUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "assigned", "pending", "evaluated"],
      default: "available",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
    assignedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const AnswerSheet = mongoose.model("AnswerSheet", answerSheetSchema);
export default AnswerSheet;
