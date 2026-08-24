import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobApplication from "@/modals/JobApplication";
import JobPreferences from "@/modals/JobPreferences";
import User from "@/modals/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    const { uid } = verifyFirebaseToken(request);
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const skip = (page - 1) * limit;

    const userApplications = await JobApplication.find({
      jobId,
      cancelled: false,
    })
      .select("workerId status")
      .lean()
      .skip(skip)
      .limit(limit);

    const jobApplicationMap = new Map(
      userApplications.map((application) => [
        String(application?.workerId),
        application,
      ]),
    );

    const allWorkersId = userApplications.map(
      (application) => application?.workerId,
    );

    const totalCount = await JobApplication.countDocuments({
      jobId,
      cancelled: false,
    });

    const [userdata, jobPref] = await Promise.all([
      User.find({
        _id: { $in: allWorkersId },
      })
        .select(
          "name email mobileNumber city state country isVerified profileImage skills",
        )
        .lean(),
      JobPreferences.find({ userId: { $in: allWorkersId } }).lean(),
    ]);

    const preferenceMap = new Map(
      jobPref.map((pref) => [String(pref.userId), pref]),
    );
    const data = userdata.map((user) => ({
      ...user,
      ...(preferenceMap.get(String(user._id)) || {}),
      status: jobApplicationMap.get(String(user._id))?.status,
    }));

    console.log(data, "USER APPLICATION AND JOB PREFERENEC");

    return NextResponse.json(
      {
        data,
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
        message: "Failed to fetch the worker details.",
      },
      {
        status: 500,
      },
    );
  }
}
