import express from "express";
import AnswerSheet from "../models/AnswerSheet.js";
import Evaluation from "../models/Evaluation.js";
import AIEvaluation from "../models/AIEvaluation.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================
// DASHBOARD STATS
// ============================

router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const teacherId = req.teacher._id;

    const totalAssigned = await AnswerSheet.countDocuments({
      assignedTo: teacherId,
    });

    const pendingCount = await AnswerSheet.countDocuments({
      assignedTo: teacherId,
      status: "pending",
    });

    const completedCount = await AnswerSheet.countDocuments({
      assignedTo: teacherId,
      status: "evaluated",
    });

    const aiEvaluationsCount = await AIEvaluation.countDocuments({
      teacherId,
    });

    res.status(200).json({
      success: true,
      stats: {
        totalAssigned,
        pendingCount,
        completedCount,
        aiEvaluationsCount,
      },
    });
  } catch (error) {
    console.log("DASHBOARD STATS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats.",
    });
  }
});

// ============================
// RECENT ACTIVITIES
// ============================

router.get("/recent-activities", authMiddleware, async (req, res) => {
  try {
    const activities = await Evaluation.find({
      teacherId: req.teacher._id,
    })
      .populate("answerSheetId")
      .sort({ updatedAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    console.log("RECENT ACTIVITIES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activities.",
    });
  }
});

export default router;
