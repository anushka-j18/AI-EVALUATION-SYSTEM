import express from "express";
import Evaluation from "../models/Evaluation.js";
import AnswerSheet from "../models/AnswerSheet.js";
import Question from "../models/Question.js";
import AIEvaluation from "../models/AIEvaluation.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { extractTextFromFile } from "../services/ocrService.js";
import { parseAnswers } from "../services/answerParserService.js";
import { evaluateAnswer } from "../services/grokService.js";

const router = express.Router();

// ============================
// START EVALUATION
// ============================

router.post("/start/:answerSheetId", authMiddleware, async (req, res) => {
  try {
    const answerSheet = await AnswerSheet.findById(req.params.answerSheetId);

    if (!answerSheet) {
      return res.status(404).json({
        success: false,
        message: "Answer sheet not found.",
      });
    }

    // Check if evaluation already exists
    const existingEval = await Evaluation.findOne({
      answerSheetId: answerSheet._id,
      teacherId: req.teacher._id,
    });

    if (existingEval) {
      return res.status(200).json({
        success: true,
        message: "Evaluation already exists.",
        evaluation: existingEval,
      });
    }

    // Fetch questions for the question paper
    const questions = await Question.find({
      questionPaper: answerSheet.questionPaper,
    }).sort({ createdAt: 1 });

    // Pre-populate questionWiseMarks
    const questionWiseMarks = questions.map((q) => ({
      questionId: q._id,
      questionNo: q.qNo,
      maxMarks: q.maxMarks,
      obtainedMarks: 0,
      comment: "",
    }));

    const evaluation = await Evaluation.create({
      teacherId: req.teacher._id,
      answerSheetId: answerSheet._id,
      studentName: answerSheet.studentName,
      rollNumber: answerSheet.rollNumber,
      answerSheet: answerSheet.fileUrl,
      status: "draft",
      questionWiseMarks,
      totalMarks: 0,
    });

    // Update answer sheet status
    answerSheet.status = "pending";
    await answerSheet.save();

    res.status(201).json({
      success: true,
      message: "Evaluation started.",
      evaluation,
    });
  } catch (error) {
    console.log("START EVALUATION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to start evaluation.",
      error: error.message,
    });
  }
});

// ============================
// SAVE DRAFT
// ============================

router.put("/:id/save-draft", authMiddleware, async (req, res) => {
  try {
    const { questionWiseMarks, overallComments, annotations } = req.body;

    const totalMarks = questionWiseMarks.reduce(
      (sum, q) => sum + Number(q.obtainedMarks || 0),
      0
    );

    const evaluation = await Evaluation.findByIdAndUpdate(
      req.params.id,
      {
        questionWiseMarks,
        overallComments,
        annotations,
        totalMarks,
        status: "draft",
      },
      { new: true }
    );

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Draft saved successfully.",
      evaluation,
    });
  } catch (error) {
    console.log("SAVE DRAFT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save draft.",
      error: error.message,
    });
  }
});

// ============================
// SUBMIT EVALUATION
// ============================

router.put("/:id/submit", authMiddleware, async (req, res) => {
  try {
    const { questionWiseMarks, overallComments, annotations } = req.body;

    const totalMarks = questionWiseMarks.reduce(
      (sum, q) => sum + Number(q.obtainedMarks || 0),
      0
    );

    const evaluation = await Evaluation.findByIdAndUpdate(
      req.params.id,
      {
        questionWiseMarks,
        overallComments,
        annotations,
        totalMarks,
        status: "submitted",
        submittedAt: new Date(),
      },
      { new: true }
    );

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found.",
      });
    }

    // Update answer sheet status
    await AnswerSheet.findByIdAndUpdate(evaluation.answerSheetId, {
      status: "evaluated",
    });

    res.status(200).json({
      success: true,
      message: "Evaluation submitted successfully.",
      evaluation,
    });
  } catch (error) {
    console.log("SUBMIT EVALUATION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit evaluation.",
      error: error.message,
    });
  }
});

// ============================
// GET EVALUATION
// ============================

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate("answerSheetId")
      .populate("teacherId", "-password");

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found.",
      });
    }

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.log("GET EVALUATION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch evaluation.",
    });
  }
});

// ============================
// GET EVALUATION BY ANSWER SHEET
// ============================

router.get("/by-sheet/:answerSheetId", authMiddleware, async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({
      answerSheetId: req.params.answerSheetId,
      teacherId: req.teacher._id,
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found for this answer sheet.",
      });
    }

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.log("GET BY SHEET ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch evaluation.",
    });
  }
});

// ============================
// AI EVALUATE
// ============================

router.post("/:answerSheetId/ai-evaluate", authMiddleware, async (req, res) => {
  try {
    const answerSheet = await AnswerSheet.findById(req.params.answerSheetId);

    if (!answerSheet) {
      return res.status(404).json({
        success: false,
        message: "Answer sheet not found.",
      });
    }

    const checkingMode = req.body.checkingMode || "medium";

    // OCR
    const extractedText = await extractTextFromFile(answerSheet.fileUrl);

    // Parse answers
    const extractedAnswers = parseAnswers(extractedText);

    // Fetch questions
    const questions = await Question.find({
      questionPaper: answerSheet.questionPaper,
    }).sort({ createdAt: 1 });

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this paper.",
      });
    }

    // Evaluate each question
    let questionWiseResults = [];
    let totalAiMarks = 0;

    for (const q of questions) {
      const studentAnswer =
        extractedAnswers.find((a) => a.questionNo === q.qNo.toString())?.answer || "";

      const result = await evaluateAnswer(
        q.question,
        studentAnswer,
        q.maxMarks,
        checkingMode
      );

      questionWiseResults.push({
        questionNo: q.qNo,
        question: q.question,
        aiMarks: result.marksAwarded,
        maxMarks: q.maxMarks,
        aiFeedback: result.feedback,
      });

      totalAiMarks += Number(result.marksAwarded);
    }

    // Save AI evaluation
    const aiEvaluation = await AIEvaluation.create({
      answerSheetId: answerSheet._id,
      questionPaperId: answerSheet.questionPaper,
      teacherId: req.teacher._id,
      checkingMode,
      questionWiseResults,
      totalAiMarks,
    });

    // Link to teacher evaluation if exists
    await Evaluation.findOneAndUpdate(
      { answerSheetId: answerSheet._id, teacherId: req.teacher._id },
      { aiEvaluationId: aiEvaluation._id }
    );

    res.status(200).json({
      success: true,
      message: "AI evaluation completed.",
      aiEvaluation,
    });
  } catch (error) {
    console.log("AI EVALUATE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "AI evaluation failed.",
      error: error.message,
    });
  }
});

// ============================
// AI COMPARISON
// ============================

router.get("/:id/ai-comparison", authMiddleware, async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found.",
      });
    }

    let aiEvaluation = null;

    if (evaluation.aiEvaluationId) {
      aiEvaluation = await AIEvaluation.findById(evaluation.aiEvaluationId);
    }

    res.status(200).json({
      success: true,
      evaluation,
      aiEvaluation,
    });
  } catch (error) {
    console.log("AI COMPARISON ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch comparison.",
    });
  }
});

export default router;
