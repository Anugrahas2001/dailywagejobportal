import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobApplication from "@/modals/JobApplication";
import JobInvitation from "@/modals/JobInvitation";
import JobPreferences from "@/modals/JobPreferences";
import SavedJobs from "@/modals/SavedJobs";
import User from "@/modals/User";
import WorkerSession from "@/modals/WorkerSession";
import { matchQueue } from "@/lib/queues/matchQueue";
import JobDetails from "@/modals/JobDetails";

const isFilled = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const calculateProfileCompleteness = (user, jobPref) => {
  if (!user) return 0;

  const checks = [
    // User fields
    isFilled(user.name),
    isFilled(user.email),
    isFilled(user.gender),
    isFilled(user.mobileNumber?.code) && isFilled(user.mobileNumber?.number),
    isFilled(user.dob),
    isFilled(user.profileImage),
    isFilled(user.bio),
    isFilled(user.city) && isFilled(user.state) && isFilled(user.country),
    // coordinates [0, 0] is the schema default, so treat it as not set
    Array.isArray(user.loc?.coordinates) &&
      user.loc.coordinates.length === 2 &&
      !(user.loc.coordinates[0] === 0 && user.loc.coordinates[1] === 0),
    typeof user.yearsOfExperience === "number",
    isFilled(user.skills),

    // JobPreferences fields
    isFilled(jobPref?.jobTitle),
    isFilled(jobPref?.jobCategory),
    isFilled(jobPref?.salaryCreditType),
    isFilled(jobPref?.joiningPeriod),
    isFilled(jobPref?.shiftType),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

const savedJobsCount = async (uid) => {
  const [savedJobsData, jobApplications, jobInvitations] = await Promise.all([
    SavedJobs.find({
      workerId: uid, // Adjust this field to match your schema
      isDeleted: false, // Adjust if your schema uses another field
    })
      .select("jobId")
      .lean(),
    JobApplication.find({ workerId: uid }).select("jobId").lean(),
    JobInvitation.find({ workerId: uid, status: "sent" }).lean(),
  ]);

  const allSavedJobIds = savedJobsData.map((j) => j?.jobId);
  const allAppliedJobIds = jobApplications.map((a) => a?.jobId);

  // Saved jobs the user hasn't applied to yet
  const appliedSet = new Set(allAppliedJobIds.map(String));
  const filteredSavedJobIds = allSavedJobIds.filter(
    (jobId) => !appliedSet.has(String(jobId)),
  );

  return {
    savedCount: filteredSavedJobIds?.length || 0,
    invitationsCount: jobInvitations.legth || 0,
  };
};

// export async function GET(request) {
//   try {
//     await connectDB();
//     const { uid } = await verifyFirebaseToken(request);
//     const { searchParams } = new URL(request.url);
//     const role = searchParams.get("role");

//     const [userData, jobPref] = await Promise.all([
//       User.findById(uid).lean(),
//       JobPreferences.findOne({ userId: uid }).lean(),
//     ]);

//     let counts = { All: 0, Active: 0, Paused: 0, Completed: 0 };
//     let invitationsCount,savedCount=0;
//     let workerSess=null;
//     let profileCompleteness=0;

//     if (role === "employer") {
//       const matchStage = {
//         employerId: uid,
//         isDeleted: false,
//       };

//       const [result] = await JobDetails.aggregate([
//         { $match: matchStage },
//         {
//           $facet: {
//             jobs: [
//               { $sort: { createdAt: -1 } }, // adjust to whatever sort you want
//               { $skip: skip },
//               { $limit: limit },
//             ],
//             statusCounts: [
//               {
//                 $group: {
//                   _id: "$status",
//                   count: { $sum: 1 },
//                 },
//               },
//             ],
//             totalCount: [{ $count: "count" }],
//           },
//         },
//       ]);

//       // console.log(result, "RESULT DATA");

//       result.statusCounts.forEach(({ _id, count }) => {
//         if (counts[_id] !== undefined) counts[_id] = count;
//       });
//       counts.All = result.totalCount[0]?.count || 0;
//     } else {
//        profileCompleteness = calculateProfileCompleteness(
//         userData,
//         jobPref,
//       );
//        { savedCount, invitationsCount } = await savedJobsCount(uid);
//        workerSess = await WorkerSession.findOne({
//         workerId: uid,
//       })
//         .sort({ createdAt: -1 })
//         .select("workingStatus")
//         .lean();
//     }

//     console.log(workerSess, "CHECK WORKER WORKER SESSION DATA");

//     const data = {
//       user: userData,
//       preference: jobPref,
//       profileCompleteness, // e.g. 75
//       savedJobs: savedCount,
//       jobInvitations: invitationsCount,
//       workingStatus: workerSess?.workingStatus,
//     };
//     console.log(data, "DATA VALUE");

//     return NextResponse.json(
//       {
//         data,
//         message: "Successfully complete user details",
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.log(error, "ERROR DATA");
//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }

export async function PUT(request) {
  try {
    await connectDB();

    const { uid } = await verifyFirebaseToken(request);
    const { type, data, role } = await request.json();

    if (!["userinfo", "jobinfo"].includes(type)) {
      return NextResponse.json(
        { message: "Invalid operation type." },
        { status: 400 },
      );
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid data payload." },
        { status: 400 },
      );
    }

    // ───────────── WORKER: full flow ─────────────
    if (role === "worker") {
      // 1. Update user info or job preferences
      if (type === "userinfo") {
        await User.findByIdAndUpdate(
          uid,
          { $set: data },
          { runValidators: true, upsert: false },
        );
      } else {
        await JobPreferences.findOneAndUpdate(
          { userId: uid },
          { $set: data },
          { runValidators: true, upsert: false },
        );
      }

      // 2. Fetch the latest user and job preference data
      const [userData, jobPref] = await Promise.all([
        User.findById(uid).lean(),
        JobPreferences.findOne({ userId: uid }).lean(),
      ]);

      if (!userData) {
        return NextResponse.json(
          { message: "User not found." },
          { status: 404 },
        );
      }

      // 3. Saved jobs and invitations
      const { savedCount, invitationsCount } = await savedJobsCount(uid);

      // 4. Profile completeness
      const profileCompleteness = calculateProfileCompleteness(
        userData,
        jobPref,
      );

      // 5. Queue job matching (BullMQ's dedupe option is `jobId`)
      await matchQueue.add(
        "compute-matchedJobs",
        { userId: userData._id.toString(), status: "Active", notify: true },
        { jobId: `user-${userData._id}`, removeOnComplete: true },
      );

      return NextResponse.json(
        {
          message: "Successfully updated the user profile page.",
          result: {
            user: userData,
            preference: jobPref,
            profileCompleteness,
            savedJobs: savedCount,
            jobInvitations: invitationsCount,
          },
        },
        { status: 200 },
      );
    }

    // ───────────── EMPLOYER: only update user details ─────────────
    if (type !== "userinfo") {
      return NextResponse.json(
        { message: "Employers can only update user information." },
        { status: 400 },
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      uid,
      { $set: data },
      { runValidators: true, new: true, upsert: false },
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Successfully updated the user profile page.",
        result: { user: updatedUser },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating profile:", error);

    return NextResponse.json(
      { message: "Unable to update user profile data." },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (!["worker", "employer"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role." },
        { status: 400 },
      );
    }

    const userData = await User.findById(uid).lean();
    if (!userData) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    // ───────────── EMPLOYER ─────────────
    if (role === "employer") {

      const counts = { All: 0, Active: 0, Paused: 0, Completed: 0 };

      // aggregate() does NOT auto-cast strings to ObjectId
      const matchStage = {
        employerId: uid,
        isDeleted: false,
      };

      const [result] = await JobDetails.aggregate([
        { $match: matchStage },
        {
          $facet: {
            jobs: [{ $sort: { createdAt: -1 } }],
            statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
            totalCount: [{ $count: "count" }],
          },
        },
      ]);

      result.statusCounts.forEach(({ _id, count }) => {
        if (counts[_id] !== undefined) counts[_id] = count;
      });
      counts.All = result.totalCount[0]?.count || 0;

      return NextResponse.json(
        {
          data: {
            user: userData,
            jobs: result.jobs,
            counts,
          },
          message: "Successfully fetched employer details",
        },
        { status: 200 },
      );
    }

    // ───────────── WORKER ─────────────
    const [jobPref, { savedCount, invitationsCount }, workerSess] =
      await Promise.all([
        JobPreferences.findOne({ userId: uid }).lean(),
        savedJobsCount(uid),
        WorkerSession.findOne({ workerId: uid })
          .sort({ createdAt: -1 })
          .select("workingStatus")
          .lean(),
      ]);

    const profileCompleteness = calculateProfileCompleteness(userData, jobPref);

    return NextResponse.json(
      {
        data: {
          user: userData,
          preference: jobPref,
          profileCompleteness,
          savedJobs: savedCount,
          jobInvitations: invitationsCount,
          workingStatus: workerSess?.workingStatus ?? null,
        },
        message: "Successfully fetched worker details",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
