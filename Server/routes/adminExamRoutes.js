import express from "express";
import Exam from "../models/Exam.js";
import ExamRegistration from "../models/ExamRegistration.js";
import AdmitCard from "../models/AdmitCard.js";
import Result from "../models/Result.js";
import Student from "../models/Student.js";
import Evaluation from "../models/Evaluation.js";
import QuestionPaper from "../models/QuestionPaper.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
import crypto from "crypto";

const router = express.Router();

// --- Exam Management ---

router.post("/", protectAdmin, async (req, res) => {
  try {
    const { name, date, center, subjects } = req.body;
    const exam = new Exam({
      name,
      date,
      center,
      subjects,
      createdBy: req.admin.id,
    });
    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.get("/", protectAdmin, async (req, res) => {
  try {
    const exams = await Exam.find().sort({ date: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: "Exam deleted" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- Registrations & Fee Status ---

router.get("/:id/registrations", protectAdmin, async (req, res) => {
  try {
    const registrations = await ExamRegistration.find({ exam: req.params.id }).populate("student", "-password");
    res.json(registrations);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.put("/registration/:id/fee", protectAdmin, async (req, res) => {
  try {
    const { feeStatus } = req.body;
    const registration = await ExamRegistration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: "Registration not found" });

    registration.feeStatus = feeStatus;
    await registration.save();
    res.json(registration);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- Admit Cards ---

router.post("/:id/generate-admit-cards", protectAdmin, async (req, res) => {
  try {
    const examId = req.params.id;
    // Find all paid registrations
    const registrations = await ExamRegistration.find({ exam: examId, feeStatus: "Paid" });
    let count = 0;

    for (let reg of registrations) {
      const existing = await AdmitCard.findOne({ student: reg.student, exam: examId });
      if (!existing) {
        const uniqueId = `AC-${crypto.randomBytes(4).toString("hex").toUpperCase()}-${reg.student}`;
        const admitCard = new AdmitCard({
          student: reg.student,
          exam: examId,
          uniqueId,
        });
        await admitCard.save();
        count++;
      }
    }
    res.json({ message: `Generated ${count} new admit cards.` });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.get("/:id/admit-cards", protectAdmin, async (req, res) => {
  try {
    const cards = await AdmitCard.find({ exam: req.params.id }).populate("student", "-password");
    res.json(cards);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- Results ---

router.post("/:id/generate-results", protectAdmin, async (req, res) => {
  try {
    const examId = req.params.id;
    const registrations = await ExamRegistration.find({ exam: examId }).populate("student");
    let count = 0;

    for (let reg of registrations) {
      const student = reg.student;
      const existingResult = await Result.findOne({ student: student._id, exam: examId });
      
      if (!existingResult) {
        // Fetch evaluations for this student's rollNumber
        const evaluations = await Evaluation.find({ rollNumber: student.rollNumber }).populate("answerSheetId");
        
        let subjectsMarks = [];
        let totalObtained = 0;
        let totalMax = 0;
        
        if (evaluations.length > 0) {
          for (let ev of evaluations) {
            let maxM = ev.totalMarks > 0 ? ev.totalMarks : 100; // Mock max marks if 0
            if (ev.questionWiseMarks && ev.questionWiseMarks.length > 0) {
              maxM = ev.questionWiseMarks.reduce((acc, curr) => acc + (curr.maxMarks || 0), 0);
            }
            if (maxM === 0) maxM = 100;
            
            let obtM = ev.totalMarks || 0;
            
            let subjectName = "Subject Unknown";
            if (ev.answerSheetId && ev.answerSheetId.questionPaper) {
              const qp = await QuestionPaper.findById(ev.answerSheetId.questionPaper);
              if (qp) subjectName = qp.subjectName || qp.title || "Subject";
            } else {
               subjectName = "Subject " + (subjectsMarks.length + 1);
            }
            
            subjectsMarks.push({
              subjectName,
              marksObtained: obtM,
              maxMarks: maxM,
            });
            totalObtained += obtM;
            totalMax += maxM;
          }
        } else {
           // Create dummy marks if no evaluations found (for demo purposes)
           const dummyObtained = Math.floor(Math.random() * 40) + 40; 
           subjectsMarks.push({
             subjectName: "Demo Subject",
             marksObtained: dummyObtained,
             maxMarks: 100
           });
           totalObtained += dummyObtained;
           totalMax += 100;
        }

        const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
        let grade = "F";
        let passStatus = "Fail";

        if (percentage >= 90) { grade = "A"; passStatus = "Pass"; }
        else if (percentage >= 80) { grade = "B"; passStatus = "Pass"; }
        else if (percentage >= 70) { grade = "C"; passStatus = "Pass"; }
        else if (percentage >= 50) { grade = "D"; passStatus = "Pass"; }

        const result = new Result({
          student: student._id,
          exam: examId,
          subjects: subjectsMarks,
          totalMarksObtained: totalObtained,
          totalMaxMarks: totalMax,
          percentage: percentage.toFixed(2),
          grade,
          passStatus,
          isPublished: false // By default, not published
        });
        await result.save();
        count++;
      }
    }

    res.json({ message: `Generated ${count} results.` });
  } catch (err) {
    console.log(err)
    res.status(500).send("Server Error");
  }
});

router.get("/:id/results", protectAdmin, async (req, res) => {
  try {
    const results = await Result.find({ exam: req.params.id }).populate("student", "-password");
    res.json(results);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.put("/result/:id/publish", protectAdmin, async (req, res) => {
  try {
    const { isPublished } = req.body;
    const result = await Result.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Result not found" });

    result.isPublished = isPublished;
    await result.save();
    res.json(result);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

export default router;
