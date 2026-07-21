import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import { protectStudent } from "../middleware/authMiddleware.js"; // I need to create protectStudent

const router = express.Router();

// @route   POST /api/student/auth/login
// @desc    Student login
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { registrationNumber, password } = req.body;

    const student = await Student.findOne({ registrationNumber });
    if (!student) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = {
      student: {
        id: student.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          student: {
            id: student.id,
            name: student.name,
            registrationNumber: student.registrationNumber,
            rollNumber: student.rollNumber,
            course: student.course,
            semester: student.semester,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/student/auth/me
// @desc    Get logged in student
// @access  Private
router.get("/me", protectStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select("-password");
    res.json({ student });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;
