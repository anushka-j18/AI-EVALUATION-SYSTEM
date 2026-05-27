import mongoose from "mongoose";

const questionPaperSchema =
  new mongoose.Schema(

    {
      subject: {
        type: String,
        required: true,
      },

      subjectCode: {
        type: String,
        required: true,
      },

      examName: {
        type: String,
        required: true,
      },

      session: {
        type: String,
        required: true,
      },

      totalMarks: {
        type: Number,
        required: true,
      },

      fileUrl: {
        type: String,
        required: true,
      },

      questions: [

        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref: "Question",
        },
      ],
    },

    {
      timestamps: true,
    }
  );

const QuestionPaper =
  mongoose.model(

    "QuestionPaper",

    questionPaperSchema
  );

export default QuestionPaper;