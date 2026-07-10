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
    const teacherId = req.teacher._id;
    const activities = await Evaluation.find({ teacherId })
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

// ============================
// SUBJECT RESULTS (Teacher)
// ============================

router.get("/subject-results", authMiddleware, async (req, res) => {
  try {
    const teacherId = req.teacher._id;
    const evaluations = await Evaluation.find({ teacherId, status: "submitted" })
      .populate({
        path: "answerSheetId",
        populate: { path: "questionPaper" }
      });
    
    const subjectsMap = {};
    evaluations.forEach(evalRecord => {
      const qp = evalRecord.answerSheetId?.questionPaper;
      if (qp) {
        const qpId = qp._id.toString();
        if (!subjectsMap[qpId]) {
          subjectsMap[qpId] = { ...qp.toObject(), totalEvaluated: 0 };
        }
        subjectsMap[qpId].totalEvaluated++;
      }
    });

    res.json({ success: true, subjects: Object.values(subjectsMap) });
  } catch (error) {
    console.error("Fetch Teacher Subject Results Error:", error);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
});

router.get("/subject-results/:questionPaperId", authMiddleware, async (req, res) => {
  try {
    const teacherId = req.teacher._id;
    const { questionPaperId } = req.params;
    
    // Find answer sheets for this question paper
    const answerSheetIds = await AnswerSheet.find({ questionPaper: questionPaperId }).distinct("_id");
    
    const evaluations = await Evaluation.find({
      teacherId,
      status: "submitted",
      answerSheetId: { $in: answerSheetIds }
    })
    .populate({
      path: "answerSheetId",
      populate: { path: "questionPaper" }
    });

    res.json({ success: true, evaluations });
  } catch (error) {
    console.error("Fetch Teacher Subject Details Error:", error);
    res.status(500).json({ message: "Failed to fetch subject details" });
  }
});

export default router;
