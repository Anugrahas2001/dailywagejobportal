import { calculateSuggestedRate } from "@/lib/calculateSuggestedRate";
import { generateId } from "@/lib/generateRandomId";
import { connectDB } from "@/lib/mongodb";
import { sendNotification } from "@/lib/notificationService";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobDetails from "@/modals/JobDetails";
import JobInvitation from "@/modals/JobInvitation";
import JobPreferences from "@/modals/JobPreferences";
import User from "@/modals/User";
import WorkerSession from "@/modals/WorkerSession";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    console.log("INSIDE THE GET METHOD");
    await connectDB();
    const { searchParams } = new URL(request.url);
    const { uid } = await verifyFirebaseToken(request);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    console.log(uid, "CHECK THIS AS WELL");
    const allJobInvitations = await JobInvitation.find({
      workerId: uid,
      status: status,
    })
      // .select("jobId")
      .lean();
    console.log(allJobInvitations, "ALL THE JOB INVITATIONS ARE HERE");
    const allJobInvitationJobIds = allJobInvitations.map((job) => job?.jobId);
    console.log(allJobInvitationJobIds, "ALL THE INVITED JOB IDS");

    const allTheJobs = await JobDetails.find({
      _id: { $in: allJobInvitationJobIds },
      isDeleted: false,
    })
      .lean()
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        message: "Successfully fetched all the jobInvitations",
        data: allTheJobs,
        totalCount: allJobInvitations.length,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Unable to fetch job inivitations.",
      },
      {
        status: 500,
      },
    );
  }
}

// export async function PUT(request) {
//   try {
//     await connectDB();
//     const { uid } = await verifyFirebaseToken(request);

//     const {
//       jobId,
//       status: invitationStatus,
//       employerId,
//     } = await request.json();
//     console.log(jobId, invitationStatus, employerId, "VERIFYING BODY DATA");
//     const updatedJobInvitation = await JobInvitation.findOneAndUpdate(
//       { jobId, workerId: uid },
//       {
//         $set: {
//           status: invitationStatus,
//         },
//       },
//       {
//         returnDocument: "after",
//       },
//     );

//     console.log(updatedJobInvitation, "UPDATED JOB INVITATION");

//     if (invitationStatus === "accepted") {
//       const updatedJob=await JobDetails.findOneAndUpdate(
//         { _id: jobId, numberOfOpenings: { $gt: 0 } },
//         { $inc: { numberOfOpenings: -1 } },
//         { returnDocument: "after" },
//       );

//     const worker=await User.findById(uid).lean();

//        const newWorkerSession = {
//                 _id: generateId(),
//                 jobId,
//                 employerId: updatedJob?.employerId,
//                 workerId: uid,
//                 workDate: null,
//                 agreedRate: calculateSuggestedRate(updatedJob, worker),
//                 jobCompletionStatus: "Assigned",
//                 isCurrentlyWorking: false,
//                 startTime: null,
//                 endTime: null,
//                 breaks: [],
//                 workPics: [],
//               };

//               const workerSession = await WorkerSession.create(newWorkerSession);
//               console.log(workerSession, "WORKER SESSION DATA");

//       await sendNotification({
//         title: "Invitation accepted",
//         notifType: "JOB_INVITATION_ACCEPTED",
//         message:
//           "A candidate accepted your job invitation. View their profile to take the next step.",
//         senderId: uid,
//         recepientId: employerId,
//       });
//     }
//     // const [job, worker] = await Promise.all([
//     //   JobDetails.findById(jobId).lean(),
//     //   User.findById(uid).lean(),
//     // ]);

//     // // create a worker session for this particular job
//     // const newWorkerSession = {
//     //   _id: generateId(),
//     //   jobId,
//     //   employerId,
//     //   workerId: uid,
//     //   workDate: null,
//     //   agreedRate: calculateSuggestedRate(job, worker),
//     //   jobCompletionStatus: "Assigned",
//     //   isCurrentlyWorking: false,
//     //   startTime: null,
//     //   endTime: null,
//     //   breaks: [],
//     //   workPics: [],
//     // };

//     // const workerSession = await WorkerSession.create(newWorkerSession);

//     // console.log(workerSession, "NEWLY CREATED WORKER SESSION");

//     return NextResponse.json(
//       {
//         message: "Sucessfully updated job invitation status.",
//         data: updatedJobInvitation,
//       },
//       {
//         status: 200,
//       },
//     );
//   } catch (error) {
//     console.log(error, "ERROR DATA");

//     return NextResponse.json(
//       {
//         message: "Unable to update the jonInvitation Status.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

const ALLOWED_STATUSES = new Set(["Accepted", "Rejected"]);

export async function PUT(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);

    const { jobId, status } = await request.json();

    if (!jobId || !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        { message: "Invalid jobId or status." },
        { status: 400 },
      );
    }

    let worker = null;
    let jobPref = null;

    const isAccepting = status === "Accepted";

    // Fetch outside the transaction, only when needed
    [worker, jobPref] = isAccepting
      ? await Promise.all([
          User.findById(uid).lean(),
          JobPreferences.findOne({ userId: uid })
            .select("salaryCreditType")
            .lean(),
        ])
      : [null, null];
    if (isAccepting && !worker)
      return NextResponse.json(
        { message: "Worker not found." },
        { status: 404 },
      );

    let invitation = null;
    let job = null;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Only a pending invitation can transition (prevents double-accept)
        invitation = await JobInvitation.findOneAndUpdate(
          { jobId, workerId: uid, status: "Sent" },
          { $set: { status } },
          { returnDocument: "after", session, lean: true },
        );

        if (!invitation) {
          return NextResponse.json(
            {
              message: "Invitation not found or already responded to.",
            },
            {
              status: 409,
            },
          );
        }

        if (!isAccepting) return;

        // Atomically claim an opening
        job = await JobDetails.findOneAndUpdate(
          { _id: jobId, numberOfOpenings: { $gt: 0 } },
          { $inc: { numberOfOpenings: -1 } },
          { returnDocument: "after", session, lean: true },
        );

        // Throwing aborts the transaction, so the invitation update rolls back
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
              employerId: job.employerId,
              workerId: uid,
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
      });
    } finally {
      await session.endSession();
    }
    console.log(job, "JOB JOB JOB DATA");
    // After commit. A notification failure shouldn't fail the request.
    if (isAccepting) {
      try {
        await sendNotification({
          title: "Invitation accepted",
          notifType: "JOB_INVITATION_ACCEPTED",
          message:
            "A candidate accepted your job invitation. View their profile to take the next step.",
          senderId: uid,
          recepientId: job.employerId, // from DB, not from the client
        });
      } catch (notifError) {
        console.error("Notification failed:", notifError);
      }
    }

    return NextResponse.json(
      {
        message: "Successfully updated job invitation status.",
        data: invitation,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT job invitation failed:", error);
    return NextResponse.json(
      { message: "Unable to update the job invitation status." },
      { status: 500 },
    );
  }
}
