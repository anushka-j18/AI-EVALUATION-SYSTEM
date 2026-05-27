import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import aiRoutes from "./routes/aiRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import QPRoutes
from "./routes/questionPaperRoutes.js";
import QuestionPaper from "./routes/questionPaperRoutes.js";
import questionRoutes
from "./routes/questionRoutes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads",express.static("uploads"));

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected");
});

app.use("/api/ai", aiRoutes);
app.use("/api/question-papers",QPRoutes);
app.use("/api", evaluationRoutes);
app.use(
  "/api/questions",
  questionRoutes
);
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});