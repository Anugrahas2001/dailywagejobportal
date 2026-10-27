import {
  JOINING_TYPES,
  SALARY_CREDIT_TYPES,
  SHIFT_TYPE_VALUES,
} from "@/constants/constant";
import mongoose from "mongoose";

const JobPreferencesSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    jobTitle: {
      type: String,
    },
    jobCategory: {
      type: String,
    },
    minSalary: {
      type: Number,
      default: 400,
    },
    maxSalary: {
      type: Number,
      default: 800,
    },
    salaryCreditType: {
      type: String,
      enum: Object.values(SALARY_CREDIT_TYPES),
      default: SALARY_CREDIT_TYPES.HOURLY,
    },
    joiningPeriod: {
      type: String,
      enum: Object.values(JOINING_TYPES),
      default: "",
    },
    shiftType: {
      type: String,
      enum: Object.values(SHIFT_TYPE_VALUES),
      default: "",
    },
    locRange: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.JobPreferences ||
  mongoose.model("JobPreferences", JobPreferencesSchema);
