
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
          savedJobs: filteredSavedJobIds.length || 0,
          jobInvitations: jobInvitations.length || 0,
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



// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
// import JobApplication from "@/modals/JobApplication";
// import JobInvitation from "@/modals/JobInvitation";
// import JobPreferences from "@/modals/JobPreferences";
// import SavedJobs from "@/modals/SavedJobs";
// import User from "@/modals/User";
 
// const isFilled = (value) => {
//   if (value === null || value === undefined) return false;
//   if (typeof value === "string") return value.trim().length > 0;
//   if (Array.isArray(value)) return value.length > 0;
//   return true;
// };
 
// // Each check has a human-readable label so the UI can say what's missing.
// const buildChecks = (user, jobPref) => [
//   { label: "name", ok: isFilled(user.name) },
//   { label: "email", ok: isFilled(user.email) },
//   { label: "gender", ok: isFilled(user.gender) },
//   {
//     label: "mobile number",
//     ok: isFilled(user.mobileNumber?.code) && isFilled(user.mobileNumber?.number),
//   },
//   { label: "date of birth", ok: isFilled(user.dob) },
//   { label: "profile photo", ok: isFilled(user.profileImage) },
//   { label: "bio", ok: isFilled(user.bio) },
//   {
//     label: "address",
//     ok: isFilled(user.city) && isFilled(user.state) && isFilled(user.country),
//   },
//   {
//     label: "location",
//     ok:
//       Array.isArray(user.loc?.coordinates) &&
//       user.loc.coordinates.length === 2 &&
//       !(user.loc.coordinates[0] === 0 && user.loc.coordinates[1] === 0),
//   },
//   { label: "experience", ok: typeof user.yearsOfExperience === "number" },
//   { label: "skills", ok: isFilled(user.skills) },
//   { label: "job title", ok: isFilled(jobPref?.jobTitle) },
//   { label: "job category", ok: isFilled(jobPref?.jobCategory) },
//   { label: "salary type", ok: isFilled(jobPref?.salaryCreditType) },
//   { label: "joining period", ok: isFilled(jobPref?.joiningPeriod) },
//   { label: "shift type", ok: isFilled(jobPref?.shiftType) },
// ];
 
// export async function GET(request) {
//   try {
//     await connectDB();
 
//     let uid;
//     try {
//       ({ uid } = await verifyFirebaseToken(request));
//     } catch {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 },
//       );
//     }
 
//     // Only the ids we need to exclude applied jobs from the saved count
//     const appliedJobs = await JobApplication.find({ workerId: uid })
//       .select("jobId")
//       .lean();
//     const appliedIds = appliedJobs.map((a) => a.jobId);
 
//     const [userData, jobPref, savedCount, invitationCount] = await Promise.all([
//       // Projection: don't ship internal fields (tokens, __v, etc.) to the browser
//       User.findById(uid)
//         .select(
//           "name email gender mobileNumber dob profileImage bio city state country loc yearsOfExperience skills isVerified",
//         )
//         .lean(),
//       JobPreferences.findOne({ userId: uid }).lean(),
//       // Count in the DB instead of pulling documents into Node
//       SavedJobs.countDocuments({ workerId: uid, jobId: { $nin: appliedIds } }),
//       JobInvitation.countDocuments({ workerId: uid, status: "sent" }),
//     ]);
 
//     if (!userData) {
//       return NextResponse.json(
//         { success: false, message: "User not found" },
//         { status: 404 },
//       );
//     }
 
//     const checks = buildChecks(userData, jobPref);
//     const done = checks.filter((c) => c.ok).length;
 
//     return NextResponse.json(
//       {
//         data: {
//           user: userData,
//           preference: jobPref,
//           profileCompleteness: Math.round((done / checks.length) * 100),
//           missingFields: checks.filter((c) => !c.ok).map((c) => c.label),
//           savedJobs: savedCount,
//           jobInvitations: invitationCount,
//           // OPTIONAL: add once you track these (adjust model/status names)
//           // stats: {
//           //   jobsDone: await JobApplication.countDocuments({ workerId: uid, status: "completed" }),
//           //   rating: avgRating,       // from a Reviews collection
//           //   ratingCount: reviewCount,
//           // },
//         },
//         message: "Successfully fetched user details",
//       },
//       {
//         status: 200,
//         headers: { "Cache-Control": "private, no-store" },
//       },
//     );
//   } catch (error) {
//     console.error("GET /api/common/profile failed:", error);
//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }
 