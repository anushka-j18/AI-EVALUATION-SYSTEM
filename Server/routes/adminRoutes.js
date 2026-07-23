import express from "express";
import bcrypt from "bcryptjs";
import { protectAdmin } from "../middleware/authMiddleware.js";
import Teacher from "../models/Teacher.js";
import AnswerSheet from "../models/AnswerSheet.js";
import Evaluation from "../models/Evaluation.js";
import multer from "multer";
import csvParser from "csv-parser";
import { Readable } from "stream";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const generateFacultyId = () => {
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `FAC-${randomChars}`;
};

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
    const teachers = await Teacher.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ teachers });
  } catch (error) {
    console.error("Fetch Teachers Error:", error);
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
});

// POST create new teacher
router.post("/teachers", protectAdmin, async (req, res) => {
  try {
    const { name, email, department, employeeId, phone, collegeName, designation, accountNumber, ifscCode, panel, subjectCode } = req.body;
    
    const existing = await Teacher.findOne({ email });
    if (existing) return res.status(400).json({ message: "Teacher with this email already exists." });

    const finalEmployeeId = employeeId || generateFacultyId();

    const username = email.split("@")[0];
    const rawPassword = `${username}@123`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const teacher = await Teacher.create({
      name, email, password: hashedPassword, department, employeeId: finalEmployeeId, phone, collegeName, designation, accountNumber, ifscCode, panel, subjectCode, isActive: true
    });

    res.status(201).json({ 
      message: "Teacher created successfully.", 
      teacher,
      rawPassword 
    });
  } catch (error) {
    console.error("Create Teacher Error:", error);
    res.status(500).json({ message: "Failed to create teacher" });
  }
});

// POST /admin/teachers/bulk-upload
router.post("/teachers/bulk-upload", protectAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const results = [];
  
  const stream = Readable.from(req.file.buffer);
  
  stream
    .pipe(csvParser({ mapHeaders: ({ header }) => header.replace(/^[\u200B-\u200D\uFEFF]+/g, "").replace(/['"]/g, "").trim().toLowerCase() }))
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      let successCount = 0;
      let failedCount = 0;
      let duplicateCount = 0;
      const createdTeachers = [];
      
      const salt = await bcrypt.genSalt(10);

      for (const row of results) {
        try {
          if (!row.email || !row.name) {
            failedCount++;
            continue;
          }

          const existing = await Teacher.findOne({ email: row.email });
          if (existing) {
            duplicateCount++;
            continue;
          }

          const finalEmployeeId = row.employeeid || row['employee id'] || generateFacultyId();

          const username = row.email.split("@")[0];
          const rawPassword = `${username}@123`;
          const hashedPassword = await bcrypt.hash(rawPassword, salt);

          await Teacher.create({
            name: row.name,
            email: row.email,
            password: hashedPassword,
            department: row.department || "",
            employeeId: finalEmployeeId,
            phone: row.phone || "",
            collegeName: row.collegename || row['college name'] || "",
            designation: row.designation || "",
            subjectCode: row.subjectcode || row['subject code'] || "",
            isActive: true,
          });
          
          createdTeachers.push({
            name: row.name,
            email: row.email,
            password: rawPassword
          });
          
          successCount++;
        } catch (err) {
          console.error("Row import error", err);
          failedCount++;
        }
      }
      
      res.json({ 
        message: `Import complete. Total Records: ${results.length}, Successfully Created: ${successCount}, Failed Records: ${failedCount}, Duplicate Records: ${duplicateCount}`,
        stats: { successCount, failedCount, duplicateCount, total: results.length },
        createdTeachers
      });
    });
});

// PUT update existing teacher
router.put("/teachers/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, department, employeeId, phone, collegeName, designation, accountNumber, ifscCode, panel, subjectCode } = req.body;

    const existing = await Teacher.findById(id);
    if (!existing) return res.status(404).json({ message: "Teacher not found." });

    let updateData = { name, email, department, employeeId, phone, collegeName, designation, accountNumber, ifscCode, panel, subjectCode };
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const teacher = await Teacher.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    res.json({ message: "Teacher updated successfully.", teacher });
  } catch (error) {
    console.error("Update Teacher Error:", error);
    res.status(500).json({ message: "Failed to update teacher" });
  }
});

// DELETE a teacher
router.delete("/teachers/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Teacher.findByIdAndDelete(id);
    res.json({ message: "Teacher deleted successfully." });
  } catch (error) {
    console.error("Delete Teacher Error:", error);
    res.status(500).json({ message: "Failed to delete teacher" });
  }
});

// GET all answer sheets
router.get("/answer-sheets", protectAdmin, async (req, res) => {
  try {
    const scripts = await AnswerSheet.find()
      .populate("questionPaper", "subject subjectCode examName")
      .populate("assignedTo", "name email department")
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
    let updatedStatus = script.status;
    if (script.status === "available") {
      updatedStatus = "assigned";
    }

    script.assignedTo = teacherId;
    script.status = updatedStatus;
    script.assignedAt = new Date();
    await script.save();

    res.json({ message: "Script assigned successfully", script });
  } catch (error) {
    console.error("Admin Assign Script Error:", error);
    res.status(500).json({ message: "Failed to assign script" });
  }
});

// POST bulk assign answer scripts to a teacher
router.post("/assign-scripts-bulk", protectAdmin, async (req, res) => {
  try {
    const { scriptIds, teacherId } = req.body;

    if (!Array.isArray(scriptIds) || scriptIds.length === 0 || !teacherId) {
      return res.status(400).json({ message: "An array of scriptIds and a teacherId are required" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Assign all scripts in bulk
    const updateResult = await AnswerSheet.updateMany(
      {
        _id: { $in: scriptIds },
        status: "available"
      },
      {
        $set: {
          assignedTo: teacherId,
          status: "assigned",
          assignedAt: new Date()
        }
      }
    );

    res.json({ message: `Successfully assigned ${updateResult.modifiedCount} scripts.`, count: updateResult.modifiedCount });
  } catch (error) {
    console.error("Admin Bulk Assign Scripts Error:", error);
    res.status(500).json({ message: "Failed to bulk assign scripts" });
  }
});

// GET /api/admin/subject-results
router.get("/subject-results", protectAdmin, async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ status: "submitted" })
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
    console.error("Fetch Admin Subject Results Error:", error);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
});

// GET /api/admin/subject-results/:questionPaperId
router.get("/subject-results/:questionPaperId", protectAdmin, async (req, res) => {
  try {
    const { questionPaperId } = req.params;
    
    // First find answer sheets for this question paper
    const answerSheetIds = await AnswerSheet.find({ questionPaper: questionPaperId }).distinct("_id");
    
    const evaluations = await Evaluation.find({
      status: "submitted",
      answerSheetId: { $in: answerSheetIds }
    })
    .populate({
      path: "answerSheetId",
      populate: { path: "questionPaper" }
    })
    .populate("teacherId", "name department");

    res.json({ success: true, evaluations });
  } catch (error) {
    console.error("Fetch Admin Subject Details Error:", error);
    res.status(500).json({ message: "Failed to fetch subject details" });
  }
});

export default router;
