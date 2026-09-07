import mongoose from "mongoose";

const JobMatchSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    jobId: {
      type: String,
      required: true,
    },
    workerId: {
      type: String,
      required: true,
    },
    matchingScore: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

JobMatchSchema.index({ jobId: 1, matchingScore: -1 });

export default mongoose.models.JobMatch ||
  mongoose.model("JobMatch", JobMatchSchema);
