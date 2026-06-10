import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import aiRoutes from "./routes/aiRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import QPRoutes
from "./routes/questionPaperRoutes.js";
import QuestionPaper from "./routes/questionPaperRoutes.js";
import questionRoutes
from "./routes/questionRoutes.js";

import teacherAuthRoutes from "./routes/teacherAuthRoutes.js";
import answerSheetRoutes from "./routes/answerSheetRoutes.js";
import teacherEvaluationRoutes from "./routes/teacherEvaluationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import "./services/cronService.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads",express.static("uploads"));



app.use("/api/ai", aiRoutes);
app.use("/api/question-papers",QPRoutes);
app.use("/api", evaluationRoutes);
app.use(
  "/api/questions",
  questionRoutes
);

app.use("/api/auth", teacherAuthRoutes);
app.use("/api/answer-sheets", answerSheetRoutes);
app.use("/api/teacher-evaluations", teacherEvaluationRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});