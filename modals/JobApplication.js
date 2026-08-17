import { JOB_APPLICATION_STATUS } from "@/constants/constant";
import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      trim: true,
    },

    jobId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    workerId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: JOB_APPLICATION_STATUS,
      default: "applied",
      required: true,
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent a worker from applying to the same job more than once
JobApplicationSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

export default mongoose.models.JobApplication ||
  mongoose.model("JobApplication", JobApplicationSchema);
