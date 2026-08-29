import {
  // JOINING_TYPES,
  // SALARY_CREDIT_TYPES,
  JOINING_TYPE_VALUES,
  SHIFT_TYPE_VALUES,
  SALARY_CREDIT_TYPES_VALUES,
  // SHIFT_TYPES,
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
      enum: SALARY_CREDIT_TYPES_VALUES,
      // default: "daily",
    },
    joiningPeriod: {
      type: String,
      enum: JOINING_TYPE_VALUES,
      // default: "immediate",
    },
    shiftType: {
      type: String,
      enum: SHIFT_TYPE_VALUES,
      // default: "full day",
    },
    locRange: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.JobPreferences ||
  mongoose.model("JobPreferences", JobPreferencesSchema);
