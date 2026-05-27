// routes/questionRoutes.js

import express from "express";

import Question from "../models/Question.js";

const router = express.Router();


// ======================================
// GET QUESTIONS BY QUESTION PAPER ID
// ======================================

router.get(

  "/paper/:paperId",

  async (req, res) => {

    try {

      const { paperId } =
        req.params;

      const questions =
        await Question.find({

          questionPaper:
            paperId,
        }).sort({
          createdAt: 1,
        });

      res.json({

        success: true,

        count:
          questions.length,

        questions,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to fetch questions",
      });
    }
  }
);


// ======================================
// UPDATE QUESTION
// ======================================

router.put(

  "/:id",

  async (req, res) => {

    try {

      const {
        qNo,
        question,
        maxMarks,
      } = req.body;

      const updatedQuestion =
        await Question.findByIdAndUpdate(

          req.params.id,

          {
            qNo,
            question,
            maxMarks,
          },

          {
            new: true,
          }
        );

      res.json({

        success: true,

        question:
          updatedQuestion,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Question update failed",
      });
    }
  }
);


// ======================================
// DELETE QUESTION
// ======================================

router.delete(

  "/:id",

  async (req, res) => {

    try {

      await Question.findByIdAndDelete(
        req.params.id
      );

      res.json({

        success: true,

        message:
          "Question deleted successfully",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Delete failed",
      });
    }
  }
);

export default router;