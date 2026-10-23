import {
  JOB_COMPLETION_STATUS,
  WORKER_WORKING_STATUS,
} from "@/constants/constant";
import mongoose from "mongoose";

const WorkSessionSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    jobId: { type: String, required: true, index: true },
    workerId: { type: String, required: true, },
    employerId: { type: String, required: true, index: true },
    workDate: { type: String, default: null, required: true }, // "2026-10-16"

    // Rate snapshot taken at hire time
    agreedRate: { type: Number, required: true, min: 0 },
    rateType: { type: String, enum: ["Hourly", "Daily"], required: true },
    workingStatus: {
      type: String,
      enum: Object.values(WORKER_WORKING_STATUS),
      default: WORKER_WORKING_STATUS.NOT_AVAILABLE,
      index: true,
    },
    jobCompletionStatus: {
      type: String,
      enum: Object.values(JOB_COMPLETION_STATUS), // if it's an object; remove Object.values if it's already an array
      default: JOB_COMPLETION_STATUS.ASSIGNED,
      index: true,
    },

    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    breaks: [
      {
        _id: false,
        startedAt: { type: Date, required: true },
        endedAt: { type: Date ,default:null},
      },
    ],
    breakMinutes: { type: Number, default: 0, min: 0 },
    totalWorkingMinutes: { type: Number, default: 0, min: 0 },
    totalSalaryAmount: { type: Number, default: 0 },
    workPics: [String],
    // paymentId: { type: String },
  },
  { timestamps: true },
);

// One active job per worker
WorkSessionSchema.index(
  { workerId: 1 },
  { unique: true, partialFilterExpression: { jobCompletionStatus: "Started" } },
);
// One session per worker per job per day
WorkSessionSchema.index(
  { jobId: 1, workerId: 1, workDate: 1 },
  { unique: true },
);
// Employer dashboard
WorkSessionSchema.index({ employerId: 1, workingStatus: 1 });

WorkSessionSchema.index(
  { workerId: 1 },
  {
    unique: true,
    name: "one_open_job_per_worker",
    partialFilterExpression: {
      jobCompletionStatus: {
        $in: [JOB_COMPLETION_STATUS.STARTED, JOB_COMPLETION_STATUS.IN_PROGRESS],
      },
    },
  },
);


export default mongoose.models.WorkSession ||
  mongoose.model("WorkSession", WorkSessionSchema);
