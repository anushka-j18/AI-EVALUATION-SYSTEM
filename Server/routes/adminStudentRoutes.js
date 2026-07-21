import express from "express";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/admin/students
// @desc    Create a new student
// @access  Private (Admin)
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { name, registrationNumber, rollNumber, password, course, semester, email } = req.body;

    let student = await Student.findOne({ registrationNumber });
    if (student) {
      return res.status(400).json({ message: "Student already exists with this Registration Number." });
    }

    student = new Student({
      name,
      registrationNumber,
      rollNumber,
      password,
      course,
      semester,
      email,
    });

    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(password, salt);

    await student.save();
    res.json({ message: "Student created successfully", student });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/admin/students
// @desc    Get all students
// @access  Private (Admin)
router.get("/", protectAdmin, async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;
