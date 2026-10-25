import { z } from "zod";
import {
  GENDER_TYPES_VALUES,
  JOB_STATUS_VALUES,
  JOINING_TYPE_VALUES,
  SALARY_CREDIT_TYPES_VALUES,
  SHIFT_TYPE_VALUES,
} from "@/constants/constant";

// // ---- Reusable field-level schemas ----

// // export const jobDetailSchema = z
// //   .object({
// //     _id: z.string().min(1, "Job ID is required"),
// //     employerId: z.string().min(1, "employerId is required"),
// //     jobName: z
// //       .string()
// //       .trim()
// //       .min(3, "Job name must be at least 3 characters")
// //       .max(100, "Job name must be under 100 characters"),
// //     jobCategory: z.string().trim().min(1, "Job category is required"),
// //     jobDescription: z
// //       .string()
// //       .min(30, "Description should be at least 30 characters")
// //       .max(5000, "Description is too long"),

// //     genderPreference: z.enum(GENDER_TYPES_VALUES).default(""),

// //     loc: z.object({
// //       type: z.literal("Point"),

// //       coordinates: z
// //         .array(z.number())
// //         .length(2, "Coordinates must contain longitude and latitude"),
// //     }),

// //     jobShift: z.enum(SHIFT_TYPE_VALUES).default(""),
// //     availability: z.enum(JOINING_TYPE_VALUES).default(""),
// //     salaryType: z.enum(SALARY_CREDIT_TYPES_VALUES).default(""),
// //     city: z.string().trim().optional(),
// //     state: z.string().trim().optional(),
// //     country: z.string().trim().optional(),
// //     skillsRequired: z.array(z.string().trim().min(1)).default([]),

// //     numberOfOpenings: z
// //       .number()
// //       .int()
// //       .min(1, "There must be at least 1 opening")
// //       .default(1),

// //     minSalary: z.number().min(0, "Minimum salary cannot be negative"),
// //     maxSalary: z.number().min(0, "Maximum salary cannot be negative"),
// //     responsibilities: z
// //       .array(
// //         z
// //           .string()
// //           .trim()
// //           .min(5, "Each responsibility must be at least 5 characters")
// //           .max(200, "Each responsibility cannot exceed 200 characters"),
// //       )
// //       .max(8, "You can add up to 8 responsibilities")
// //       .optional()
// //       .default([]),
// //     currency: z.string().trim().toUpperCase().default("INR"),

// //    status: z
// //   .enum(Object.values(JOB_STATUS_VALUES))
// //   .default(JOB_STATUS_VALUES.ACTIVE)
// //   })
// //   .refine((data) => data.maxSalary >= data.minSalary, {
// //     path: ["maxSalary"],
// //     message: "Maximum salary must be greater than or equal to minimum salary",
// //   });



// // 1. Base object, without .refine()
// const jobBaseSchema = z.object({
//   // ...all your existing fields exactly as they are
//   status: z
//     .enum(Object.values(JOB_STATUS_VALUES))
//     .default(JOB_STATUS_VALUES.ACTIVE),
// });

// const salaryRule = (data) =>
//   data.minSalary === undefined ||
//   data.maxSalary === undefined ||
//   data.maxSalary >= data.minSalary;

// const salaryError = {
//   path: ["maxSalary"],
//   message: "Maximum salary must be greater than or equal to minimum salary",
// };

// // 2. Create schema: full job (used when posting)
// export const jobDetailSchema = jobBaseSchema.refine(salaryRule, salaryError);

// // 3. Update schema: every field optional (used for PUT)
// export const jobUpdateSchema = jobBaseSchema
//   .omit({ _id: true, employerId: true }) // clients must not change these
//   .partial()
//   .refine(salaryRule, salaryError);
// // z.coerce.number()

// // ---- Update schema: partial, but re-check cross-field rule if both present ----



// schemas/job.js
const jobBaseSchema = z.object({
  _id: z.string().min(1, "Job ID is required"),
  employerId: z.string().min(1, "employerId is required"),
  jobName: z.string().trim().min(3).max(100),
  jobCategory: z.string().trim().min(1),
  jobDescription: z.string().min(30).max(5000),

  genderPreference: z.enum(GENDER_TYPES_VALUES).optional(),
  loc: z.object({
    type: z.literal("Point"),
    coordinates: z.array(z.number()).length(2),
  }),
  jobShift: z.enum(SHIFT_TYPE_VALUES),
  availability: z.enum(JOINING_TYPE_VALUES).optional(),
  salaryType: z.enum(SALARY_CREDIT_TYPES_VALUES).optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  skillsRequired: z.array(z.string().trim().min(1)).optional(),
  numberOfOpenings: z.number().int().min(1).optional(),
  minSalary: z.number().min(0),
  maxSalary: z.number().min(0),
  responsibilities: z.array(z.string().trim().min(5).max(200)).max(8).optional(),
  currency: z.string().trim().toUpperCase().optional(),
  status: z.enum(Object.values(JOB_STATUS_VALUES)).optional(),
});

const salaryRule = (d) =>
  d.minSalary === undefined ||
  d.maxSalary === undefined ||
  d.maxSalary >= d.minSalary;

const salaryError = {
  path: ["maxSalary"],
  message: "Maximum salary must be greater than or equal to minimum salary",
};

// Create: full job required
export const jobDetailSchema = jobBaseSchema.refine(salaryRule, salaryError);

// Update: everything optional, and clients can't change these two
export const jobUpdateSchema = jobBaseSchema
  .omit({ _id: true, employerId: true })
  .partial()
  .refine(salaryRule, salaryError);