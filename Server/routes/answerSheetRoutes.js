import express from "express";
import multer from "multer";
import fs from "fs";
import AnswerSheet from "../models/AnswerSheet.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================
// UPLOADS FOLDER
// ============================

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ============================
// MULTER
// ============================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ============================
// UPLOAD ANSWER SHEET
// ============================

router.post(
  "/upload",
  authMiddleware,
  upload.single("answerSheet"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Answer sheet file is required.",
        });
      }

      const { studentName, rollNumber, questionPaperId } = req.body;

      if (!studentName || !rollNumber || !questionPaperId) {
        return res.status(400).json({
          success: false,
          message: "Student name, roll number, and question paper ID are required.",
        });
      }

      const answerSheet = await AnswerSheet.create({
        studentName,
        rollNumber,
        questionPaper: questionPaperId,
        fileUrl: req.file.path,
        status: "available",
      });

      res.status(201).json({
        success: true,
        message: "Answer sheet uploaded successfully.",
        answerSheet,
      });
    } catch (error) {
      console.log("UPLOAD ANSWER SHEET ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Upload failed.",
        error: error.message,
      });
    }
  }
);

// ============================
// GET AVAILABLE SCRIPTS
// ============================

router.get("/available", authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;

    let query = { status: "available" };

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
      ];
    }

    const scripts = await AnswerSheet.find(query)
      .populate("questionPaper")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: scripts.length,
      scripts,
    });
  } catch (error) {
    console.log("GET AVAILABLE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch available scripts.",
    });
  }
});

// ============================
// CLAIM SCRIPT
// ============================

router.post("/:id/claim", authMiddleware, async (req, res) => {
  try {
    const answerSheet = await AnswerSheet.findById(req.params.id);

    if (!answerSheet) {
      return res.status(404).json({
        success: false,
        message: "Answer sheet not found.",
      });
    }

    if (answerSheet.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "This script is no longer available.",
      });
    }

    answerSheet.status = "assigned";
    answerSheet.assignedTo = req.teacher._id;
    answerSheet.assignedAt = new Date();
    await answerSheet.save();

    res.status(200).json({
      success: true,
      message: "Script claimed successfully.",
      answerSheet,
    });
  } catch (error) {
    console.log("CLAIM SCRIPT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to claim script.",
    });
  }
});

// ============================
// GET ASSIGNED SCRIPTS
// ============================

router.get("/assigned", authMiddleware, async (req, res) => {
  try {
    const scripts = await AnswerSheet.find({
      assignedTo: req.teacher._id,
      status: { $in: ["assigned", "pending"] },
    })
      .populate("questionPaper")
      .sort({ assignedAt: -1 });

    res.status(200).json({
      success: true,
      count: scripts.length,
      scripts,
    });
  } catch (error) {
    console.log("GET ASSIGNED ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned scripts.",
    });
  }
});

// ============================
// GET PENDING SCRIPTS
// ============================

router.get("/pending", authMiddleware, async (req, res) => {
  try {
    const scripts = await AnswerSheet.find({
      assignedTo: req.teacher._id,
      status: "pending",
    })
      .populate("questionPaper")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: scripts.length,
      scripts,
    });
  } catch (error) {
    console.log("GET PENDING ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pending scripts.",
    });
  }
});

// ============================
// GET EVALUATED SCRIPTS
// ============================

router.get("/evaluated", authMiddleware, async (req, res) => {
  try {
    const scripts = await AnswerSheet.find({
      assignedTo: req.teacher._id,
      status: "evaluated",
    })
      .populate("questionPaper")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: scripts.length,
      scripts,
    });
  } catch (error) {
    console.log("GET EVALUATED ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch evaluated scripts.",
    });
  }
});

// ============================
// GET SINGLE ANSWER SHEET
// ============================

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const answerSheet = await AnswerSheet.findById(req.params.id)
      .populate({
        path: "questionPaper",
        populate: { path: "questions" },
      });

    if (!answerSheet) {
      return res.status(404).json({
        success: false,
        message: "Answer sheet not found.",
      });
    }

    res.status(200).json({
      success: true,
      answerSheet,
    });
  } catch (error) {
    console.log("GET ANSWER SHEET ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch answer sheet.",
    });
  }
});

export default router;
