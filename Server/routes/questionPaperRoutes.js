import express from "express";
import multer from "multer";
import fs from "fs";

import QuestionPaper from "../models/QuestionPaper.js";
import Question from "../models/Question.js";

import {
  extractTextFromFile,
} from "../services/ocrService.js";

import {
  parseQuestions,
} from "../services/questionParserService.js";

const router = express.Router();


// CREATE UPLOADS FOLDER

if (!fs.existsSync("uploads")) {

  fs.mkdirSync("uploads");
}


// MULTER STORAGE

const storage = multer.diskStorage({

  destination: function (
    req,
    file,
    cb
  ) {

    cb(
      null,
      "uploads/"
    );
  },

  filename: function (
    req,
    file,
    cb
  ) {

    cb(
      null,
      Date.now() +
      "-" +
      file.originalname
    );
  },
});


// FILE FILTER

const fileFilter = (
  req,
  file,
  cb
) => {

  const allowed = [

    "application/pdf",

    "image/png",

    "image/jpeg",

    "image/jpg",
  ];

  if (
    allowed.includes(
      file.mimetype
    )
  ) {

    cb(null, true);

  } else {

    cb(
      new Error(
        "Only PDF/JPG/PNG allowed"
      )
    );
  }
};


// MULTER

const upload = multer({

  storage,

  fileFilter,

  limits: {

    fileSize:
      20 *
      1024 *
      1024,
  },
});


// ============================
// UPLOAD QUESTION PAPER
// ============================

router.post(

  "/upload",

  upload.single(
    "questionPaper"
  ),

  async (
    req,
    res
  ) => {

    try {

      // VALIDATION

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "Question paper file required",
        });
      }

      const {

        subject,

        subjectCode,

        examName,

        session,

        totalMarks,
      } = req.body;


      // ============================
      // EXTRACT TEXT FROM PDF
      // ============================

      const extractedText =
        await extractTextFromFile(
          req.file.path
        );

      console.log(
        "EXTRACTED TEXT:"
      );

      console.log(
        extractedText
      );


      // ============================
      // PARSE QUESTIONS
      // ============================

      const parsedQuestions =
        await parseQuestions(extractedText);

      console.log("PARSED QUESTIONS:");

      console.log(parsedQuestions);


      // ============================
      // SAVE QUESTION PAPER
      // ============================

      const paper =
        await QuestionPaper.create({

          subject,

          subjectCode,

          examName,

          session,

          totalMarks,

          fileUrl:
            req.file.path,
        });
      // ============================
// SAVE QUESTIONS
// ============================

const questionIds = [];

if (
  parsedQuestions &&
  parsedQuestions.length > 0
) {
console.log("YES")
  for (const q of parsedQuestions) {

    try {

      console.log(
        "QUESTION RECEIVED = ",
        q
      );

      const savedQuestion =
        await Question.create({

          qNo:
            String(
              q.qNo ||
              q.questionNumber ||
              ""
            ),

          question:
            q.question ||
            q.questionText ||
            "",

          maxMarks:
            
              q.maxMarks || 0
            ,

          questionPaper:
            paper._id,
        });

      console.log(
        "QUESTION SAVED = ",
        savedQuestion
      );

      questionIds.push(
        savedQuestion._id
      );

    } catch (err) {

      console.log(
        "QUESTION SAVE ERROR = ",
        err.message
      );

      console.log(
        "FAILED QUESTION = ",
        q
      );
    }
  }
}

      

      // ============================
      // UPDATE PAPER
      // ============================

      paper.questions =
        questionIds;

      await paper.save();


      // ============================
      // RESPONSE
      // ============================

      res.status(201).json({

        success: true,

        message:
          "Question Paper Uploaded Successfully",

        paper,

        questions:
          parsedQuestions || [],
      });

    } catch (error) {

      console.log(
        "UPLOAD ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Upload Failed",

        error:
          error.message,
      });
    }
  }
);


// ============================
// GET ALL QUESTION PAPERS
// ============================

router.get(

  "/",

  async (
    req,
    res
  ) => {

    try {

      const papers =
        await QuestionPaper
          .find()
          .populate(
            "questions"
          )
          .sort({
            createdAt: -1,
          });

      res.json({

        success: true,

        papers,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to fetch papers",
      });
    }
  }
);

export default router;