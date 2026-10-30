// import { z } from "zod";
// import {
//   GENDER_TYPES_VALUES,
//   JOB_STATUS_VALUES,
//   JOINING_TYPE_VALUES,
//   SALARY_CREDIT_TYPES_VALUES,
//   SHIFT_TYPE_VALUES,
// } from "@/constants/constant";

// // // ---- Reusable field-level schemas ----

// export const jobDetailSchema = z
//   .object({
//     _id: z.string().min(1, "Job ID is required"),
//     employerId: z.string().min(1, "employerId is required"),
//     jobName: z
//       .string()
//       .trim()
//       .min(3, "Job name must be at least 3 characters")
//       .max(100, "Job name must be under 100 characters"),
//     jobCategory: z.string().trim().min(1, "Job category is required"),
//     jobDescription: z
//       .string()
//       .min(30, "Description should be at least 30 characters")
//       .max(5000, "Description is too long"),

//     genderPreference: z.enum(GENDER_TYPES_VALUES).default(""),

//     loc: z.object({
//       type: z.literal("Point"),

//       coordinates: z
//         .array(z.number())
//         .length(2, "Coordinates must contain longitude and latitude"),
//     }),

//     jobShift: z.enum(SHIFT_TYPE_VALUES).default(""),
//     availability: z.enum(JOINING_TYPE_VALUES).default(""),
//     salaryType: z.enum(SALARY_CREDIT_TYPES_VALUES).default(""),
//     city: z.string().trim().optional(),
//     state: z.string().trim().optional(),
//     country: z.string().trim().optional(),
//     skillsRequired: z.array(z.string().trim().min(1)).default([]),

//     numberOfOpenings: z
//       .number()
//       .int()
//       .min(1, "There must be at least 1 opening")
//       .default(1),

//     minSalary: z.number().min(0, "Minimum salary cannot be negative"),
//     maxSalary: z.number().min(0, "Maximum salary cannot be negative"),
//     responsibilities: z
//       .array(
//         z
//           .string()
//           .trim()
//           .min(5, "Each responsibility must be at least 5 characters")
//           .max(200, "Each responsibility cannot exceed 200 characters"),
//       )
//       .max(8, "You can add up to 8 responsibilities")
//       .optional()
//       .default([]),
//     currency: z.string().trim().toUpperCase().default("INR"),

//    status: z
//   .enum(Object.values(JOB_STATUS_VALUES))
//   .default(JOB_STATUS_VALUES.ACTIVE)
//   })
//   .refine((data) => data.maxSalary >= data.minSalary, {
//     path: ["maxSalary"],
//     message: "Maximum salary must be greater than or equal to minimum salary",
//   });

// schemas/job.js
import { object, z } from "zod";
import {
  GENDER_TYPES,
  JOB_STATUS_VALUES,
  JOINING_TYPES,
  SALARY_CREDIT_TYPES,
  SHIFT_TYPE,
  SHIFT_TYPE_VALUES,
} from "@/constants/constant";

// ---- Limits (keep identical to the Mongoose model) ----
const MIN_SALARY = 400;
const MAX_SALARY_FLOOR = 800;

// Turns "" into undefined so optional fields from forms don't fail enum checks
const emptyToUndefined = (schema) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), schema);

// ---- Reusable field schemas ----
const locSchema = z.object({
  type: z.literal("Point").default("Point"),
  coordinates: z
    .tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90), // latitude
    ])
    .describe("[longitude, latitude]"),
});


const skillsSchema = z
 .array(
    z.string().trim().min(1, "Skill cannot be empty").max(50, "Skill is too long")
  )
  .min(1, "Add at least one skill")
  .max(8, "You can add up to 8 skills")
  .transform((arr) => [...new Set(arr)]); // remove duplicates

const responsibilitiesSchema = z
  .array(
    z
      .string()
      .trim()
      .min(5, "Each responsibility must be at least 5 characters")
      .max(200, "Each responsibility cannot exceed 200 characters"),
  )
  .max(8, "You can add up to 8 responsibilities");

// ---- Base object: no refine, no defaults ----
const jobBaseSchema = z.object({
  _id: z.string().min(1, "Job ID is required"),
  employerId: z.string().min(1, "employerId is required"),

  jobName: z
    .string()
    .trim()
    .min(3, "Job name must be at least 3 characters")
    .max(100, "Job name must be under 100 characters"),
  jobCategory: z.string().trim().min(1, "Job category is required"),
  jobDescription: z
    .string()
    .trim()
    .min(30, "Description should be at least 30 characters")
    .max(5000, "Description is too long"),

  genderPreference: emptyToUndefined(
    z.enum(Object.values(GENDER_TYPES)).optional(),
  ).default(GENDER_TYPES.ANY_GENDER),
  jobShift: z.enum(SHIFT_TYPE_VALUES).default(SHIFT_TYPE.FULL_DAY),
  availability: emptyToUndefined(
    z.enum(Object.values(JOINING_TYPES)).optional(),
  ).default(JOINING_TYPES.SAME_DAY),
  salaryType: emptyToUndefined(
    z.enum(Object.values(SALARY_CREDIT_TYPES)).optional(),
  ).default(SALARY_CREDIT_TYPES.HOURLY),

  loc: locSchema,
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),

  skillsRequired: skillsSchema.optional(),
  responsibilities: responsibilitiesSchema.optional(),
  numberOfOpenings: z
    .number()
    .int()
    .min(1, "There must be at least 1 opening")
    .max(1000)
    .optional(),

  minSalary: z
    .number()
    .min(MIN_SALARY, `Minimum salary must be at least ${MIN_SALARY}`),
  maxSalary: z
    .number()
    .min(
      MAX_SALARY_FLOOR,
      `Maximum salary must be at least ${MAX_SALARY_FLOOR}`,
    ),
  currency: z
    .string()
    .trim()
    .length(3, "Use a 3-letter currency code")
    .toUpperCase()
    .optional(),

  status: z
    .enum(Object.values(JOB_STATUS_VALUES))
    .optional()
    .default(JOB_STATUS_VALUES.ACTIVE),
});

// ---- Shared cross-field rule ----
const salaryRule = (d) =>
  d.minSalary === undefined ||
  d.maxSalary === undefined ||
  d.maxSalary >= d.minSalary;

const salaryIssue = {
  path: ["maxSalary"],
  message: "Maximum salary must be greater than or equal to minimum salary",
};

// ---- Create: full job required ----
export const jobDetailSchema = jobBaseSchema.refine(salaryRule, salaryIssue);

// ---- Update: everything optional ----
const EDITABLE_STATUSES = [JOB_STATUS_VALUES.ACTIVE, JOB_STATUS_VALUES.PAUSED];

export const jobUpdateSchema = jobBaseSchema
  .omit({ _id: true, employerId: true }) // ownership and id can never change
  .partial()
  .extend({
    // clients may only switch between Active and Paused; deletion has its own route
    status: z.enum(EDITABLE_STATUSES).optional(),
  })
  .refine(salaryRule, salaryIssue)
  .refine((d) => Object.values(d).length > 0, {
    message: "At least one field is required",
  });
