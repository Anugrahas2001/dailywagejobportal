// worker/matchWorker.js
import { connectDB } from "../mongodb.js"; // lib/worker -> lib/mongodb.js
import { redisConnection } from "../redisConnection.js"; // lib/worker -> lib/redisConnection.js
import JobDetails from "../../modals/JobDetails.js"; // lib/worker -> root -> modals/JobDetails.js
import JobMatches from "../../modals/JobMatches.js"; // lib/worker -> root -> modals/JobMatches.js
import { Worker } from "bullmq";
import { computeMatchesForJob } from "../matching/computeMatchesUsersFor.js"; // lib/worker -> lib/matching
import { generateId } from "../generateRandomId.js";
import { computeMatchedJobsForUser } from "../matching/computeMatchedJobsForUser.js";
import { matchQueue } from "../queues/matchQueue.js";
import User from "../../modals/User.js";
import UserMatches from "@/modals/UserMatches.js";
import { sendNotification } from "../notificationService.js";

await connectDB();

const worker = new Worker(
  "matchQueue",
  async (job) => {
    if (job.name === "compute-matches") {
      console.log("FIRST QUEUE IS EXECUTED");
      const { jobId, employerId } = job.data;
      const { total, matches } = await computeMatchesForJob(jobId);
      console.log(total, matches.length, "ALL THE MATCHED USERSS");

      const data = await UserMatches.deleteMany({ jobId });
      console.log(data, "DATA DATA");
      if (matches.length > 0) {
        await UserMatches.insertMany(
          matches.map((m) => ({
            _id: generateId(),
            jobId: jobId,
            workerId: m.userId,
            matchingScore: m.matchPercentage,
          })),
        );

        await Promise.all(
          matches.map((m) =>
            sendNotification({
              title: "New job match",
              message:
                "A new job that matches your skills and preferences was just posted. Check it out and apply!",
              senderId: employerId,
              recepientId: m.userId,
            }),
          ),
        );
      }

      await JobDetails.findByIdAndUpdate(jobId, {
        aiMatchesCount: total,
        updatedAt: new Date(),
      });
      return { total };
    }

    if (job.name === "compute-matchedJobs") {
      // console.log("SECOND QUEUE IS EXECUTED");
      const { userId, status } = job.data;

      const { total, matches } = await computeMatchedJobsForUser(
        userId,
        status,
      );
      // console.log(total, matches.length, userId, "ALL THE MATCHED JOBSS");

      const deleted = await JobMatches.deleteMany({ workerId: userId });
      // console.log(deleted, "ALL THE DELETED JOBS");
      if (matches.length > 0) {
        await JobMatches.insertMany(
          matches.map((m) => ({
            _id: generateId(),
            jobId: m.jobId,
            workerId: userId,
            matchingScore: m.matchPercentage,
          })),
        );
      }
      return { total };
    }

    if (job.name === "reconcile") {
      const sixHoursAgo = new Date(Date.now() - 10 * 60 * 1000);

      // --- Refresh only STALE active job postings ---
      const staleJobs = await JobDetails.find({
        status: "Active",
        isDeleted: { $ne: true },
        updatedAt: { $lt: sixHoursAgo },
      }).select("_id");
      console.log(
        staleJobs,
        "STALE JOBS AFTER 6 HOURS&&&&&&&&&&&&&&&&&&&&&&&&&&&",
      );

      for (const j of staleJobs) {
        await matchQueue.add(
          "compute-matches",
          { jobId: j._id.toString(), employerId: j?.employerId },
          { jobId: `reconcile-job-${j._id}-${job.timestamp}` },
        );
      }

      // --- Refresh only STALE active users ---
      const staleUsers = await User.find({
        isDeleted: { $ne: true },
        updatedAt: { $lt: sixHoursAgo },
      }).select("_id status");

      for (const u of staleUsers) {
        await matchQueue.add(
          "compute-matchedJobs",
          { userId: u._id.toString(), status: u.status },
          { jobId: `reconcile-user-${u._id}-${job.timestamp}` },
        );
      }

      return {
        requeuedJobs: staleJobs.length,
        requeuedUsers: staleUsers.length,
      };
    }
  },
  { connection: redisConnection, concurrency: 5 },
);

worker.on("failed", (job, err) =>
  console.error(`Job ${job?.id} failed:`, err.message),
);
worker.on("completed", (job, result) =>
  console.log(`Job ${job.id} done:`, result),
);

// Ensure the repeatable reconcile job exists (idempotent - safe to call every boot)
// console.log(
//   "Registering reconcile repeatable job...",
//   new Date().toLocaleString(),
// );

// const repeatables = await matchQueue.getRepeatableJobs();
// console.log(repeatables.length, "REPEATABLE JOBS LENGTH");
// for (const r of repeatables) {
//   await matchQueue.removeRepeatableByKey(r.key);
// }

// const reconcileJob = await matchQueue.add(
//   "reconcile",
//   {},
//   {
//     // repeat: { every: 6 * 60 * 60 * 1000 },
//     repeat: { every: 5 * 60 * 1000 },
//     jobId: "reconcile-repeatable",
//   },
// );

// console.log("Reconcile job registered:", reconcileJob.id, reconcileJob.name);

console.log(
  "Registering reconcile repeatable job...",
  new Date().toLocaleString(),
);

// One-time cleanup of any stray/duplicate schedulers from before
const existingSchedulers = await matchQueue.getJobSchedulers();
console.log("Existing schedulers before cleanup:", existingSchedulers);
for (const s of existingSchedulers) {
  await matchQueue.removeJobScheduler(s.id);
}

// Idempotent register — safe to call on every boot, never duplicates
const reconcileJob = await matchQueue.upsertJobScheduler(
  "reconcile-repeatable",
  { every: 5 * 60 * 1000 },
  {
    name: "reconcile",
    data: {},
  },
);

console.log("Reconcile job registered:", reconcileJob.id, reconcileJob.name);
