import mongoose from "mongoose";

const aiEvaluationSchema = new mongoose.Schema(
  {
    answerSheetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnswerSheet",
      required: true,
    },
    questionPaperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionPaper",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    checkingMode: {
      type: String,
      enum: ["easy", "medium", "strict"],
      default: "medium",
    },
    questionWiseResults: [
      {
        questionNo: String,
        question: String,
        aiMarks: Number,
        maxMarks: Number,
        aiFeedback: String,
      },
    ],
    totalAiMarks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AIEvaluation = mongoose.model("AIEvaluation", aiEvaluationSchema);
export default AIEvaluation;
