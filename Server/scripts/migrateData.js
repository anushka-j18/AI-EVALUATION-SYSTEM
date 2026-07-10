import 'dotenv/config';
import pg from 'pg';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Teacher from '../models/Teacher.js';
import QuestionPaper from '../models/QuestionPaper.js';
import Question from '../models/Question.js';
import AnswerSheet from '../models/AnswerSheet.js';
import Evaluation from '../models/Evaluation.js';
import AIEvaluation from '../models/AIEvaluation.js';

const { Client } = pg;

const pgUri = "postgresql://postgres.ummyrqngtmgpgjerdvib:%40Icadn%29itt123@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";

async function migrateData() {
  console.log("Connecting to Postgres...");
  const pgClient = new Client({ connectionString: pgUri });
  await pgClient.connect();

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Clearing existing MongoDB collections...");
  await Admin.deleteMany({});
  await Teacher.deleteMany({});
  await QuestionPaper.deleteMany({});
  await Question.deleteMany({});
  await AnswerSheet.deleteMany({});
  await Evaluation.deleteMany({});
  await AIEvaluation.deleteMany({});

  // Fetch all data from Postgres
  console.log("Fetching Postgres data...");
  const [
    admins,
    teachers,
    questionPapers,
    questions,
    answerSheets,
    evaluations,
    aiEvaluations,
  ] = await Promise.all([
    pgClient.query(`SELECT * FROM "Admin"`),
    pgClient.query(`SELECT * FROM "Teacher"`),
    pgClient.query(`SELECT * FROM "QuestionPaper"`),
    pgClient.query(`SELECT * FROM "Question"`),
    pgClient.query(`SELECT * FROM "AnswerSheet"`),
    pgClient.query(`SELECT * FROM "Evaluation"`),
    pgClient.query(`SELECT * FROM "AIEvaluation"`),
  ]);

  // Map to hold old ID to new ObjectId
  const idMap = new Map();
  const generateNewId = (oldId) => {
    if (!oldId) return null;
    if (!idMap.has(oldId)) {
      idMap.set(oldId, new mongoose.Types.ObjectId());
    }
    return idMap.get(oldId);
  };

  try {
    console.log("Migrating Admins...");
    for (const row of admins.rows) {
      await Admin.create({
        _id: generateNewId(row.id),
        name: row.name,
        email: row.email,
        password: row.password,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    }

    console.log("Migrating Teachers...");
    for (const row of teachers.rows) {
      await Teacher.create({
        _id: generateNewId(row.id),
        name: row.name,
        email: row.email,
        password: row.password,
        department: row.department,
        employeeId: row.employeeId,
        phone: row.phone,
        profileImage: row.profileImage,
        collegeName: row.collegeName,
        designation: row.designation,
        accountNumber: row.accountNumber,
        ifscCode: row.ifscCode,
        panel: row.panel,
        subjectCode: row.subjectCode,
        isActive: row.isActive,
        otp: row.otp,
        otpExpiry: row.otpExpiry,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    }

    console.log("Migrating QuestionPapers...");
    for (const row of questionPapers.rows) {
      await QuestionPaper.create({
        _id: generateNewId(row.id),
        subject: row.subject,
        subjectCode: row.subjectCode,
        examName: row.examName,
        session: row.session,
        totalMarks: row.totalMarks,
        fileUrl: row.fileUrl,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    }

    console.log("Migrating Questions...");
    for (const row of questions.rows) {
      await Question.create({
        _id: generateNewId(row.id),
        section: row.section,
        qNo: row.qNo,
        question: row.question,
        maxMarks: row.maxMarks,
        questionPaper: generateNewId(row.questionPaperId), // Foreign key mapped
        requiredAttempts: row.requiredAttempts,
        groupId: row.groupId,
        isOptional: row.isOptional,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    }

    console.log("Migrating AnswerSheets...");
    for (const row of answerSheets.rows) {
      await AnswerSheet.create({
        _id: generateNewId(row.id),
        studentName: row.studentName,
        rollNumber: row.rollNumber,
        questionPaper: generateNewId(row.questionPaperId),
        fileUrl: row.fileUrl,
        status: row.status,
        assignedTo: generateNewId(row.assignedToId),
        assignedAt: row.assignedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    }

    console.log("Migrating AIEvaluations...");
    for (const row of aiEvaluations.rows) {
      await AIEvaluation.create({
        _id: generateNewId(row.id),
        answerSheet: generateNewId(row.answerSheetId),
        questionPaper: generateNewId(row.questionPaperId),
        teacher: generateNewId(row.teacherId),
        status: row.status,
        totalMarks: row.totalMarks,
        evaluationData: row.evaluationData,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        error: row.error,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    }

    console.log("Migrating Evaluations...");
    for (const row of evaluations.rows) {
      // Handle array of questionWiseMarks if they contain questionIds
      let newQuestionWiseMarks = [];
      if (row.questionWiseMarks && Array.isArray(row.questionWiseMarks)) {
        newQuestionWiseMarks = row.questionWiseMarks.map(markObj => {
          return {
            ...markObj,
            questionId: markObj.questionId ? generateNewId(markObj.questionId) : null
          };
        });
      }

      await Evaluation.create({
        _id: generateNewId(row.id),
        studentName: row.studentName,
        rollNumber: row.rollNumber,
        answerSheet: generateNewId(row.answerSheetId),
        checkingMode: row.checkingMode,
        marks: row.marks,
        totalMarks: row.totalMarks,
        teacher: generateNewId(row.teacherId),
        status: row.status,
        questionWiseMarks: newQuestionWiseMarks,
        overallComments: row.overallComments,
        aiEvaluation: generateNewId(row.aiEvaluationId),
        annotations: row.annotations,
        submittedAt: row.submittedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    }

    console.log("Migration completed successfully!");

  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await pgClient.end();
    await mongoose.connection.close();
  }
}

migrateData();
