import express from "express";
import prisma from "../prismaClient.js";

const router = express.Router();

router.get("/evaluations", async (req, res) => {
  try {
    const evaluations = await prisma.evaluation.findMany();
    // Map id to _id for backward compatibility
    res.json(evaluations.map(e => ({ ...e, _id: e.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;