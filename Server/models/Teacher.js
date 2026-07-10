import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: String, default: "" },
    employeeId: { type: String, default: "" },
    phone: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    collegeName: { type: String, default: "" },
    designation: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    panel: { type: String, default: "" },
    subjectCode: { type: String, default: "" },
    isActive: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;
