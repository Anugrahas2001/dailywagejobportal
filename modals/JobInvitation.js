import { JOB_INVITATION_STATUS } from "@/constants/constant";
import mongoose from "mongoose";

const JobInvitationSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  employerId: {
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
  sentAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: Object.values(JOB_INVITATION_STATUS),
    default: JOB_INVITATION_STATUS.SENT,
  },
  cancelled: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.models.JobInvitation ||
  mongoose.model("JobInvitation", JobInvitationSchema);
