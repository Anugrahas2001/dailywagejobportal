import { JOB_INVITATION_STATUS_VALUES } from "@/constants/constant";
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
    enum: JOB_INVITATION_STATUS_VALUES,
    default: "sent",
  },
});

export default mongoose.models.JobInvitation ||
  mongoose.model("JobInvitation", JobInvitationSchema);
