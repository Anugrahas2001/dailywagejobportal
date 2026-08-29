import {
  ALLOWED_ROLES,
  GENDER_TYPES_VALUES,
  JOINING_TYPE_VALUES,
  SALARY_CREDIT_TYPES_VALUES,
  SHIFT_TYPE_VALUES,
} from "@/constants/constant";
import { z } from "zod";

export const loginSchema = z.object({
  _id: z.string().min(1, "User ID is required"),
  role: z.enum(ALLOWED_ROLES).optional(),

  email: z
    .email("Invalid email address")
    .transform((email) => email.trim().toLowerCase()),
  googleId: z.string().trim().optional(),

  // onboardPage: z.number().int().min(1).max(6).default(1),

  isOnboardingComplete: z.boolean().default(false),
});

export const step1Schema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),

  mobileNumber: z
    .object({
      code: z.string().trim(),
      number: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z
          .string()
          .regex(/^[0-9]{10}$/, "Invalid mobile number")
          .optional(),
      ),
      // number: z.string().regex(/^[0-9]{10}$/, "Invalid mobile number").optional(),
    })
    .optional(),

  // onboardPage: z.enum(ONBOARD_PAGES).default(1),
  // onboardPage: z.number().int().min(1).max(6).default(1),

  // isOnboardingComplete: z.boolean().default(false),

  dob: z.coerce.date(),

  gender: z.enum(GENDER_TYPES_VALUES).default(""),

  loc: z.object({
    type: z.literal("Point"),

    coordinates: z
      .array(z.number())
      .length(2, "Coordinates must contain longitude and latitude"),
  }),

  city: z.string().trim().optional(),

  state: z.string().trim().optional(),

  country: z.string().trim().optional(),

  // yearsOfExperience: z.number().min(0).max(50),

  isVerified: z.boolean().optional(),
});

export const skillCreationSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters")
    .optional(),
  skills: z
    .array(
      z.object({
        skill: z.string().trim().min(1, "Skill is required"),

        experience: z.string().trim().optional(),
      }),
    )
    .min(3, "Please add at least 3 skills"),
  // .optional(),
});

export const profileImageSchema = z.object({
  profileImage: z.string().url("Invalid image URL").optional(),
  // onboardPage: z.number().int().min(1).max(6).default(1),
  isOnboardingComplete: z.boolean().default(false),
});

export const jobPreferencesSchema = z
  .object({
    // _id: z.string().min(1, "Job preference ID is required"),
    userId: z.string().min(1, "User ID is required"),
    jobTitle: z
      .string()
      .trim()
      .min(3, "Job title must be at least 3 characters")
      .max(100, "Job title cannot exceed 100 characters"),

    jobCategory: z
      .string()
      .trim()
      .min(3, "Job category must be at least 3 characters")
      .max(100, "Job category cannot exceed 100 characters"),

    minSalary: z
      .number()
      .int()
      .min(400, "Minimum salary must be at least 500")
      .max(1000, "Minimum salary is too high")
      .default(400),

    maxSalary: z
      .number()
      .int()
      .min(800, "Maximum salary must be at least 800")
      .max(2000, "Maximum salary is too high")
      .default(800),

    salaryCreditType: z.enum(SALARY_CREDIT_TYPES_VALUES).default(""),

    joiningPeriod: z.enum(JOINING_TYPE_VALUES).default(""),

    shiftType: z.enum(SHIFT_TYPE_VALUES).default(""),

    locRange: z
      .number()
      .int()
      .min(1, "Location range must be at least 1 km")
      .max(1000, "Location range cannot exceed 1000 km")
      .default(10),
  })
  .refine((data) => data.maxSalary >= data.minSalary, {
    message: "Maximum salary must be greater than or equal to minimum salary",
    path: ["maxSalary"],
  });
