import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendOTP } from "../services/emailService.js";

const router = express.Router();

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ============================
// REGISTER (Step 1: Create inactive user & send OTP)
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

    let teacher = await prisma.teacher.findUnique({ where: { email } });

    if (teacher) {
      if (teacher.isActive) {
        return res.status(400).json({
          success: false,
          message: "Email already registered and active.",
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (teacher) {
      // Update inactive teacher
      teacher = await prisma.teacher.update({
        where: { email },
        data: { name, password: hashedPassword, department: department || "", employeeId: employeeId || "", otp, otpExpiry }
      });
    } else {
      // Create new inactive teacher
      teacher = await prisma.teacher.create({
        data: {
          name,
          email,
          password: hashedPassword,
          department: department || "",
          employeeId: employeeId || "",
          isActive: false,
          otp,
          otpExpiry
        }
      });
    }

    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "OTP sent to email. Please verify to activate your account.",
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
// VERIFY REGISTRATION (Step 2: Verify OTP & Activate)
// ============================
router.post("/verify-registration", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const teacher = await prisma.teacher.findUnique({ where: { email } });

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found." });
    }

    if (teacher.isActive) {
      return res.status(400).json({ success: false, message: "Account already active." });
    }

    if (teacher.otp !== otp || new Date() > new Date(teacher.otpExpiry)) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    // Activate teacher
    const updatedTeacher = await prisma.teacher.update({
      where: { email },
      data: { isActive: true, otp: null, otpExpiry: null }
    });

    const token = jwt.sign(
      { id: updatedTeacher.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Registration successful. Account activated.",
      token,
      teacher: {
        _id: updatedTeacher.id,
        name: updatedTeacher.name,
        email: updatedTeacher.email,
        department: updatedTeacher.department,
        employeeId: updatedTeacher.employeeId,
      },
    });

  } catch (error) {
    console.log("VERIFY REGISTRATION ERROR:", error);
    res.status(500).json({ success: false, message: "Verification failed." });
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

    if (!teacher.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account not activated. Please register to receive an OTP.",
        notActive: true
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
// FORGOT PASSWORD
// ============================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const teacher = await prisma.teacher.findUnique({ where: { email } });

    if (!teacher || !teacher.isActive) {
      return res.status(404).json({ success: false, message: "Active account not found with this email." });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.teacher.update({
      where: { email },
      data: { otp, otpExpiry }
    });

    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
      return res.status(500).json({ success: false, message: "Failed to send OTP." });
    }

    res.status(200).json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ success: false, message: "Request failed." });
  }
});

// ============================
// RESET PASSWORD
// ============================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required.",
      });
    }

    const teacher = await prisma.teacher.findUnique({ where: { email } });

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found." });
    }

    if (teacher.otp !== otp || new Date() > new Date(teacher.otpExpiry)) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.teacher.update({
      where: { email },
      data: { password: hashedPassword, otp: null, otpExpiry: null },
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
