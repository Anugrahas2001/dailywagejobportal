import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobApplication from "@/modals/JobApplication";
import JobDetails from "@/modals/JobDetails";
import SavedJobs from "@/modals/SavedJobs";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { uid } = await verifyFirebaseToken(request);
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sortType");
    const status = searchParams.get("statusType");
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Number(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    let sortOption;
    let statusOption;

    switch (sort) {
      case "newest":
        sortOption = { appliedAt: -1 };
        break;
      case "oldest":
        sortOption = { appliedAt: 1 };
        break;
      default:
        sortOption = { appliedAt: -1 };
        break;
    }

    switch (status) {
      case "applied":
      case "viewed":
      case "shortlisted":
      case "accepted":
      case "rejected":
        statusOption = { status };
        break;
      default:
        statusOption = { status: "applied" };
        break;
    }

    const filter = {
      workerId: uid,
      cancelled: false,
      ...statusOption,
    };

    const allAppliedJobs = await JobApplication.find(filter)
      .sort(sortOption)
      .lean()
      .skip(skip)
      .limit(limit);

    const applicationMAP = new Map(
      allAppliedJobs.map((application) => [application.jobId, application]),
    );

    const totalCount = await JobApplication.countDocuments(filter);

    const allAppliedJobIds = allAppliedJobs.map((job) => job.jobId);
    const allJobs = await JobDetails.find({
      _id: { $in: allAppliedJobIds },
      isDeleted: false,
    }).lean();

    const jobMap = new Map(allJobs.map((job) => [String(job._id), job]));

    const orderedAppliedJobs = allAppliedJobIds
      .map((id) => {
        const job = jobMap.get(String(id));
        const application = applicationMAP.get(String(id));
        console.log(application?.status, "✨✨✨✨✨✨✨✨");
        return {
          ...job,
          applicationStatus: application.status,
          appliedAt: application?.appliedAt,
        };
      })
      .filter(Boolean);

    // console.log(
    //   allAppliedJobs.length,
    //   totalCount,
    //   allAppliedJobIds.length,
    //   allJobs.length,
    //   orderedAppliedJobs.length,
    //   "CHECK THE MAP DATA",
    // );

    return NextResponse.json(
      {
        message: "Applied jobs fetched successfully.",
        data: orderedAppliedJobs,
        totalCount,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Unable to fetch applied jobs. Please try again later.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request) {
  try {
    const { uid } = await verifyFirebaseToken(request);
    const body = await request.json();
    const updatedJob = await JobApplication.findOneAndUpdate(
      { jobId: body.jobId, workerId: uid },
      {
        $set: {
          cancelled: body?.cancelled,
        },
      },
      {
        returnDocument: "after",
        upsert: false,
      },
    );

    await JobDetails.findOneAndUpdate(
      { _id: body.jobId },
      {
        $inc: { applicantsCount: -1 },
      },
      {
        returnDocument: "after",
        upsert: false,
      },
    );

    await SavedJobs.findOneAndUpdate(
      { workerId: uid, jobId: body.jobId },
      {
        $set: {
          isDeleted: false,
        },
      },
      { returnDocument: "after", upsert: false },
    );

    return NextResponse.json(
      {
        message: "Your job application has been cancelled successfully.",
        data: updatedJob?.jobId,
        isJobDeleted: updatedJob?.isDeleted,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR");
    return NextResponse.json(
      {
        message: "Unable to cancel the job. Please try again later.",
      },
      {
        status: 500,
      },
    );
  }
}
