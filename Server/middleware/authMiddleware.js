import jwt from "jsonwebtoken";
import Teacher from "../models/Teacher.js";
import Admin from "../models/Admin.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const teacher = await Teacher.findById(decoded.id)
      .select("-password");

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Teacher not found.",
      });
    }

    req.teacher = teacher;
    next();
  } catch (error) {
    console.log("AUTH MIDDLEWARE ERROR:", error.message);

    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not an admin.",
      });
    }

    req.admin = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired admin token.",
    });
  }
};

export default authMiddleware;
export { protectAdmin };
