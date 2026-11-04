import { calculateSuggestedRate } from "@/lib/calculateSuggestedRate";
import { generateId } from "@/lib/generateRandomId";
import { connectDB } from "@/lib/mongodb";
import { sendNotification } from "@/lib/notificationService";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobApplication from "@/modals/JobApplication";
import JobDetails from "@/modals/JobDetails";
import JobInvitation from "@/modals/JobInvitation";
import JobPreferences from "@/modals/JobPreferences";
import User from "@/modals/User";
import UserMatches from "@/modals/UserMatches";
import WorkerSession from "@/modals/WorkerSession";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  console.log("app/api/employer/viewjobapplications/[id]/route.js - GET");
  try {
    await connectDB();

    const { uid } = await verifyFirebaseToken(request);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    console.log(id, jobId, "CHECK THESE 2");

    const filter = {
      workerId: id,
      jobId,
    };

    const [user, jobPref, jobApp, jobInvite] = await Promise.all([
      User.findById(id)
        .select(
          "name email mobileNumber city state country isVerified profileImage gender dob skills bio",
        )
        .lean(),
      JobPreferences.findOne({ userId: id }).lean(),
      JobApplication.findOne({ ...filter, cancelled: false })
        .select("status")
        .lean(),
      JobInvitation.findOne(filter),
    ]);

    console.log(
      user,
      jobPref,
      jobApp,
      jobInvite,
      "######$$$$%%%%%%%%%%%%^^^^^^^^^&&&&&&&&&***********(((",
    );

    const workerSession = await WorkerSession.find({
      workerId: id,
      jobId,
      employerId: uid,
    })
      .sort({ createdAt: -1 })
      .select(
        "workPics jobCompletionStatus workingStatus agreedRate rateType totalWorkingHours totalSalaryAmount",
      )
      .lean();

    const workerPics = workerSession.flatMap((s) => s.workPics ?? []);
    console.log(workerSession, workerPics, "AAAAAAAAAAAAAAAAAAAA");

    const jobWorkingStatus = workerSession[0]?.jobCompletionStatus;
    const workerCurrentStatus = workerSession[0]?.workingStatus;
    const agreedRate = workerSession[0]?.agreedRate;
    const salaryType = workerSession[0]?.rateType;
    const totalWorkingHours = workerSession[0]?.totalWorkingHours;
    const totalSalary = workerSession[0]?.totalSalaryAmount;
    console.log(workerPics, jobInvite?.status, jobApp?.status, "WORKER PICS");
    console.log(jobWorkingStatus, workerCurrentStatus, "CHECK BOTH STATUS");
    return NextResponse.json(
      {
        message: "Job and user details fetched successfully.",
        data: {
          ...user,
          ...jobPref,
          workerPics,
          jobWorkingStatus,
          workerCurrentStatus,
          agreedRate,
          salaryType,
          totalWorkingHours,
          totalSalary,
          status: jobApp?.status || jobInvite?.status,
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
        message: "Unable to fetch the job and user details. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}

// export async function PUT(request, { params }) {
//   console.log("app/api/employer/viewjobapplications/[id]/route.js - PUT");
//   try {
//     const { uid } = await verifyFirebaseToken(request);
//     const { status, jobId, type } = await request.json();
//     console.log(status, jobId, type, "CHECK THESE 3 VALUES");
//     //workerId
//     const { id } = await params;

//     if (!status || !jobId || !type) {
//       return NextResponse.json(
//         { message: "Status, JobId or type Is missing" },
//         { status: 404 },
//       );
//     }

//     let jobApplication;

//     if (type === "applications") {
//       jobApplication = await JobApplication.findOneAndUpdate(
//         {
//           jobId,
//           workerId: id,
//         },
//         {
//           $set: {
//             status,
//           },
//         },
//         {
//           returnDocument: "after",
//           lean: true,
//           upsert: false,
//         },
//       );

//       // Application does not exist
//       if (!jobApplication) {
//         return NextResponse.json(
//           {
//             message: "Job application not found.",
//           },
//           {
//             status: 404,
//           },
//         );
//       }

//       const worker = await User.findById(id).lean();

//       if (status === "accepted") {
//         const job = await JobDetails.findOneAndUpdate(
//           { _id: jobId, numberOfOpenings: { $gt: 0 } },
//           { $inc: { numberOfOpenings: -1 } },
//           { returnDocument: "after", session, lean: true },
//         );

//         // Throwing aborts the transaction, so the invitation update rolls back
//         if (!job)
//           return NextResponse.json(
//             { message: "No openings left for this job." },
//             { status: 409 },
//           );

//         // create a worker session for this particular job
//         const newWorkerSession = {
//           _id: generateId(),
//           jobId,
//           employerId: uid,
//           workerId: id,
//           workDate: null,
//           agreedRate: calculateSuggestedRate(job, worker),
//           jobCompletionStatus: "Assigned",
//           isCurrentlyWorking: false,
//           startTime: null,
//           endTime: null,
//           breaks: [],
//           workPics: [],
//         };

//         const workerSession = await WorkerSession.create(newWorkerSession);
//         console.log(workerSession, "WORKER SESSION DATA");
//       }

//       // const previousStatus = jobApplication.status;

//       // const wasFinalStatus =
//       //   previousStatus === "accepted" || previousStatus === "rejected";

//       // const isFinalStatus = status === "accepted" || status === "rejected";

//       /*
//        * Decrease applicantsCount only when:
//        *
//        * previous status = non-final
//        * new status      = accepted/rejected
//        *
//        * Example:
//        *
//        * applied -> accepted   => decrement
//        * applied -> rejected   => decrement
//        *
//        * accepted -> rejected  => DON'T decrement
//        * rejected -> accepted  => DON'T decrement
//        * applied -> shortlisted => DON'T decrement
//        */
//       // const shouldDecreaseApplicantsCount = !wasFinalStatus && isFinalStatus;

//       await sendNotification({
//         title: "Application status updated",
//         notifType: "UPDATED_JOB_APP_STATUS",
//         message:
//           "The status of your job application has changed. Open your applications to see the latest update.",
//         senderId: uid,
//         recepientId: id,
//       });

//       console.log("NOTIFICATION SENT ");
//     } else {
//       const user = await UserMatches.findOne({
//         workerId: id,
//         jobId,
//       }).lean();
//       console.log(user, "USER DATA");
//       jobApplication = await UserMatches.findOneAndUpdate(
//         { workerId: id, jobId },
//         {
//           $set: {
//             isDeleted: true,
//           },
//         },
//         {
//           returnDocument: "after",
//           upsert: false,
//         },
//       );

//       if (status === "rejected") {
//         const jobData = await JobDetails.findOneAndUpdate(
//           { employerId: uid, _id: jobId, aiMatchesCount: { $gt: 0 } },
//           {
//             $inc: {
//               aiMatchesCount: -1,
//             },
//           },
//           {
//             returnDocument: "after",
//             upsert: false,
//           },
//         );
//       }
//     }

//     console.log(jobApplication, "JOB APPLICATIONS");

//     return NextResponse.json(
//       {
//         message: "Job application status updated successfully.",
//         data: jobApplication,
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
//           "Unable to update the job application status. Please try agin.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

const ALLOWED_STATUSES = new Set([
  "Applied",
  "Viewed",
  "Shortlisted",
  "Accepted",
  "Rejected",
]);

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    const { id: workerId } = await params;
    const { status, jobId, type } = await request.json();

    if (!status || !jobId || !type) {
      return NextResponse.json(
        { message: "Status, jobId or type is missing." },
        { status: 404 },
      );
    }
    console.log(status, jobId, type, ALLOWED_STATUSES, "-=========99888");
    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ message: "Invalid status." }, { status: 400 });
    }

    const isApplications = type === "applications";
    const isAccepting = isApplications && status === "Accepted";

    // Ownership check: the job must belong to this employer
    // const ownsJob = await JobDetails.exists({ _id: jobId, employerId: uid });
    // if (!ownsJob)
    //   throw new HttpError(403, "You don't have access to this job.");

    // Read-only lookup done outside the transaction
    let worker = null;
    let jobPref = null;
    if (isAccepting) {
      [worker, jobPref] = await Promise.all([
        User.findById(workerId).lean(),
        JobPreferences.findOne({ userId: workerId })
          .select("salaryCreditType")
          .lean(),
      ]);

      if (!worker)
        return NextResponse.json(
          { message: "Worker not found." },
          { status: 404 },
        );
    }

    let result;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        if (isApplications) {
          // Only update if the status is actually changing (blocks double accept)
          result = await JobApplication.findOneAndUpdate(
            { jobId, workerId, status: { $ne: status } },
            { $set: { status } },
            { returnDocument: "after", session, lean: true },
          );

          if (!result) {
            return NextResponse.json(
              { message: "Application not found or already has this status." },
              { status: 409 },
            );
          }

          if (!isAccepting) return;

          // const existingJob=await JobDetails

          // Atomically claim an opening
          const job = await JobDetails.findOneAndUpdate(
            { _id: jobId, employerId: uid, numberOfOpenings: { $gt: 0 } },
            { $inc: { numberOfOpenings: -1 } },
            { returnDocument: "after", session, lean: true },
          );

          // Throwing aborts the transaction, so the application update rolls back
          if (!job)
            return NextResponse.json(
              { message: "No openings left for this job." },
              { status: 409 },
            );

          await WorkerSession.create(
            [
              {
                _id: generateId(),
                jobId,
                employerId: uid,
                workerId,
                workDate: Date.now(),
                rateType: jobPref?.salaryCreditType,
                agreedRate: calculateSuggestedRate(job, worker),
                jobCompletionStatus: "Assigned",
                isCurrentlyWorking: false,
                startTime: null,
                endTime: null,
                breaks: [],
                workPics: [],
              },
            ],
            { session },
          );
        } else {
          // AI matches: soft-delete only once, so the counter can't double-decrement
          // result = await UserMatches.findOneAndUpdate(
          //   { workerId, jobId, isDeleted: { $ne: true } },
          //   { $set: { isDeleted: true } },
          //   { returnDocument: "after", session, lean: true },
          // );

          // if (!result) {
          //   return NextResponse.json(
          //     {
          //       message: "Match not found or already removed.",
          //     },
          //     { status: 409 },
          //   );
          // }

          // if (status === "Rejected") {
          //   await JobDetails.updateOne(
          //     { _id: jobId, employerId: uid, aiMatchesCount: { $gt: 0 } },
          //     { $inc: { aiMatchesCount: -1 } },
          //     { session },
          //   );
          // }

          if (status !== "Rejected") {
            // Viewed etc. should not remove the match.
            // Optionally mark it instead: set { viewed: true } if your schema has it.
            result = await UserMatches.findOne({
              workerId,
              jobId,
              isDeleted: { $ne: true },
            })
              .session(session)
              .lean();
            if (!result) throw new Error("MATCH_NOT_FOUND");
            return;
          }

          result = await UserMatches.findOneAndUpdate(
            { workerId, jobId, isDeleted: { $ne: true } },
            { $set: { isDeleted: true } },
            { returnDocument: "after", session, lean: true },
          );
          if (!result) throw new Error("MATCH_NOT_FOUND");

          await JobDetails.updateOne(
            { _id: jobId, employerId: uid, aiMatchesCount: { $gt: 0 } },
            { $inc: { aiMatchesCount: -1 } },
            { session },
          );
        }
      });
    } finally {
      await session.endSession();
    }

    // After commit. A notification failure shouldn't fail the request.
    if (isApplications) {
      try {
        await sendNotification({
          title: "Application status updated",
          notifType: "UPDATED_JOB_APP_STATUS",
          message:
            "The status of your job application has changed. Open your applications to see the latest update.",
          senderId: uid,
          recepientId: workerId,
        });
      } catch (notifError) {
        console.error("Notification failed:", notifError);
      }
    }

    console.log(result, "UPDATE PUT DATA");

    return NextResponse.json(
      {
        message: "Job application status updated successfully.",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT viewjobapplications failed:", error);
    return NextResponse.json(
      {
        message:
          "Unable to update the job application status. Please try again.",
      },
      { status: 500 },
    );
  }
}
