import express from "express";
import Exam from "../models/Exam.js";
import ExamRegistration from "../models/ExamRegistration.js";
import AdmitCard from "../models/AdmitCard.js";
import Result from "../models/Result.js";
import { protectStudent } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Exams ---

router.get("/available-exams", protectStudent, async (req, res) => {
  try {
    const studentId = req.student.id;
    const exams = await Exam.find({ status: "upcoming" });
    
    // Filter out exams already registered
    const registrations = await ExamRegistration.find({ student: studentId });
    const registeredExamIds = registrations.map(reg => reg.exam.toString());
    
    const availableExams = exams.filter(e => !registeredExamIds.includes(e._id.toString()));
    
    res.json(availableExams);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- Registration ---

router.post("/register/:id", protectStudent, async (req, res) => {
  try {
    const examId = req.params.id;
    const studentId = req.student.id;

    let existing = await ExamRegistration.findOne({ student: studentId, exam: examId });
    if (existing) {
      return res.status(400).json({ message: "Already registered for this exam." });
    }

    const registration = new ExamRegistration({
      student: studentId,
      exam: examId,
    });
    await registration.save();

    res.json({ message: "Successfully registered for exam. Pending fee payment.", registration });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.get("/my-registrations", protectStudent, async (req, res) => {
  try {
    const registrations = await ExamRegistration.find({ student: req.student.id }).populate("exam");
    res.json(registrations);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.put("/pay-fee/:id", protectStudent, async (req, res) => {
  try {
    const regId = req.params.id;
    const registration = await ExamRegistration.findOne({ _id: regId, student: req.student.id });
    
    if (!registration) {
      return res.status(404).json({ message: "Registration not found." });
    }

    registration.feeStatus = "Paid";
    await registration.save();
    
    res.json({ message: "Fee paid successfully", registration });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- Admit Cards ---

router.get("/my-admit-cards", protectStudent, async (req, res) => {
  try {
    const admitCards = await AdmitCard.find({ student: req.student.id }).populate("exam");
    res.json(admitCards);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- Results ---

router.get("/my-results", protectStudent, async (req, res) => {
  try {
    // Only return results that are published
    const results = await Result.find({ student: req.student.id, isPublished: true }).populate("exam");
    res.json(results);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

export default router;
