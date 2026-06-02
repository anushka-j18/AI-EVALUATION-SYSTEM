import express from "express";
import prisma from "../prismaClient.js";
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
    const teacherId = req.teacher.id || req.teacher._id;
    const answerSheet = await prisma.answerSheet.findUnique({
      where: { id: req.params.answerSheetId }
    });

    if (!answerSheet) {
      return res.status(404).json({
        success: false,
        message: "Answer sheet not found.",
      });
    }

    // Check if evaluation already exists
    const existingEval = await prisma.evaluation.findFirst({
      where: {
        answerSheetId: answerSheet.id,
        teacherId: teacherId,
      }
    });

    if (existingEval) {
      return res.status(200).json({
        success: true,
        message: "Evaluation already exists.",
        evaluation: { ...existingEval, _id: existingEval.id },
      });
    }

    // Fetch questions
    const questions = await prisma.question.findMany({
      where: { questionPaperId: answerSheet.questionPaperId },
      orderBy: { createdAt: "asc" }
    });

    // Pre-populate
    const questionWiseMarks = questions.map((q) => ({
      questionId: q.id,
      questionNo: q.qNo,
      maxMarks: q.maxMarks,
      obtainedMarks: 0,
      comment: "",
    }));

    const evaluation = await prisma.evaluation.create({
      data: {
        teacherId,
        answerSheetId: answerSheet.id,
        studentName: answerSheet.studentName,
        rollNumber: answerSheet.rollNumber,
        answerSheetUrl: answerSheet.fileUrl,
        status: "draft",
        questionWiseMarks,
        totalMarks: 0,
      }
    });

    // Update answer sheet status
    await prisma.answerSheet.update({
      where: { id: answerSheet.id },
      data: { status: "pending" }
    });

    res.status(201).json({
      success: true,
      message: "Evaluation started.",
      evaluation: { ...evaluation, _id: evaluation.id },
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

    const evaluation = await prisma.evaluation.update({
      where: { id: req.params.id },
      data: {
        questionWiseMarks,
        overallComments,
        annotations,
        totalMarks,
        status: "draft",
      }
    });

    res.status(200).json({
      success: true,
      message: "Draft saved successfully.",
      evaluation: { ...evaluation, _id: evaluation.id },
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

    const evaluation = await prisma.evaluation.update({
      where: { id: req.params.id },
      data: {
        questionWiseMarks,
        overallComments,
        annotations,
        totalMarks,
        status: "submitted",
        submittedAt: new Date(),
      }
    });

    if (evaluation.answerSheetId) {
      await prisma.answerSheet.update({
        where: { id: evaluation.answerSheetId },
        data: { status: "evaluated" },
      });
    }

    res.status(200).json({
      success: true,
      message: "Evaluation submitted successfully.",
      evaluation: { ...evaluation, _id: evaluation.id },
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
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: req.params.id },
      include: {
        answerSheet: true,
        teacher: {
          select: { id: true, name: true, email: true, department: true }
        }
      }
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found.",
      });
    }

    const mapped = {
        ...evaluation,
        _id: evaluation.id,
        answerSheetId: evaluation.answerSheet,
        teacherId: evaluation.teacher
    };

    res.status(200).json({
      success: true,
      evaluation: mapped,
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
    const teacherId = req.teacher.id || req.teacher._id;
    const evaluation = await prisma.evaluation.findFirst({
      where: {
        answerSheetId: req.params.answerSheetId,
        teacherId: teacherId,
      }
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found for this answer sheet.",
      });
    }

    res.status(200).json({
      success: true,
      evaluation: { ...evaluation, _id: evaluation.id },
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
    const teacherId = req.teacher.id || req.teacher._id;
    const answerSheet = await prisma.answerSheet.findUnique({
      where: { id: req.params.answerSheetId }
    });

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
    const questions = await prisma.question.findMany({
      where: { questionPaperId: answerSheet.questionPaperId },
      orderBy: { createdAt: "asc" }
    });

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
    const aiEvaluation = await prisma.aIEvaluation.create({
      data: {
        answerSheetId: answerSheet.id,
        questionPaperId: answerSheet.questionPaperId,
        teacherId,
        checkingMode,
        questionWiseResults,
        totalAiMarks,
      }
    });

    // Link to teacher evaluation if exists
    await prisma.evaluation.updateMany({
      where: {
        answerSheetId: answerSheet.id,
        teacherId: teacherId,
      },
      data: { aiEvaluationId: aiEvaluation.id }
    });

    res.status(200).json({
      success: true,
      message: "AI evaluation completed.",
      aiEvaluation: { ...aiEvaluation, _id: aiEvaluation.id },
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
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: req.params.id }
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found.",
      });
    }

    let aiEvaluation = null;
    if (evaluation.aiEvaluationId) {
      aiEvaluation = await prisma.aIEvaluation.findUnique({
        where: { id: evaluation.aiEvaluationId }
      });
    }

    res.status(200).json({
      success: true,
      evaluation: { ...evaluation, _id: evaluation.id },
      aiEvaluation: aiEvaluation ? { ...aiEvaluation, _id: aiEvaluation.id } : null,
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
