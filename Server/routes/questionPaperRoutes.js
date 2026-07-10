import express from "express";
import multer from "multer";
import fs from "fs";
import QuestionPaper from "../models/QuestionPaper.js";
import { parseQuestionPaperWithGemini } from "../services/geminiOcrService.js";

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

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF/JPG/PNG allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

// ============================
// UPLOAD QUESTION PAPER
// ============================
router.post("/upload", upload.single("questionPaper"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Question paper file required",
      });
    }

    const { subject, subjectCode, examName, session, totalMarks } = req.body;

    const paper = await QuestionPaper.create({
      subject,
      subjectCode,
      examName,
      session,
      totalMarks: Number(totalMarks) || 0,
      fileUrl: req.file.path,
    });

    let parsedQuestions = [];
    let message = "Question Paper Uploaded Successfully. Please review questions.";

    try {
      parsedQuestions = await parseQuestionPaperWithGemini(req.file.path, req.file.mimetype);
      console.log("PARSED QUESTIONS FROM GEMINI:", parsedQuestions);
    } catch (ocrError) {
      console.log("OCR PARSING ERROR:", ocrError.message);
      message = "Question Paper Uploaded Successfully. AI parsing failed, please add questions manually.";
    }

    res.status(201).json({
      success: true,
      message,
      paper,
      questions: parsedQuestions || [],
    });

  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Upload Failed",
      error: error.message,
    });
  }
});

// ============================
// GET ALL QUESTION PAPERS
// ============================
router.get("/", async (req, res) => {
  try {
    const papers = await QuestionPaper.find()
      .populate("questions")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      papers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch papers",
    });
  }
});

export default router;