// models/JobView.js
import mongoose from "mongoose";

const jobViewSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    jobId: { type: String, required: true },
    workerId: { type: String, required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// Compound unique index — this is what enforces "1 view per user per job"
jobViewSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

export default mongoose.models.JobView ||
  mongoose.model("JobView", jobViewSchema);
