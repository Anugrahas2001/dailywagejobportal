import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobDetails from "@/modals/JobDetails";
import WorkerSession from "@/modals/WorkerSession";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { uid } = await verifyFirebaseToken(request);
    const job = await JobDetails.findById(id).lean();

    if (!job) {
      return NextResponse.json({ message: "Job not found." }, { status: 404 });
    }

    // all sessions for this worker + job, newest first
    const workerSessions = await WorkerSession.find({
      jobId: job._id,
      workerId: uid,
    })
      .select("jobCompletionStatus workPics createdAt")
      .sort({ createdAt: -1 })
      .lean();

      

    // status of the latest session (index 0 after the sort)
    const jobCompletionStatus = workerSessions[0]?.jobCompletionStatus ?? "";

    // merge every session's workPics into one flat array of URLs
    const workPics = workerSessions.flatMap((s) => s.workPics ?? []);

    const result = {
      ...job,
      jobCompletionStatus,
      workPics,
    };

    return NextResponse.json(
      {
        message: "Job Details fetched successfully.",
        result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Unable to fetch the job details. Please try later.",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
