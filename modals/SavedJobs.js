import mongoose from "mongoose";

const SavedJobSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      trim: true,
    },

    workerId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    jobId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    savedAt: {
      type: Date,
      default: Date.now,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate saved jobs for the same worker
SavedJobSchema.index(
  { workerId: 1, jobId: 1 },
  { unique: true }
);

export default mongoose.models.SavedJob ||
  mongoose.model("SavedJob", SavedJobSchema);