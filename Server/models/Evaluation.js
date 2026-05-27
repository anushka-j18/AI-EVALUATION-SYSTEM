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

  }, {
    timestamps: true,
  });

const Evaluation =
  mongoose.model(
    "Evaluation",
    EvaluationSchema
  );

export default Evaluation;