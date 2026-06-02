import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================
// REGISTER
// ============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, department, employeeId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const existingTeacher = await prisma.teacher.findUnique({ where: { email } });

    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department: department || "",
        employeeId: employeeId || "",
      }
    });

    const token = jwt.sign(
      { id: teacher.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      teacher: {
        _id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        employeeId: teacher.employeeId,
      },
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message,
    });
  }
});

// ============================
// LOGIN
// ============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const teacher = await prisma.teacher.findUnique({ where: { email } });

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { id: teacher.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      teacher: {
        _id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        employeeId: teacher.employeeId,
        phone: teacher.phone,
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
});

// ============================
// RESET PASSWORD
// ============================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    const teacher = await prisma.teacher.findUnique({ where: { email } });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.teacher.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      success: true,
      message: "Password reset successful.",
    });
  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password.",
      error: error.message,
    });
  }
});

// ============================
// GET CURRENT TEACHER
// ============================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      teacher: req.teacher,
    });
  } catch (error) {
    console.log("GET ME ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
});

// ============================
// UPDATE PROFILE
// ============================
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, department, employeeId, phone } = req.body;
    const teacherId = req.teacher.id || req.teacher._id;

    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: { name, department, employeeId, phone },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        employeeId: true,
        phone: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      teacher: { ...updatedTeacher, _id: updatedTeacher.id },
    });
  } catch (error) {
    console.log("UPDATE PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Profile update failed.",
      error: error.message,
    });
  }
});

export default router;
