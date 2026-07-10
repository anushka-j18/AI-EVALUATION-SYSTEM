import express from "express";
import Evaluation from "../models/Evaluation.js";

const router = express.Router();

router.get("/evaluations", async (req, res) => {
  try {
    const evaluations = await Evaluation.find();
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;