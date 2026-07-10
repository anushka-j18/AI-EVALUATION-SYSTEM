import express from "express";
import multer from "multer";
import fs from "fs";
import QuestionPaper from "../models/QuestionPaper.js";
import Question from "../models/Question.js";
import Evaluation from "../models/Evaluation.js";
import { extractTextFromFile } from "../services/ocrService.js";
import { parseAnswers } from "../services/answerParserService.js";
import { evaluateAnswer } from "../services/grokService.js";

const router = express.Router();

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/auto-evaluate", upload.single("answerSheet"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Answer sheet required",
      });
    }

    const extractedText = await extractTextFromFile(req.file.path);
    console.log("OCR TEXT = ", extractedText);

    const questionPaper = await QuestionPaper.findById(req.body.questionPaperId);

    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        message: "Question Paper Not Found",
      });
    }

    const questions = await Question.find({
      questionPaper: questionPaper._id,
    }).sort({ createdAt: 1 });

    console.log("QUESTIONS = ", questions);

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this paper",
      });
    }

    const extractedAnswers = parseAnswers(extractedText);
    console.log("PARSED ANSWERS = ", extractedAnswers);

    const checkingMode = req.body.checkingMode;
    let evaluations = [];
    let totalMarks = 0;

    for (const q of questions) {
      const studentAnswer = extractedAnswers[q.qNo.toString()] || "";

      console.log("QUESTION NO = ", q.qNo);
      console.log("QUESTION = ", q.question);
      console.log("ANSWER = ", studentAnswer);

      const result = await evaluateAnswer(
        q.question,
        studentAnswer,
        q.maxMarks,
        checkingMode
      );

      let awarded = Number(result.marksAwarded);
      if (isNaN(awarded) || awarded < 0) awarded = 0;
      if (awarded > q.maxMarks) awarded = q.maxMarks;

      evaluations.push({
        questionNo: q.qNo,
        question: q.question,
        obtainedMarks: awarded,
        maxMarks: q.maxMarks,
        feedback: result.feedback,
      });

      totalMarks += awarded;
    }

    const evaluation = await Evaluation.create({
      studentName: req.body.studentName,
      rollNumber: req.body.rollNumber,
      answerSheet: req.file.path,
      checkingMode,
      marks: evaluations,
      totalMarks,
    });

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.log("AI EVALUATION ERROR = ", error);
    res.status(500).json({
      success: false,
      message: "AI Evaluation Failed",
      error: error.message,
    });
  }
});

export default router;