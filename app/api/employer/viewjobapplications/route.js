import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobApplication from "@/modals/JobApplication";
import JobPreferences from "@/modals/JobPreferences";
import User from "@/modals/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;
    const { uid } = await verifyFirebaseToken(request);

    const allAppliedJobs = await JobApplication.find({
      jobId,
      cancelled: false,
    })
      .select("workerId")
      .lean()
      .skip(skip)
      .limit(limit);

    const totalCount = await JobApplication.countDocuments({
      jobId,
      cancelled: false,
    });

    const appliedworkerIds = allAppliedJobs.map((job) => job.workerId);

    const allAppliedUsers = await User.find({
      _id: { $in: appliedworkerIds },
    }).lean();
    const usersMap = new Map(allAppliedUsers.map((us) => [String(us._id), us]));

    console.log(appliedworkerIds, "CHECK WORKERS ID");
    const allUsersJobPref = await JobPreferences.find({
      userId: { $in: appliedworkerIds },
    }).lean();

    console.log(allUsersJobPref, "ALL JOB PREF");

    const allUsersJobPrefMap = new Map(
      allUsersJobPref.map((job) => [String(job.userId), job]),
    );

    const applicants = appliedworkerIds.map((userId) => {
      const user = usersMap.get(userId);
      const jobPref = allUsersJobPrefMap.get(userId);

      console.log(jobPref, "JOB PREF DATA");
      return {
        ...user,
        ...jobPref,
      };
    });

    console.log(applicants, "ALL THE FINAL OUTPUT");

    return NextResponse.json(
      {
        data: applicants,
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
        message: "Failed to get the user profiles who applied for the job.",
      },
      {
        status: 500,
      },
    );
  }
}
