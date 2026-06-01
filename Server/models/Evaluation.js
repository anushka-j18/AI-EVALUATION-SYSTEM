import mongoose from "mongoose";

const EvaluationSchema =
  new mongoose.Schema({

    studentName: String,

    rollNumber: String,

    answerSheet: String,

    checkingMode: {
      type: String,

      enum: [
        "easy",
        "medium",
        "strict"
      ],
    },

    marks: [
      {
        questionNo: String,

        obtainedMarks: Number,

        feedback: String,
      },
    ],

    totalMarks: Number,

    // New fields for Teacher Dashboard
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },

    answerSheetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnswerSheet",
    },

    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
    },

    questionWiseMarks: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        questionNo: String,
        maxMarks: Number,
        obtainedMarks: { type: Number, default: 0 },
        comment: { type: String, default: "" },
      },
    ],

    overallComments: { type: String, default: "" },

    aiEvaluationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIEvaluation",
    },

    annotations: [
      {
        x: Number,
        y: Number,
        type: { type: String, enum: ["tick", "cross"] }
      }
    ],

    submittedAt: Date,

  }, {
    timestamps: true,
  });

const Evaluation =
  mongoose.model(
    "Evaluation",
    EvaluationSchema
  );

export default Evaluation;