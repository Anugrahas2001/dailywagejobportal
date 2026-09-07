// scripts/scheduleReconcile.js
import { matchQueue } from "../lib/queues/matchQueue.js";

await matchQueue.add("reconcile-sweep", {}, { repeat: { pattern: "0 */6 * * *" } });

if (job.name === "reconcile-sweep") {
  const staleJobs = await JobDetails.find({
    status: "Active",
    isDeleted: { $ne: true },
  }).select("_id");

  const { matchQueue } = await import("../lib/queues/matchQueue.js");
  for (const j of staleJobs) {
    await matchQueue.add("compute-matches", { jobId: j._id }, { jobId: `job-${j._id}` });
  }
}