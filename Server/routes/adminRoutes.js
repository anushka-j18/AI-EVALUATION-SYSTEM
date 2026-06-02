import express from "express";
import { protectAdmin } from "../middleware/authMiddleware.js";
import prisma from "../prismaClient.js";

const router = express.Router();

// GET total stats for Admin Dashboard
router.get("/stats", protectAdmin, async (req, res) => {
  try {
    const totalTeachers = await prisma.teacher.count();
    const totalScripts = await prisma.answerSheet.count();
    
    const availableScripts = await prisma.answerSheet.count({ where: { status: "available" } });
    const assignedScripts = await prisma.answerSheet.count({ where: { status: "assigned" } });
    const pendingScripts = await prisma.answerSheet.count({ where: { status: "pending" } });
    const evaluatedScripts = await prisma.answerSheet.count({ where: { status: "evaluated" } });

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
    const teachersRaw = await prisma.teacher.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        employeeId: true,
        phone: true,
        profileImage: true,
        collegeName: true,
        designation: true,
        accountNumber: true,
        ifscCode: true,
        panel: true,
        createdAt: true,
        updatedAt: true
      }
    });
    const teachers = teachersRaw.map(t => ({ ...t, _id: t.id }));
    res.json({ teachers });
  } catch (error) {
    console.error("Fetch Teachers Error:", error);
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
});

import bcrypt from "bcryptjs";

// POST create new teacher
router.post("/teachers", protectAdmin, async (req, res) => {
  try {
    const { name, email, password, department, employeeId, phone, collegeName, designation, accountNumber, ifscCode, panel } = req.body;
    
    const existing = await prisma.teacher.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Teacher with this email already exists." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const teacher = await prisma.teacher.create({
      data: {
        name, email, password: hashedPassword, department, employeeId, phone, collegeName, designation, accountNumber, ifscCode, panel
      }
    });

    res.status(201).json({ message: "Teacher created successfully.", teacher: { ...teacher, _id: teacher.id } });
  } catch (error) {
    console.error("Create Teacher Error:", error);
    res.status(500).json({ message: "Failed to create teacher" });
  }
});

// PUT update existing teacher
router.put("/teachers/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, department, employeeId, phone, collegeName, designation, accountNumber, ifscCode, panel } = req.body;

    const existing = await prisma.teacher.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Teacher not found." });

    let updateData = { name, email, department, employeeId, phone, collegeName, designation, accountNumber, ifscCode, panel };
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data: updateData
    });

    res.json({ message: "Teacher updated successfully.", teacher: { ...teacher, _id: teacher.id } });
  } catch (error) {
    console.error("Update Teacher Error:", error);
    res.status(500).json({ message: "Failed to update teacher" });
  }
});

// DELETE a teacher
router.delete("/teachers/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id } });
    res.json({ message: "Teacher deleted successfully." });
  } catch (error) {
    console.error("Delete Teacher Error:", error);
    res.status(500).json({ message: "Failed to delete teacher" });
  }
});

// GET all answer sheets
router.get("/answer-sheets", protectAdmin, async (req, res) => {
  try {
    const scriptsRaw = await prisma.answerSheet.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        questionPaper: {
          select: { subject: true, subjectCode: true, examName: true }
        },
        assignedTo: {
          select: { name: true, email: true, department: true }
        }
      }
    });
    // Map for frontend compatibility
    const scripts = scriptsRaw.map(s => {
      const script = { ...s, _id: s.id };
      if (script.assignedTo) {
         script.teacherId = script.assignedTo;
      }
      return script;
    });
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

    const script = await prisma.answerSheet.findUnique({ where: { id: scriptId } });
    if (!script) {
      return res.status(404).json({ message: "Answer script not found" });
    }

    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Assign the script
    let updatedStatus = script.status;
    if (script.status === "available") {
      updatedStatus = "assigned";
    }

    const updatedScript = await prisma.answerSheet.update({
      where: { id: scriptId },
      data: {
        assignedToId: teacherId,
        status: updatedStatus,
        assignedAt: new Date()
      }
    });

    res.json({ message: "Script assigned successfully", script: { ...updatedScript, _id: updatedScript.id } });
  } catch (error) {
    console.error("Admin Assign Script Error:", error);
    res.status(500).json({ message: "Failed to assign script" });
  }
});

// GET /api/admin/subject-results
router.get("/subject-results", protectAdmin, async (req, res) => {
  try {
    const evaluations = await prisma.evaluation.findMany({
      where: { status: "submitted" },
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
    console.error("Fetch Admin Subject Results Error:", error);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
});

// GET /api/admin/subject-results/:questionPaperId
router.get("/subject-results/:questionPaperId", protectAdmin, async (req, res) => {
  try {
    const { questionPaperId } = req.params;
    const evaluationsRaw = await prisma.evaluation.findMany({
      where: { 
        status: "submitted",
        answerSheet: { questionPaperId }
      },
      include: { answerSheet: { include: { questionPaper: true } }, teacher: { select: { name: true, department: true } } }
    });

    const evaluations = evaluationsRaw.map(e => ({ ...e, _id: e.id }));
    res.json({ success: true, evaluations });
  } catch (error) {
    console.error("Fetch Admin Subject Details Error:", error);
    res.status(500).json({ message: "Failed to fetch subject details" });
  }
});

export default router;
