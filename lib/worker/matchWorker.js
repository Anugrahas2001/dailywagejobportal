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
import { SIX_HOURS } from "@/constants/constant.js";

await connectDB();

const worker = new Worker(
  "matchQueue",
  async (job) => {
    if (job.name === "compute-matches") {
      const { jobId, employerId, notify = false } = job.data;
      const { total, matches } = await computeMatchesForJob(jobId);

      // remember who was matched before
      const previous = await UserMatches.find({ jobId })
        .select("workerId")
        .lean();
      const prevIds = new Set(previous.map((p) => String(p.workerId)));

      await UserMatches.deleteMany({ jobId });

      if (matches.length > 0) {
        await UserMatches.insertMany(
          matches.map((m) => ({
            _id: generateId(),
            jobId,
            workerId: m.userId,
            matchingScore: m.matchPercentage,
          })),
        );

        console.log(matches.length, prevIds, "============== USER JOBS DATA");

        if (notify) {
          const newMatches = matches.filter(
            (m) => !prevIds.has(String(m.userId)),
          );
          await Promise.all(
            newMatches.map((m) =>
              sendNotification({
                title: "New job match",
                notifType: "NEW_JOB_CREATED",
                message:
                  "A new job that matches your skills and preferences was just posted. Check it out and apply!",
                senderId: employerId,
                recepientId: m.userId,
                jobId, // lets the frontend dedupe and link to the job
              }),
            ),
          );
        }
      }

      await JobDetails.findByIdAndUpdate(jobId, {
        aiMatchesCount: total,
        updatedAt: new Date(),
      });
      return { total };
    }

    if (job.name === "compute-matchedJobs") {
      const { userId, status, notify = false } = job.data;
      if (!userId) throw new Error("compute-matchedJobs: userId is missing");

      const { total, matches } = await computeMatchedJobsForUser(
        userId,
        status,
      );

      // Remember existing matches so we only notify about new ones
      const previous = await JobMatches.find({ workerId: userId })
        .select("jobId")
        .lean();
      const prevIds = new Set(previous.map((p) => String(p.jobId)));

      // Remove matches that no longer apply
      await JobMatches.deleteMany({
        workerId: userId,
        jobId: { $nin: matches.map((m) => m.jobId) },
      });
      console.log(matches.length, prevIds, "============== USER MATCHES DATA");
      // Upsert current matches
      if (matches.length > 0) {
        await JobMatches.bulkWrite(
          matches.map((m) => ({
            updateOne: {
              filter: { workerId: userId, jobId: m.jobId },
              update: {
                $set: { matchingScore: m.matchPercentage },
                $setOnInsert: { _id: generateId() },
              },
              upsert: true,
            },
          })),
        );
      }

      // Optional: notify only for jobs that are newly matched
      if (notify) {
        const newMatches = matches.filter((m) => !prevIds.has(String(m.jobId)));
        await Promise.all(
          newMatches.map((m) =>
            sendNotification({
              title: "New candidate match",
              notifType: "NEW_USER_CREATED",
              message:
                "A candidate who matches your job's skills and preferences is available. Check their profile and send a job invitation!",
              senderId: userId,
              recepientId: m.employerId,
              jobId: m.jobId,
            }),
          ),
        );
      }

      return { total };
    }

    if (job.name === "reconcile") {
      const sixHoursAgo = new Date(Date.now() - SIX_HOURS);

      // --- Refresh only STALE active job postings ---
      const staleJobs = await JobDetails.find({
        status: "Active",
        isDeleted: { $ne: true },
        updatedAt: { $lt: sixHoursAgo },
      }).select("_id employerId");

      if (staleJobs.length > 0) {
        for (const j of staleJobs) {
          // await matchQueue.add(
          //   "compute-matches",
          //   { jobId: j._id.toString(), employerId: j?.employerId },
          //   { jobId: `reconcile-job-${j._id}-${job.timestamp}` },
          // );

          await matchQueue.add(
            "compute-matches",
            {
              jobId: j._id.toString(),
              employerId: j?.employerId,
              notify: false,
            },
            {
              jobId: `reconcile-job-${j._id}-${job.timestamp}`,
              removeOnComplete: true,
            },
          );
        }
      }

      // --- Refresh only STALE active users ---
      const staleUsers = await User.find({
        isDeleted: { $ne: true },
        updatedAt: { $lt: sixHoursAgo },
      }).select("_id status");

      if (staleUsers.length > 0) {
        for (const u of staleUsers) {
          await matchQueue.add(
            "compute-matchedJobs",
            { userId: u._id.toString(), status: u.status },
            { userId: `reconcile-user-${u._id}-${job.timestamp}` },
          );
        }
      }
      console.log("All done");
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

await matchQueue.upsertJobScheduler(
  "reconcile-scheduler",
  { every: SIX_HOURS }, // match the 6-hour stale threshold
  { name: "reconcile", data: {} },
);

// console.log("Reconcile job registered:", reconcileJob.id, reconcileJob.name);
