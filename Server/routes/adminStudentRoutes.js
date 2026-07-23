import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import csv from "csv-parser";
import stream from "stream";
import Student from "../models/Student.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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

// @route   PUT /api/admin/students/:id
// @desc    Update a student
// @access  Private (Admin)
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    const { name, registrationNumber, rollNumber, password, course, semester, email } = req.body;

    let student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if updating registration number to one that already exists
    if (registrationNumber && registrationNumber !== student.registrationNumber) {
        const existingStudent = await Student.findOne({ registrationNumber });
        if (existingStudent) {
             return res.status(400).json({ message: "Registration Number already in use by another student." });
        }
    }

    student.name = name || student.name;
    student.registrationNumber = registrationNumber || student.registrationNumber;
    student.rollNumber = rollNumber || student.rollNumber;
    student.course = course || student.course;
    student.semester = semester || student.semester;
    student.email = email || student.email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password, salt);
    }

    await student.save();
    res.json({ message: "Student updated successfully", student });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/admin/students/bulk-upload
// @desc    Bulk upload students via CSV
// @access  Private (Admin)
router.post("/bulk-upload", protectAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a CSV file." });
    }

    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
      .pipe(csv({
        mapHeaders: ({ header }) => {
          // Strip BOM, quotes, and whitespace
          const cleanHeader = header.replace(/^[\u200B-\u200D\uFEFF]+/g, "").replace(/['"]/g, "").trim().toLowerCase();
          // Map common names to expected keys
          if (cleanHeader.includes("reg") && (cleanHeader.includes("no") || cleanHeader.includes("num"))) return "registrationNumber";
          if (cleanHeader.includes("roll")) return "rollNumber";
          if (cleanHeader === "name" || cleanHeader === "full name") return "name";
          if (cleanHeader.includes("pass")) return "password";
          if (cleanHeader.includes("course")) return "course";
          if (cleanHeader.includes("sem")) return "semester";
          if (cleanHeader.includes("email")) return "email";
          return cleanHeader; // default
        }
      }))
      .on("error", (err) => {
        console.error("CSV Parsing Error:", err);
        if (!res.headersSent) {
          res.status(400).json({ message: "Failed to parse CSV file. Ensure it is a valid CSV." });
        }
      })
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        let successCount = 0;
        let errors = [];

        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          const { name, registrationNumber, rollNumber, password, course, semester, email } = row;

          if (!name || !registrationNumber || !rollNumber || !password || !course || !semester) {
             const missing = [];
             if (!name) missing.push("Name");
             if (!registrationNumber) missing.push("Registration Number");
             if (!rollNumber) missing.push("Roll Number");
             if (!password) missing.push("Password");
             if (!course) missing.push("Course");
             if (!semester) missing.push("Semester");
             errors.push(`Row ${i + 1}: Missing required fields (${missing.join(", ")}).`);
             continue;
          }

          try {
            let student = await Student.findOne({ registrationNumber });

            if (student) {
              errors.push(`Row ${i + 1}: Student with Reg No ${registrationNumber} already exists.`);
              continue;
            }

            student = new Student({
              name,
              registrationNumber,
              rollNumber,
              password,
              course,
              semester,
              email: email || "",
            });

            const salt = await bcrypt.genSalt(10);
            student.password = await bcrypt.hash(password, salt);

            await student.save();
            successCount++;
          } catch (err) {
             errors.push(`Row ${i + 1}: Error saving - ${err.message}`);
          }
        }

        res.json({
          message: `Bulk upload completed. ${successCount} added successfully.`,
          errors: errors
        });
      });
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
