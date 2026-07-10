import express from "express";
import Question from "../models/Question.js";

const router = express.Router();

// ======================================
// GET QUESTIONS BY QUESTION PAPER ID
// ======================================
router.get("/paper/:paperId", async (req, res) => {
  try {
    const { paperId } = req.params;

    const questions = await Question.find({ questionPaper: paperId })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
    });
  }
});

// ======================================
// UPDATE ALL QUESTIONS FOR A PAPER
// ======================================
router.put("/update-all/:paperId", async (req, res) => {
  try {
    const { paperId } = req.params;
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: "Invalid questions data" });
    }

    for (const q of questions) {
      if (q._id) {
        // Update existing question
        await Question.findByIdAndUpdate(q._id, {
          section: q.section || "",
          qNo: String(q.qNo),
          question: q.question,
          maxMarks: Number(q.maxMarks) || 0,
          isOptional: Boolean(q.isOptional),
          groupId: q.groupId || "",
          requiredAttempts: q.requiredAttempts ? Number(q.requiredAttempts) : null
        });
      } else {
        // Create newly added question
        await Question.create({
          section: q.section || "",
          qNo: String(q.qNo),
          question: q.question,
          maxMarks: Number(q.maxMarks) || 0,
          isOptional: Boolean(q.isOptional),
          groupId: q.groupId || "",
          requiredAttempts: q.requiredAttempts ? Number(q.requiredAttempts) : null,
          questionPaper: paperId
        });
      }
    }

    res.json({ success: true, message: "Questions updated successfully" });
  } catch (error) {
    console.log("Update All Error:", error);
    res.status(500).json({ success: false, message: "Failed to update questions" });
  }
});

// ======================================
// UPDATE QUESTION
// ======================================
router.put("/:id", async (req, res) => {
  try {
    const { qNo, question, maxMarks } = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      {
        qNo,
        question,
        maxMarks: Number(maxMarks) || 0,
      },
      { new: true }
    );

    res.json({
      success: true,
      question: updatedQuestion,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Question update failed",
    });
  }
});

// ======================================
// DELETE QUESTION
// ======================================
router.delete("/:id", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
});

export default router;