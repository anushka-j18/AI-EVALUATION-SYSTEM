import express from "express";

import multer from "multer";

import fs from "fs";

import QuestionPaper from "../models/QuestionPaper.js";

import Question from "../models/Question.js";

import Evaluation from "../models/Evaluation.js";

import {
  extractTextFromFile,
} from "../services/ocrService.js";

import {
  parseAnswers,
} from "../services/answerParserService.js";

import {
  evaluateAnswer,
} from "../services/grokService.js";

const router =
  express.Router();


// ============================
// CREATE UPLOADS FOLDER
// ============================

if (!fs.existsSync("uploads")) {

  fs.mkdirSync("uploads");
}


// ============================
// MULTER
// ============================

const storage =
  multer.diskStorage({

    destination:
      function (
        req,
        file,
        cb
      ) {

        cb(
          null,
          "uploads/"
        );
      },

    filename:
      function (
        req,
        file,
        cb
      ) {

        cb(

          null,

          Date.now() +
          "-" +
          file.originalname
        );
      },
  });

const upload =
  multer({ storage });


// ============================
// AUTO EVALUATE
// ============================

router.post(

  "/auto-evaluate",

  upload.single(
    "answerSheet"
  ),

  async (
    req,
    res
  ) => {

    try {

      // ============================
      // VALIDATION
      // ============================

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "Answer sheet required",
        });
      }

      // ============================
      // OCR TEXT
      // ============================

      const extractedText =
        await extractTextFromFile(
          req.file.path
        );

      console.log(
        "OCR TEXT = ",
        extractedText
      );

      // ============================
      // FETCH QUESTION PAPER
      // ============================

      const questionPaper =
        await QuestionPaper.findById(
          req.body.questionPaperId
        );

      if (
        !questionPaper
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Question Paper Not Found",
        });
      }

      // ============================
      // FETCH QUESTIONS SEPARATELY
      // ============================

      const questions =
        await Question.find({

          questionPaper:
            questionPaper._id,
        }).sort({
          createdAt: 1,
        });

      console.log(
        "QUESTIONS = ",
        questions
      );

      // ============================
      // CHECK QUESTIONS
      // ============================

      if (
        !questions ||
        questions.length === 0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "No questions found for this paper",
        });
      }

      // ============================
      // PARSE ANSWERS
      // ============================

      const extractedAnswers =
        parseAnswers(
          extractedText
        );

      console.log(
        "PARSED ANSWERS = ",
        extractedAnswers
      );

      // ============================
      // EVALUATION
      // ============================

      const checkingMode =
        req.body.checkingMode;

      let evaluations =
        [];

      let totalMarks =
        0;

      // ============================
      // LOOP QUESTIONS
      // ============================

      for (
        const q of questions
      ) {

        // MATCH ANSWER

        const studentAnswer =

          extractedAnswers[
            q.qNo.toString()
          ] || "";

        console.log(
          "QUESTION NO = ",
          q.qNo
        );

        console.log(
          "QUESTION = ",
          q.question
        );

        console.log(
          "ANSWER = ",
          studentAnswer
        );

        // ============================
        // AI EVALUATE
        // ============================

        const result =
          await evaluateAnswer(

            q.question,

            studentAnswer,

            q.maxMarks,

            checkingMode
          );

        // ============================
        // STORE RESULT
        // ============================

        evaluations.push({

          questionNo:
            q.qNo,

          question:
            q.question,

          obtainedMarks:
            result.marksAwarded,

          maxMarks:
            q.maxMarks,

          feedback:
            result.feedback,
        });

        totalMarks +=
          Number(
            result.marksAwarded
          );
      }

      // ============================
      // SAVE EVALUATION
      // ============================

      const evaluation =
        await Evaluation.create({

          studentName:
            req.body.studentName,

          rollNumber:
            req.body.rollNumber,

          answerSheet:
            req.file.path,

          checkingMode,

          marks:
            evaluations,

          totalMarks,
        });

      // ============================
      // RESPONSE
      // ============================

      res.status(200).json({

        success: true,

        evaluation,
      });

    } catch (error) {

      console.log(
        "AI EVALUATION ERROR = ",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "AI Evaluation Failed",

        error:
          error.message,
      });
    }
  }
);

export default router;