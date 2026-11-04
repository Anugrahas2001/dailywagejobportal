import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobApplication from "@/modals/JobApplication";
import JobDetails from "@/modals/JobDetails";
import JobInvitation from "@/modals/JobInvitation";
import JobPreferences from "@/modals/JobPreferences";
import User from "@/modals/User";
import { NextResponse } from "next/server";

// export async function GET(request) {
//   console.log("app/api/employer/viewjobapplications/route.js - GET");
//   try {
//     await connectDB();
//     const { uid } = verifyFirebaseToken(request);
//     const { searchParams } = new URL(request.url);
//     const jobId = searchParams.get("jobId");
//     const applicationStatus = searchParams.get("status"); // all, accepted
//     const page = searchParams.get("page");
//     const limit = searchParams.get("limit");
//     const skip = (page - 1) * limit;

//     console.log(applicationStatus, "CHECK THIS VALUE");

//     const filter = {
//       jobId,
//       cancelled: false,
//     };

//     if (applicationStatus === "accepted") {
//       filter.status = applicationStatus;
//     }
//     let jobInvitations;
//     if (applicationStatus === "accepted") {
//       jobInvitations = await JobInvitation.find({ status: "accepted", jobId })
//         .select("workerId")
//         .lean()
//         .skip(skip)
//         .limit(limit);
//     }

//     console.log(jobInvitations, "JOB INVITATIONS");
//     const userApplications = await JobApplication.find(filter)
//       .select("workerId status")
//       .lean()
//       .skip(skip)
//       .limit(limit);

//     console.log(userApplications, "ALL THE USER APPLICATIONS");

//     const jobInvitedWorkerIds = jobInvitations.map((j) => j?.workerId);

//     const jobApplicationMap = new Map(
//       userApplications.map((application) => [
//         String(application?.workerId),
//         application,
//       ]),
//     );

//     const appliedWorkersId = userApplications.map(
//       (application) => application?.workerId,
//     );

//     const totalApplicationCount = await JobApplication.countDocuments({
//       jobId,
//       cancelled: false,
//     });

//     const totalAcceptedInvites=await JobInvitation.countDocuments({status: "accepted", jobId})

//     const totalCount=Math(totalApplicationCount+totalAcceptedInvites)

//     const allWorkersId = [...jobInvitedWorkerIds, ...appliedWorkersId];

//     console.log(allWorkersId, "ALL THE WORKER IDS");

//     const [userdata, jobPref] = await Promise.all([
//       User.find({
//         _id: { $in: allWorkersId },
//       })
//         .select(
//           "name email mobileNumber city state country isVerified profileImage skills",
//         )
//         .lean(),
//       JobPreferences.find({ userId: { $in: allWorkersId } }).lean(),
//     ]);

//     const preferenceMap = new Map(
//       jobPref.map((pref) => [String(pref.userId), pref]),
//     );
//     const data = userdata.map((user) => ({
//       ...user,
//       ...(preferenceMap.get(String(user._id)) || {}),
//       status: jobApplicationMap.get(String(user._id))?.status,
//     }));

//     return NextResponse.json(
//       {
//         message: "User personal and job details fetched successfully.",
//         data,
//         totalCount,
//       },
//       {
//         status: 200,
//       },
//     );
//   } catch (error) {
//     console.log(error, "ERROR DATA");

//     return NextResponse.json(
//       {
//         message:
//           "Unable to fetch the worker's personal and job details. Please try again.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

//  worker data set -unique
// export async function GET(request) {
//   try {
//     await connectDB();
//     const { uid } = await verifyFirebaseToken(request);

//     const { searchParams } = new URL(request.url);
//     const jobId = searchParams.get("jobId");
//     const applicationStatus = searchParams.get("status") || "accepted";

//     if (!jobId) {
//       return NextResponse.json(
//         { message: "jobId is required." },
//         { status: 400 },
//       );
//     }

//     // Safe pagination values
//     const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
//     const limit = Math.min(
//       Math.max(parseInt(searchParams.get("limit")) || 10, 1),
//       100,
//     );
//     const skip = (page - 1) * limit;

//     let pageWorkerIds = [];
//     let totalCount = 0;
//     // workerId (string) -> { status, source }
//     // const workerMeta = new Map();

//     if (applicationStatus === "accepted") {
//       // Fetch accepted workers from BOTH collections (ids only, lightweight)
//       const [acceptedApplications, acceptedInvitations] = await Promise.all([
//         JobApplication.find({ jobId, cancelled: false, status: "accepted" })
//           .select("workerId")
//           .sort({ _id: -1 })
//           .lean(),
//         JobInvitation.find({ jobId, status: "accepted" })
//           .select("workerId")
//           .sort({ _id: -1 })
//           .lean(),
//       ]);

//       const appIds = new Set(
//         acceptedApplications.map((a) => String(a.workerId)),
//       );
//       const invIds = new Set(
//         acceptedInvitations.map((i) => String(i.workerId)),
//       );

//       // Merge + dedupe (a worker may exist in both collections)
//       const allIds = [...new Set([...appIds, ...invIds])];

//       // allIds.forEach((id) => {
//       //   workerMeta.set(id, {
//       //     status: "accepted",
//       //     source:
//       //       appIds.has(id) && invIds.has(id)
//       //         ? "both"
//       //         : appIds.has(id)
//       //           ? "application"
//       //           : "invitation",
//       //   });
//       // });

//       totalCount = allIds.length;
//       // Paginate AFTER merging so pages are consistent
//       pageWorkerIds = allIds.slice(skip, skip + limit);
//     } else {
//       const filter = { jobId, cancelled: false };

