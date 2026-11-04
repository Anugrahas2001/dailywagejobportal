import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import UserMatches from "@/modals/UserMatches";
import JobPreferences from "@/modals/JobPreferences";
import User from "@/modals/User";
import { NextResponse } from "next/server";
import JobInvitation from "@/modals/JobInvitation";
import JobDetails from "@/modals/JobDetails";
import JobApplication from "@/modals/JobApplication";

export async function GET(request) {
  console.log("app/api/employer/recommendedprofiles/route.js - GET");
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit") || 12);
    // Use ?? so that matching=0 is respected (|| would turn 0 into 20)
    const rawMatching = searchParams.get("matching");
    const parsedMatching = rawMatching !== null ? Number(rawMatching) : NaN;
    const matchingRate = Number.isNaN(parsedMatching) ? 20 : parsedMatching;

    const skip = (page - 1) * limit;

    const allTheAvailableUsers = await UserMatches.find({
      jobId,
      isDeleted: false,
      matchingScore: { $gte: matchingRate },
    }).lean();

    const matchingScoreMap = new Map(
      allTheAvailableUsers.map((user) => [
        String(user.workerId),
        user.matchingScore,
      ]),
    );

    const allTheUserIds = allTheAvailableUsers.map((job) => job.workerId);

    console.log(allTheUserIds, allTheAvailableUsers.length, "ALL THE USER IDS");

    const [users, userPref, job, jobInvitations, jobApplications] =
      await Promise.all([
        User.find({ _id: { $in: allTheUserIds } })
          .select(
            "name email gender mobileNumber city state isVerified profileImage skills",
          )
          .lean(),
        JobPreferences.find({ userId: { $in: allTheUserIds } }).lean(),
        JobDetails.findById(jobId).select("jobName -_id").lean(),
        JobInvitation.find({
          workerId: { $in: allTheUserIds },
          employerId: uid,
          jobId,
          status: "Sent",
        })
          .select("workerId cancelled")
          .lean(),
        JobApplication.find({ workerId: { $in: allTheUserIds }, jobId })
          .select("workerId status")
          .lean(),
      ]);

    const cleanJobInvitations = jobInvitations.filter(Boolean);

    console.log(cleanJobInvitations, "ALL JOB INVIATAIONS");

    const userPrefMap = new Map(
      userPref.map((pref) => [String(pref.userId), pref]),
    );

    const jobInvitationMap = new Map(
      cleanJobInvitations.map((job) => [String(job.workerId), job?.cancelled]),
    );
    const jobApplicationMap = new Map(
      jobApplications.map((job) => [String(job?.workerId), job?.status]),
    );
    console.log(jobInvitationMap,jobApplicationMap, "JOB INVITATION MAP");

    const userResults = users.map((us) => {
      const pref = userPrefMap.get(String(us._id));
      const hasInvitation = jobInvitationMap.has(String(us._id));
      const isInvitationCancelled = jobInvitationMap.get(String(us._id));
      const jobApplicationStatus=jobApplicationMap.get(String(us._id));
      console.log(isInvitationCancelled,jobApplicationStatus, "USER MATCH RESULT");
      return {
        userId: us._id,
        name: us.name,
        email: us.email,
        mobileNumber: us.mobileNumber,
        isVerified: us.isVerified,
        gender: us.gender,
        city: us.city,
        state: us.state,
        skills: us.skills,
        profileImage: us.profileImage,
        ...pref,
        matchPercentage: matchingScoreMap.get(String(us._id)),
        invitationSent: hasInvitation,
        invitationCancelled: hasInvitation
          ? Boolean(isInvitationCancelled)
          : null,
          applicationStatus:jobApplicationStatus||null,
      };
    });

    const sortedResult = [...userResults]
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(skip, skip + limit);

    return NextResponse.json(
      {
        message: "Successfully fetched recommended candidates profiles.",
        data: sortedResult,
        jobTitle: job?.jobName,
        totalCount: allTheAvailableUsers.length,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Unable to fetch all the matched users profiles",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
