import express from "express";
import prisma from "../prismaClient.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================
// DASHBOARD STATS
// ============================

router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const teacherId = req.teacher.id || req.teacher._id;

    const totalAssigned = await prisma.answerSheet.count({
      where: { assignedToId: teacherId },
    });

    const pendingCount = await prisma.answerSheet.count({
      where: {
        assignedToId: teacherId,
        status: "pending",
      },
    });

    const completedCount = await prisma.answerSheet.count({
      where: {
        assignedToId: teacherId,
        status: "evaluated",
      },
    });

    const aiEvaluationsCount = await prisma.aIEvaluation.count({
      where: { teacherId },
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
    const teacherId = req.teacher.id || req.teacher._id;
    const activitiesRaw = await prisma.evaluation.findMany({
      where: { teacherId },
      include: { answerSheet: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
    
    const activities = activitiesRaw.map(a => {
        const act = { ...a, _id: a.id };
        if (act.answerSheet) {
            act.answerSheetId = { ...act.answerSheet, _id: act.answerSheet.id };
        }
        return act;
    });

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
    const teacherId = req.teacher.id || req.teacher._id;
    const evaluations = await prisma.evaluation.findMany({
      where: { teacherId, status: "submitted" },
      include: { answerSheet: { include: { questionPaper: true } } }
    });
    
    const subjectsMap = {};
    evaluations.forEach(evalRecord => {
      const qp = evalRecord.answerSheet?.questionPaper;
      if (qp) {
        if (!subjectsMap[qp.id]) {
          subjectsMap[qp.id] = { ...qp, totalEvaluated: 0 };
        }
        subjectsMap[qp.id].totalEvaluated++;
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
    const teacherId = req.teacher.id || req.teacher._id;
    const { questionPaperId } = req.params;
    const evaluationsRaw = await prisma.evaluation.findMany({
      where: { 
        teacherId, 
        status: "submitted",
        answerSheet: { questionPaperId }
      },
      include: { answerSheet: { include: { questionPaper: true } } }
    });

    const evaluations = evaluationsRaw.map(e => ({ ...e, _id: e.id }));
    res.json({ success: true, evaluations });
  } catch (error) {
    console.error("Fetch Teacher Subject Details Error:", error);
    res.status(500).json({ message: "Failed to fetch subject details" });
  }
});

export default router;
