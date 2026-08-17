import {
  GENDER_TYPES_VALUES,
  JOINING_TYPE_VALUES,
  SALARY_CREDIT_TYPES_VALUES,
  SHIFT_TYPE_VALUES,
} from "@/constants/constant";
import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, "Job ID is required"],
    },

    // Ownership - who posted this job
    employerId: {
      type: String,
      required: [true, "employerId is required"],
      index: true,
    },

    jobName: {
      type: String,
      required: [true, "Job name is required"],
      trim: true,
      minlength: [3, "Job name must be at least 3 characters"],
      maxlength: [100, "Job name must be under 100 characters"],
    },
    jobCategory: {
      type: String,
      required: [true, "Job category is required"],
      trim: true,
    },
    genderPreference: {
      type: String,
      enum: GENDER_TYPES_VALUES,
      default: "Any",
    },
    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
      minlength: [30, "Description should be at least 30 characters"],
      maxlength: [5000, "Description is too long"],
    },

    jobShift: {
      type: String,
      required: true,
      enum: SHIFT_TYPE_VALUES,
      default: "full_day",
    },
    loc: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },

    availability: {
      type: String,
      enum: JOINING_TYPE_VALUES,
      default: "immediate",
    },

    skillsRequired: {
      type: [String],
      default: [],
    },

    numberOfOpenings: {
      type: Number,
      min: [1, "There must be at least 1 opening"],
      default: 1,
    },

    minSalary: {
      type: Number,
      required: [true, "Minimum salary is required"],
      min: [500, "Minimum salary cannot be negative"],
    },
    maxSalary: {
      type: Number,
      required: [true, "Maximum salary is required"],
      min: [1000, "Maximum salary cannot be negative"],
    },
    responsibilities: {
      type: [
        {
          type: String,
          trim: true,
          minlength: [5, "Each responsibility must be at least 5 characters"],
          maxlength: [200, "Each responsibility cannot exceed 200 characters"],
        },
      ],
      default: [],
      // validate: {
      //   validator: function (value) {
      //     // Allow empty array (optional)
      //     if (!value || value.length === 0) return true;

      //     // Limit number of responsibilities
      //     return value.length <= 15;
      //   },
      //   message: "You can add a maximum of 15 responsibilities",
      // },
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    salaryType: {
      type: String,
      enum: SALARY_CREDIT_TYPES_VALUES,
      default: "daily",
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Paused", "Completed", "Expired"],
        message: "{VALUE} is not a valid status",
      },
      default: "active",
    },
    applicantsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    aiMatchesCount: {
      type: Number,
      default: 0,
    },
    shortlistedCount: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Useful compound index for common queries: active jobs by an employer
JobSchema.index({ employerId: 1, status: 1 });
JobSchema.index({ loc: "2dsphere" });

// JobSchema.index({
//   status: 1,
// });

// JobSchema.index({
//   jobCategory: 1,
// });

// JobSchema.index({
//   city: 1,
// });

export default mongoose.models.JobDetails ||
  mongoose.model("JobDetails", JobSchema);
