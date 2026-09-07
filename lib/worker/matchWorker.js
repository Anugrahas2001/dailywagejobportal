// worker/matchWorker.js
// import { connectDB } from "../../lib/mongodb";
// import JobDetails from "../../modals/JobDetails";
// import JobMatches from "../../modals/JobMatches";
// import { Worker } from "bullmq";
// import { redisConnection } from "../../lib/redisConnection";
// import { computeMatchesForJob } from "../matching/computeMatchesForJob";
// await connectDB();

import { connectDB } from "../mongodb.js"; // lib/worker -> lib/mongodb.js
import { redisConnection } from "../redisConnection.js"; // lib/worker -> lib/redisConnection.js
import JobDetails from "../../modals/JobDetails.js"; // lib/worker -> root -> modals/JobDetails.js
import JobMatches from "../../modals/JobMatches.js"; // lib/worker -> root -> modals/JobMatches.js
import { Worker } from "bullmq";
import { computeMatchesForJob } from "../matching/computeMatchesForJob.js"; // lib/worker -> lib/matching
import { generateId } from "../generateRandomId.js";

await connectDB();

const worker = new Worker(
  "matchQueue",
  async (job) => {
    if (job.name === "compute-matches") {
      const { jobId } = job.data;
      console.log(jobId, "JOBID GAIN");
      const { total, matches } = await computeMatchesForJob(jobId);
      // console.log(total, matches, "FETCH ALL THESE");
      await JobMatches.deleteMany({ jobId });
      if (matches.length > 0) {
        await JobMatches.insertMany(
          matches.map((m) => ({
            _id: generateId(),
            jobId,
            workerId: m.userId,
            matchingScore: m.matchPercentage,
          })),
        );
      }

      await JobDetails.findByIdAndUpdate(jobId, { aiMatchesCount: total });
      return { total };
    }

    if (job.name === "reconcile") {
      const staleJobs = await JobDetails.find({
        status: "Active",
        isDeleted: { $ne: true },
        $or: [
          { updatedAt: { $lt: new Date(Date.now() - 6 * 60 * 60 * 1000) } },
        ],
      }).select("_id");

      for (const j of staleJobs) {
        await job.queueQualifiedName; // no-op placeholder
      }
      // simpler: re-add to same queue from outside; see step 7
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
