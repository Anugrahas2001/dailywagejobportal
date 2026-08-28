import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobApplication from "@/modals/JobApplication";
import JobDetails from "@/modals/JobDetails";
import JobPreferences from "@/modals/JobPreferences";
import User from "@/modals/User";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { uid } = await verifyFirebaseToken(request);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    const jobApplicationStatus = await JobApplication.findOne({
      workerId: id,
      jobId,
      cancelled: false,
    })
      .select("status")
      .lean();

    console.log(jobApplicationStatus, "JOB APPLICATION STATUS");

    const [user, jobPref] = await Promise.all([
      User.findById({ _id: id })
        .select(
          "name email mobileNumber city state country isVerified profileImage gender dob skills bio",
        )
        .lean(),

      JobPreferences.findOne({ userId: id }).lean(),
    ]);

    return NextResponse.json(
      {
        message: "Job and user details fetched successfully.",
        data: {
          ...user,
          ...jobPref,
          status: jobApplicationStatus?.status,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log("Failed to fetch the job and user details of this user", error);

    return NextResponse.json(
      {
        message:
          "Unable to fetch the job and user details. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { uid } = await verifyFirebaseToken(request);
    const { status, jobId } = await request.json();
    const { id } = await params;

    const jobApplication = await JobApplication.findOneAndUpdate(
      { jobId, workerId: id },
      {
        $set: {
          status: status,
        },
      },
      {
        returnDocument: "after",
        upsert: false,
      },
    );
    if (status === "rejected") {
      const jobData = await JobDetails.findOneAndUpdate(
        { employerId: uid, _id: jobId },
        {
          $inc: {
            applicantsCount: -1,
          },
        },
        {
          returnDocument: "after",
          upsert: false,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Job application status updated successfully.",
        data: jobApplication,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json({
      message: "Unable to update the job application status. Please try agin.",
    },{
      status:500
    });
  }
}
