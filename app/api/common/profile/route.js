// import { connectDB } from "@/lib/mongodb";
// import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
// import JobApplication from "@/modals/JobApplication";
// import JobInvitation from "@/modals/JobInvitation";
// import JobPreferences from "@/modals/JobPreferences";
// import SavedJobs from "@/modals/SavedJobs";
// import User from "@/modals/User";

// export async function GET(request) {
//   try {
//     await connectDB();
//     const { uid } = await verifyFirebaseToken();
//     const userData = await User.findById(uid).lean();
//     const jobPref = await JobPreferences.findOne({ userId: uid }).lean();

//     const savedJobs = await SavedJobs.find({ workerId: uid })
//       .select("jobId")
//       .lean();
//     const allSavedJobIds = savedJobs.map((j) => j?.jobId);

//     const appliedJobs = await JobApplication.find({ workerId: uid })
//       .select("jobId")
//       .lean();
//     const allAppliedJobs = appliedJobs.map((a) => a?.jobId);
//     const filteredSavedJobIds = allSavedJobIds.filter(
//       (jobId) => !allAppliedJobs.includes(jobId),
//     );

//     const jobInvitations=await JobInvitation.find({workerId:uid,status:"sent"}).lean();

//   } catch (error) {
//     console.log(error, "ERROR DATA");
//   }
// }

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobApplication from "@/modals/JobApplication";
import JobInvitation from "@/modals/JobInvitation";
import JobPreferences from "@/modals/JobPreferences";
import SavedJobs from "@/modals/SavedJobs";
import User from "@/modals/User";

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

export async function GET(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);

    const [userData, jobPref, savedJobs, appliedJobs, jobInvitations] =
      await Promise.all([
        User.findById(uid).lean(),
        JobPreferences.findOne({ userId: uid }).lean(),
        SavedJobs.find({ workerId: uid }).select("jobId").lean(),
        JobApplication.find({ workerId: uid }).select("jobId").lean(),
        JobInvitation.find({ workerId: uid, status: "sent" }).lean(),
      ]);

    const allSavedJobIds = savedJobs.map((j) => j?.jobId);
    const allAppliedJobIds = appliedJobs.map((a) => a?.jobId);

    // Saved jobs the user hasn't applied to yet
    const appliedSet = new Set(allAppliedJobIds.map(String));
    const filteredSavedJobIds = allSavedJobIds.filter(
      (jobId) => !appliedSet.has(String(jobId)),
    );

    const profileCompleteness = calculateProfileCompleteness(userData, jobPref);

    return NextResponse.json(
      {
        data: {
          user: userData,
          preference: jobPref,
          profileCompleteness, // e.g. 75
          savedJobs: filteredSavedJobIds.length,
          jobInvitations: jobInvitations.length,
        },
        message: "Successfully complete user details",
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
