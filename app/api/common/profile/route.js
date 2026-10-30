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

export async function GET(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);

    const [userData, jobPref] = await Promise.all([
      User.findById(uid).lean(),
      JobPreferences.findOne({ userId: uid }).lean(),
    ]);

    const profileCompleteness = calculateProfileCompleteness(userData, jobPref);
    const { savedCount, invitationsCount } = await savedJobsCount(uid);
    const workerSess = await WorkerSession.findOne({
      workerId: uid,
    })
      .sort({ createdAt: -1 })
      .select("workingStatus")
      .lean();

    console.log(workerSess, "CHECK WORKER WORKER SESSION DATA");

    const data = {
      user: userData,
      preference: jobPref,
      profileCompleteness, // e.g. 75
      savedJobs: savedCount,
      jobInvitations: invitationsCount,
      workingStatus: workerSess?.workingStatus,
    };
    console.log(data, "DATA VALUE");

    return NextResponse.json(
      {
        data,
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

export async function PUT(request) {
  try {
    await connectDB();

    const { uid } = await verifyFirebaseToken(request);
    const { type, data } = await request.json();

    if (!["userinfo", "jobinfo"].includes(type)) {
      return NextResponse.json(
        { message: "Invalid operation type." },
        { status: 400 },
      );
    }

    // 1. Update user information or job preferences
    if (type === "userinfo") {
      await User.findByIdAndUpdate(
        uid,
        { $set: data },
        {
          runValidators: true,
          returnDocument: "after",
          upsert: false,
        },
      );
    } else {
      await JobPreferences.findOneAndUpdate(
        { userId: uid },
        { $set: data },
        {
          runValidators: true,
          returnDocument: "after",
          upsert: false,
        },
      );
    }

    // 2. Fetch the latest user and job preference data
    const [userData, jobPref] = await Promise.all([
      User.findById(uid).lean(),
      JobPreferences.findOne({ userId: uid }).lean(),
    ]);

    if (!userData) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // 3. Fetch saved jobs and job invitations
    const { savedCount, invitationsCount } = await savedJobsCount(uid);

    // 4. Calculate profile completeness
    // Replace this with your existing profile-completeness logic.
    const profileCompleteness = calculateProfileCompleteness(userData, jobPref);

    // 5. Build the response in the required format
    // const result = ;

    await matchQueue.add(
      "compute-matchedJobs",
      { userId: userData?._id.toString(), status: "Active", notify: true },
      // { userId: `user-${uid}` }, // dedupe key
      { userId: `user-${userData?._id}`, removeOnComplete: true },
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
  } catch (error) {
    console.error("Error updating profile:", error);

    return NextResponse.json(
      { message: "Unable to update user profile data." },
      { status: 500 },
    );
  }
}
