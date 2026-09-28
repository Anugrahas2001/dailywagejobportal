import mongoose from "mongoose";

const UserMatchesSchema = new mongoose.Schema(
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
    isDeleted:{
      type:Boolean,
      default:false
    }
  },
  {
    timestamps: true,
  },
);

UserMatchesSchema.index({ workerId: 1, matchingScore: -1 });

export default mongoose.models.UserMatches ||
  mongoose.model("UserMatches", UserMatchesSchema);
