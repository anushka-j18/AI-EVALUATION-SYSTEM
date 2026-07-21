import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    rollNumber: { type: String, required: true },
    password: { type: String, required: true },
    course: { type: String, required: true },
    semester: { type: String, required: true },
    email: { type: String }, // Optional
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
