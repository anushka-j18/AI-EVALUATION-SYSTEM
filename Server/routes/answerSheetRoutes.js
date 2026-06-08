import express from "express";
import multer from "multer";
import fs from "fs";
import prisma from "../prismaClient.js";
import authMiddleware, { protectAdmin } from "../middleware/authMiddleware.js";

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

      const answerSheet = await prisma.answerSheet.create({
        data: {
          studentName,
          rollNumber,
          questionPaperId,
          fileUrl: req.file.path,
          status: "available",
        }
      });

      res.status(201).json({
        success: true,
        message: "Answer sheet uploaded successfully.",
        answerSheet: { ...answerSheet, _id: answerSheet.id },
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
// BULK UPLOAD ANSWER SHEETS (ADMIN ONLY)
// ============================
router.post(
  "/upload-bulk",
  protectAdmin,
  upload.array("answerSheets", 50),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one answer sheet file is required.",
        });
      }

      const { metadata } = req.body; // Expecting a JSON string of array
      if (!metadata) {
        return res.status(400).json({
          success: false,
          message: "Metadata is required.",
        });
      }

      const parsedMetadata = JSON.parse(metadata);
      
      if (parsedMetadata.length !== req.files.length) {
        return res.status(400).json({
          success: false,
          message: "Mismatch between number of files and metadata entries.",
        });
      }

      const answerSheetsToCreate = req.files.map((file, index) => {
        const meta = parsedMetadata[index];
        return {
          studentName: meta.studentName,
          rollNumber: meta.rollNumber,
          questionPaperId: meta.questionPaperId,
          fileUrl: file.path,
          status: "available",
        };
      });

      const result = await prisma.answerSheet.createMany({
        data: answerSheetsToCreate
      });

      res.status(201).json({
        success: true,
        message: `${result.count} answer sheets uploaded successfully.`,
      });
    } catch (error) {
      console.log("BULK UPLOAD ERROR:", error);
      res.status(500).json({
        success: false,
        message: "Bulk upload failed.",
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
    let where = { status: "available" };

    if (search) {
      where.OR = [
        { studentName: { contains: search, mode: "insensitive" } },
        { rollNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const assignedCodes = req.teacher.subjectCode
      ? req.teacher.subjectCode.split(',').map(c => c.trim()).filter(Boolean)
      : [];

    if (assignedCodes.length > 0) {
      where.questionPaper = { subjectCode: { in: assignedCodes } };
    } else {
      // Force empty result if no subject codes are assigned
      where.questionPaper = { subjectCode: { in: [] } };
    }

    const scriptsRaw = await prisma.answerSheet.findMany({
      where,
      include: { questionPaper: true },
      orderBy: { createdAt: "desc" },
    });

    const scripts = scriptsRaw.map(s => ({ ...s, _id: s.id }));

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
    const answerSheetId = req.params.id;
    const teacherId = req.teacher.id || req.teacher._id;

    const answerSheet = await prisma.answerSheet.findUnique({
      where: { id: answerSheetId }
    });

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

    const updatedSheet = await prisma.answerSheet.update({
      where: { id: answerSheetId },
      data: {
        status: "assigned",
        assignedToId: teacherId,
        assignedAt: new Date(),
      }
    });

    res.status(200).json({
      success: true,
      message: "Script claimed successfully.",
      answerSheet: { ...updatedSheet, _id: updatedSheet.id },
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
    const teacherId = req.teacher.id || req.teacher._id;
    const scriptsRaw = await prisma.answerSheet.findMany({
      where: {
        assignedToId: teacherId,
        status: { in: ["assigned", "pending"] },
      },
      include: { questionPaper: true },
      orderBy: { assignedAt: "desc" },
    });

    const scripts = scriptsRaw.map(s => ({ ...s, _id: s.id }));

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
    const teacherId = req.teacher.id || req.teacher._id;
    const scriptsRaw = await prisma.answerSheet.findMany({
      where: {
        assignedToId: teacherId,
        status: "pending",
      },
      include: { questionPaper: true },
      orderBy: { updatedAt: "desc" },
    });

    const scripts = scriptsRaw.map(s => ({ ...s, _id: s.id }));

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
    const teacherId = req.teacher.id || req.teacher._id;
    const scriptsRaw = await prisma.answerSheet.findMany({
      where: {
        assignedToId: teacherId,
        status: "evaluated",
      },
      include: { questionPaper: true },
      orderBy: { updatedAt: "desc" },
    });

    const scripts = scriptsRaw.map(s => ({ ...s, _id: s.id }));

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
    const answerSheet = await prisma.answerSheet.findUnique({
      where: { id: req.params.id },
      include: {
        questionPaper: {
          include: { questions: true }
        }
      }
    });

    if (!answerSheet) {
      return res.status(404).json({
        success: false,
        message: "Answer sheet not found.",
      });
    }

    res.status(200).json({
      success: true,
      answerSheet: {
        ...answerSheet,
        _id: answerSheet.id,
        questionPaper: {
            ...answerSheet.questionPaper,
            _id: answerSheet.questionPaper.id
        }
      },
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
