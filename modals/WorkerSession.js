import mongoose from "mongoose";

const WorkSessionSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    jobId: { type: String, required: true, index: true },
    workerId: { type: String, required: true, index: true },
    employerId: { type: String, required: true, index: true },
    workDate: { type: String, required: true }, // "2026-10-16"

    // Rate snapshot taken at hire time
    agreedRate: { type: Number, required: true, min: 0 },
    rateType: { type: String, enum: ["Hourly", "Daily"], required: true },

    jobCompletionStatus: {
      type: String,
      enum: [
        "Assigned",
        "Started",
        "Completed",
        "Approved",
        "Paid",
        "Disputed",
      ],
      default: "Assigned",
      index: true,
    },
    isCurrentlyWorking: {
      type: Boolean,
      default: false,
    },

    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    // startLoc: {
    //   type: { type: String, default: "Point" },
    //   coordinates: [Number],
    // },
    // endLoc: { type: { type: String, default: "Point" }, coordinates: [Number] },

    breaks: [
      {
        _id: false,
        startedAt: { type: Date, required: true },
        endedAt: { type: Date },
      },
    ],
    breakMinutes: { type: Number, default: 0, min: 0 },
    totalWorkingMinutes: { type: Number, default: 0, min: 0 },
    totalSalaryAmount: { type: Number, default: 0, },
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

export default mongoose.models.WorkSession ||
  mongoose.model("WorkSession", WorkSessionSchema);
