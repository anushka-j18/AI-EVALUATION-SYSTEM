import express from "express";
import { protectAdmin } from "../middleware/authMiddleware.js";
import Teacher from "../models/Teacher.js";
import AnswerSheet from "../models/AnswerSheet.js";
import Evaluation from "../models/Evaluation.js";

const router = express.Router();

// GET total stats for Admin Dashboard
router.get("/stats", protectAdmin, async (req, res) => {
  try {
    const totalTeachers = await Teacher.countDocuments();
    const totalScripts = await AnswerSheet.countDocuments();
    
    const availableScripts = await AnswerSheet.countDocuments({ status: "available" });
    const assignedScripts = await AnswerSheet.countDocuments({ status: "assigned" });
    const pendingScripts = await AnswerSheet.countDocuments({ status: "pending" });
    const evaluatedScripts = await AnswerSheet.countDocuments({ status: "evaluated" });

    res.json({
      stats: {
        totalTeachers,
        totalScripts,
        availableScripts,
        assignedScripts,
        pendingScripts,
        evaluatedScripts,
      }
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// GET all teachers
router.get("/teachers", protectAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.find().select("-password").sort({ createdAt: -1 });
    res.json({ teachers });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
});

// GET all answer sheets
router.get("/answer-sheets", protectAdmin, async (req, res) => {
  try {
    const scripts = await AnswerSheet.find()
      .populate("questionPaper", "subject subjectCode examName")
      .populate("teacherId", "name email department")
      .sort({ createdAt: -1 });
    res.json({ scripts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch scripts" });
  }
});

// POST assign an answer sheet to a teacher
router.post("/assign-script", protectAdmin, async (req, res) => {
  try {
    const { scriptId, teacherId } = req.body;

    if (!scriptId || !teacherId) {
      return res.status(400).json({ message: "scriptId and teacherId are required" });
    }

    const script = await AnswerSheet.findById(scriptId);
    if (!script) {
      return res.status(404).json({ message: "Answer script not found" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Assign the script
    script.teacherId = teacher._id;
    
    // Only update status to assigned if it was available, otherwise leave as is (could be re-assigning)
    if (script.status === "available") {
      script.status = "assigned";
    }

    await script.save();

    res.json({ message: "Script assigned successfully", script });
  } catch (error) {
    console.error("Admin Assign Script Error:", error);
    res.status(500).json({ message: "Failed to assign script" });
  }
});

export default router;
