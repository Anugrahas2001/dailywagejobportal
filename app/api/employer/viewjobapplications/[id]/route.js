import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobApplication from "@/modals/JobApplication";
import JobDetails from "@/modals/JobDetails";
import JobPreferences from "@/modals/JobPreferences";
import User from "@/modals/User";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    console.log("🔥🔥🔥 DYNAMIC ROUTE HIT 🔥🔥🔥");
    await connectDB();

    const { uid } = await verifyFirebaseToken(request);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    console.log(id,jobId, "USER ID");

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

    console.log(user, jobPref, "ALL THE DATA");

    return NextResponse.json(
      {
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
        message: "Failed to fetch the job and user details of this user",
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

    console.log(uid);
    console.log(status);
    console.log(jobId);
    console.log(id);

    console.log(status, jobId, id, "========================");

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

    console.log(jobApplication, "CHECK THE VALUE");
    return NextResponse.json(
      {
        data: jobApplication,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json({
      message: "Failed to update the job APplication status",
    });
  }
}
