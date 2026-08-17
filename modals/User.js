import {
  ALLOWED_ROLES,
  EXPERIENCE_LEVELS,
  GENDER_TYPES,
  ONBOARD_PAGES,
} from "@/constants/constant";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    _id: {
      required: true,
      type: "String",
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ALLOWED_ROLES,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: GENDER_TYPES,
    },
    mobileNumber: {
      code: { required: false, type: String },
      number: { required: false, type: String },
    },
    googleId: { required: false, type: String },
    onboardPage: {
      type: Number,
      default: 1,
      enum: ONBOARD_PAGES,
    },
    isOnboardingComplete: { type: Boolean, default: false },
    dob: { type: Date },
    profileImage: { type: String, default: null },
    bio: { type: String, trim: true, maxlength: 500 },
    loc: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    // yearsOfExperience: { type: Number },
    skills: [
      {
        skill: {
          type: String,
          trim: true,
        },
        experience: {
          type: String,
          enum: EXPERIENCE_LEVELS,
          default: "Beginner",
        },
      },
    ],
    isVerified: {
      required: false,  
      type: Boolean,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ loc: "2dsphere" });

export default mongoose.models.User || mongoose.model("User", UserSchema);
