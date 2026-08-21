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
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 12, 1),
      10,
    );
    const skip = (page - 1) * limit;
    console.log(sort, status, page, limit, "PAGE AND LIMIT");
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

    console.log(filter, "FILTER DATA", sortOption);

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

        return {
          ...job,
          applicationStatus: application?.status,
          appliedAt: application?.appliedAt,
        };
      })
      .filter(Boolean);
    console.log(orderedAppliedJobs, totalCount, "CHECK BOTH");

    return NextResponse.json(
      {
        message: "Successfully fetched all the applied jobs.",
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
        message: "Failed to fetch applied jobs.",
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
    console.log(body, "BODY DATAAA");
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
    console.log(updatedJob, "UPDATED JOBSS");

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
        message: "Successfully cancelled the job application.",
        data: updatedJob?.jobId,
        isJobDeleted: updatedJob?.isDeleted,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json({
      message: "failed to cancel the job.",
    });
  }
}
