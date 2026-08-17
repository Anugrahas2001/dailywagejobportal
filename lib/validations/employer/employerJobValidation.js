import { z } from "zod";
import {
  GENDER_TYPES_VALUES,
  JOINING_TYPE_VALUES,
  SALARY_CREDIT_TYPES_VALUES,
  SHIFT_TYPE_VALUES,
} from "@/constants/constant";

// ---- Reusable field-level schemas ----

export const jobDetailSchema = z
  .object({
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
      .min(30, "Description should be at least 30 characters")
      .max(5000, "Description is too long"),

    genderPreference: z.enum(GENDER_TYPES_VALUES).default("Any"),

    jobShift: z.enum(SHIFT_TYPE_VALUES).default("full_day"),
    availability: z.enum(JOINING_TYPE_VALUES).default("immediate"),
    salaryType: z.enum(SALARY_CREDIT_TYPES_VALUES).default("daily"),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    country: z.string().trim().optional(),
    skillsRequired: z.array(z.string().trim().min(1)).default([]),

    numberOfOpenings: z
      .number()
      .int()
      .min(1, "There must be at least 1 opening")
      .default(1),

    minSalary: z.number().min(0, "Minimum salary cannot be negative"),
    maxSalary: z.number().min(0, "Maximum salary cannot be negative"),
    responsibilities: z
      .array(
        z
          .string()
          .trim()
          .min(5, "Each responsibility must be at least 5 characters")
          .max(200, "Each responsibility cannot exceed 200 characters"),
      )
      .max(8, "You can add up to 8 responsibilities")
      .optional()
      .default([]),
    currency: z.string().trim().toUpperCase().default("INR"),

    status: z.enum(["Active", "Paused", "Completed", "Expired"]).default("active"),
    //   applicantsCount: z.number().min(0).optional(),
    //   viewsCount: z.number().min(0).optional(),
    //   aiMatchesCount: z.number().min(0).optional(),
    //   shortlistedCount: z.number().min(0).optional(),
  })
  .refine((data) => data.maxSalary >= data.minSalary, {
    path: ["maxSalary"],
    message: "Maximum salary must be greater than or equal to minimum salary",
  });
// z.coerce.number()

// ---- Update schema: partial, but re-check cross-field rule if both present ----

// export const updateJobSchema = z
//   .object({
//     employerId: z.string().min(1).optional(),
//     jobName: jobNameSchema.optional(),
//     jobCategory: jobCategorySchema.optional(),
//     genderPreference: genderPreferenceSchema.optional(),
//     jobDescription: jobDescriptionSchema.optional(),
//     jobShift: jobShiftSchema.optional(),
//     city: z.string().trim().optional(),
//     state: z.string().trim().optional(),
//     country: z.string().trim().optional(),
//     availability: availabilitySchema.optional(),
//     skillsRequired: z.array(z.string().trim().min(1)).optional(),
//     numberOfOpenings: z.number().int().min(1).optional(),
//     minSalary: z.number().min(0).optional(),
//     maxSalary: z.number().min(0).optional(),
//     currency: z.string().trim().toUpperCase().optional(),
//     salaryType: salaryTypeSchema.optional(),
//     status: statusSchema.optional(),
//   })
//   .refine(
//     (data) =>
//       data.minSalary === undefined ||
//       data.maxSalary === undefined ||
//       data.maxSalary >= data.minSalary,
//     {
//       message: "maxSalary must be greater than or equal to minSalary",
//       path: ["maxSalary"],
//     },
//   );

// // ---- Express-style middleware helper ----

// export function validateBody(schema) {
//   return (req, res, next) => {
//     const result = schema.safeParse(req.body);

//     if (!result.success) {
//       return res.status(400).json({
//         message: "Validation failed",
//         errors: result.error.flatten().fieldErrors,
//       });
//     }

//     // Use the parsed (and defaulted/coerced) data downstream
//     req.body = result.data;
//     next();
//   };
// }

// /*
// Usage:

// import { createJobSchema, updateJobSchema, validateBody } from "./job.validation";

// router.post("/jobs", validateBody(createJobSchema), createJobController);
// router.patch("/jobs/:id", validateBody(updateJobSchema), updateJobController);
// */