//       const [applications, count] = await Promise.all([
//         JobApplication.find(filter)
//           .select("workerId status")
//           .sort({ _id: -1 })
//           .skip(skip)
//           .limit(limit)
//           .lean(),
//         JobApplication.countDocuments(filter),
//       ]);

//       // applications.forEach((a) => {
//       //   workerMeta.set(String(a.workerId), {
//       //     status: a.status,
//       //     source: "application",
//       //   });
//       // });

//       totalCount = count;
//       pageWorkerIds = applications.map((a) => String(a.workerId));
//     }

//     // Fetch user + preference data
//     const [users, preferences, job] = await Promise.all([
//       User.find({ _id: { $in: pageWorkerIds } })
//         .select(
//           "name email mobileNumber city state country isVerified profileImage skills",
//         )
//         .lean(),
//       JobPreferences.find({ userId: { $in: pageWorkerIds } }).lean(),
//       JobDetails.findById(jobId).select("jobName -_id").lean(),
//     ]);

//     const userMap = new Map(users.map((u) => [String(u._id), u]));
//     const preferenceMap = new Map(
//       preferences.map((p) => [String(p.userId), p]),
//     );

//     // Keep the same order as pageWorkerIds
//     const res = pageWorkerIds
//       .map((id) => {
//         const user = userMap.get(id);
//         if (!user) return null;

//         // Remove preference _id so it doesn't overwrite the user's _id
//         const pref = preferenceMap.get(id) || {};
//         const meta = workerMeta.get(id) || {};

//         const result = {
//           ...pref,
//           ...user,
//           status: meta.status,
//           source: meta.source,
//         };
//         console.log(result, "RESULT RESULT DATAAAAAA");

//         return {
//           ...pref,
//           ...user,
//           status: meta.status,
//           source: meta.source,
//         };
//       })
//       .filter(Boolean);

//     return NextResponse.json(
//       {
//         message: "User personal and job details fetched successfully.",
//         data: res, // array of workers
//         jobTitle: job?.jobName, // sent separately
//         totalCount,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.log(error, "ERROR DATA");
//     return NextResponse.json(
//       {
//         message:
//           "Unable to fetch the worker's personal and job details. Please try again.",
//       },
//       { status: 500 },
//     );
//   }
// }

///============================

export async function GET(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const applicationStatus = searchParams.get("status") || "Accepted";
    console.log(jobId, applicationStatus, "JOB ID AND APPLICATION STATUS");
    
    if (!jobId) {
      return NextResponse.json(
        { message: "jobId is required." },
        { status: 400 },
      );
    }

    // Only the employer who owns the job can see its workers
    const ownsJob = await JobDetails.exists({ _id: jobId, employerId: uid });
    if (!ownsJob) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit")) || 10, 1),
      100,
    );
    const skip = (page - 1) * limit;

    // Each entry: { workerId, status, source }. No deduplication.
    let pageEntries = [];
    let totalCount = 0;

    if (applicationStatus === "Accepted") {
      const [acceptedApplications, acceptedInvitations] = await Promise.all([
        JobApplication.find({ jobId, cancelled: false, status: "Accepted" })
          .select("workerId")
          .sort({ _id: -1 })
          .lean(),
        JobInvitation.find({ jobId, status: "Accepted" })
          .select("workerId")
          .sort({ _id: -1 })
          .lean(),
      ]);

      const allEntries = [
        ...acceptedApplications.map((a) => ({
          workerId: String(a.workerId),
          status: "Accepted",
          source: "application",
        })),
        ...acceptedInvitations.map((i) => ({
          workerId: String(i.workerId),
          status: "Accepted",
          source: "invitation",
        })),
      ];

      totalCount = allEntries.length;
      // Paginate AFTER merging so pages are consistent
      pageEntries = allEntries.slice(skip, skip + limit);
    } else {
      const filter = { jobId, cancelled: false };

      const [applications, count] = await Promise.all([
        JobApplication.find(filter)
          .select("workerId status")
          .sort({ _id: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        JobApplication.countDocuments(filter),
      ]);
      console.log(applications, "ALL THE APPLICATIONS");
      totalCount = count;
      pageEntries = applications.map((a) => ({
        workerId: String(a.workerId),
        status: a.status,
        source: "application",
      }));
    }

    const workerIds = pageEntries.map((e) => e.workerId);

    const [users, preferences, job] = await Promise.all([
      User.find({ _id: { $in: workerIds } })
        .select(
          "name email mobileNumber city state country isVerified profileImage skills",
        )
        .lean(),
      JobPreferences.find({ userId: { $in: workerIds } }).lean(),
      JobDetails.findById(jobId).select("jobName -_id").lean(),
    ]);

    // Lookup tables only (not for deduplication)
    const userMap = new Map(users.map((u) => [String(u._id), u]));
    const preferenceMap = new Map(
      preferences.map((p) => [String(p.userId), p]),
    );

    // One result per entry, in the same order as pageEntries
    const res = pageEntries
      .map(({ workerId, status, source }) => {
        const user = userMap.get(workerId);
        if (!user) return null;

        // Drop the preference's own _id/userId so they can't clash with the user's
        const { _id, userId, ...pref } = preferenceMap.get(workerId) || {};

        return { ...pref, ...user, status, source, userId };
      })
      .filter(Boolean);
    console.log(res, "RESULT DATA");
    return NextResponse.json(
      {
        message: "User personal and job details fetched successfully.",
        data: res,
        jobTitle: job?.jobName,
        totalCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET worker details failed:", error);
    return NextResponse.json(
      {
        message:
          "Unable to fetch the worker's personal and job details. Please try again.",
      },
      { status: 500 },
    );
  }
}
