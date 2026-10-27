import {
  APPLIED_JOB_STATUS,
} from "@/constants/constant";
import { z } from "zod";

export const jobApplicationSchema = z.object({
  _id: z.string().trim().min(1, "Job Application ID is required"),

  jobId: z.string().trim().min(1, "Job ID is required"),

  workerId: z.string().trim().min(1, "Worker ID is required"),

  appliedAt: z.union([z.date(), z.string().datetime()]).optional(),

  status: z
    .enum(Object.freeze(APPLIED_JOB_STATUS))
    .default(APPLIED_JOB_STATUS.APPLIED),
});

export const savedJobApplicationSchema = z.object({
  _id: z.string().trim().min(1, "Saved Job Application Id is required"),

  workerId: z.string().trim().min(1, "Worker id is required"),

  jobId: z.string().trim().min(1, "Job Id is required"),

  savedAt: z.union([z.date(), z.string().datetime()]).optional(),

  isDeleted: z.boolean().default(false),
});

export const jobViewSchema = z.object({
  _id: z.string().trim().min(1, "Job Views Id is required"),

  jobId: z.string().trim().min(1, "Job Id is required"),

  workerId: z.string().trim().min(1, "Worker id is required"),

  viewedAt: z.union([z.date(), z.string().datetime()]).optional(),
});
