import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    center: { type: String, required: true },
    subjects: [{ type: String, required: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    status: { type: String, enum: ["upcoming", "ongoing", "completed"], default: "upcoming" }
  },
  { timestamps: true }
);

const Exam = mongoose.model("Exam", examSchema);
export default Exam;
