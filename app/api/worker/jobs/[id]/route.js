import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobDetails from "@/modals/JobDetails";
import WorkerSession from "@/modals/WorkerSession";

export async function GET(request, { params }) {
  console.log("app/api/employer/job/[id]/route.js - GET");
  try {
    await connectDB();
    const { id } = await params;
    const { uid } = await verifyFirebaseToken(request);
    const job = await JobDetails.findById(id);

    if (!job) {
      return NextResponse.json(
        {
          message: "Job not found.",
        },
        {
          status: 404,
        },
      );
    }

    const workerSession = await WorkerSession.find({
      jobId: job._id,
      workerId: uid,
    }).select("jobCompletionStatus workPics");

    const result = {
      ...job,
      jobCompletionStatus: workerSession?.jobCompletionStatus,
      workPics: workerSession?.workePics,
    };

    return NextResponse.json(
      {
        message: "Job Details fetched successfully.",
        result,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Unable to fetch the job details. Please try later.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
