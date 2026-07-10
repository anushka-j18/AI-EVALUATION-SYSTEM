import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    section: { type: String, default: "" },
    qNo: { type: String, required: true },
    question: { type: String, required: true },
    maxMarks: { type: Number, default: 0 },
    isOptional: { type: Boolean, default: false },
    groupId: { type: String, default: "" },
    requiredAttempts: { type: Number, default: null },
    questionPaper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionPaper",
      required: true,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;