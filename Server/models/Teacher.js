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
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;
