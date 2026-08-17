// models/JobView.js
import mongoose from "mongoose";

const jobViewSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    jobId: { type: String, required: true },
    workerId: { type: String, required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// Compound unique index — this is what enforces "1 view per user per job"
jobViewSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

export default mongoose.models.JobView ||
  mongoose.model("JobView", jobViewSchema);

// app/api/jobs/[id]/view/route.js
// import JobView from "@/models/JobView";
// import Job from "@/models/Job";

// export async function POST(req, { params }) {
//   const session = await getServerSession();
//   if (!session) {
//     return Response.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const jobId = params.id;
//   const userId = session.user.id;

//   try {
//     // Attempt to insert — if (jobId, userId) already exists, this does nothing
//     const result = await JobView.updateOne(
//       { jobId, userId },
//       { $setOnInsert: { jobId, userId, viewedAt: new Date() } },
//       { upsert: true }
//     );

//     // upsertedCount is 1 only if this was a genuinely NEW view
//     if (result.upsertedCount === 1) {
//       await Job.updateOne({ _id: jobId }, { $inc: { viewCount: 1 } });
//     }

//     return Response.json({ success: true });
//   } catch (err) {
//     return Response.json({ error: "Failed to record view" }, { status: 500 });
//   }
// }
