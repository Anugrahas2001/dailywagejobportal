// import { generateId } from "@/lib/generateRandomId";
// import { sendNotification } from "@/lib/notificationService";
// import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
// import JobInvitation from "@/modals/JobInvitation";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   console.log("app/api/employer/jobInvitation/route.js - POST");
//   try {
//     const { uid } = await verifyFirebaseToken(request);
//     const body = await request.json();
//     console.log(body, "BODY DATA");
//     const bodyData = {
//       _id: generateId(),
//       employerId: uid,
//       workerId: body.workerId,
//       jobId: body.jobId,
//     };
//     const jobInvitation = await JobInvitation.create(bodyData);

//     const notificationObj={
//       title:"A new Job Invitation",
//       message:"You have recived a new job inivitation.",
//       senderId:uid,
//       recepientId:body?.workerId
//     }

//     await sendNotification(notificationObj)

//     return NextResponse.json({
//       message: "Successfully created a new Job Invitation",
//       data: jobInvitation,
//     });
//   } catch (error) {
//     console.log(error, "ERROR DATAp");
//     return NextResponse.json({
//       message: "Unable to sent job Invitation.",
//     });
//   }
// }

// import { generateId } from "@/lib/generateRandomId";
// import { sendNotification } from "@/lib/notificationService";
// import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
// import JobDetails from "@/modals/JobDetails";
// import JobInvitation from "@/modals/JobInvitation";
// import { after, NextResponse } from "next/server";

// const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

// export async function POST(request) {
//   // 1. Authenticate
//   const { uid } = await verifyFirebaseToken(request);

//   // 2. Parse and validate input
//   let body;
//   try {
//     body = await request.json();
//   } catch {
//     return NextResponse.json(
//       { message: "Invalid JSON body." },
//       { status: 400 },
//     );
//   }

//   const { workerId, jobId } = body ?? {};
//   if (!isNonEmptyString(workerId) || !isNonEmptyString(jobId)) {
//     return NextResponse.json(
//       { message: "workerId and jobId must be non-empty strings." },
//       { status: 400 },
//     );
//   }

//   try {
//     let jobInvitation;

//     const alreadyInvited = await JobInvitation.findOne({
//       employerId: uid,
//       workerId,
//       jobId,
//       cancelled: true,
//     });
//     if (alreadyInvited) {
//       jobInvitation = await JobInvitation.findOneAndUpdate(
//         { employerId: uid, workerId, jobId, cancelled: true },
//         { $set: { cancelled: false } },
//         { new: true, lean: true },
//       );

//       return NextResponse.json(
//         { message: "Job notification created." },
//         { status: 409 },
//       );
//     } else {
//       try {
//         jobInvitation = await JobInvitation.create({
//           _id: generateId(),
//           employerId: uid,
//           workerId,
//           jobId,
//         });
//       } catch (err) {
//         // Race condition: another request created it between the check and create
//         // if (err?.code === 11000) {
//         return NextResponse.json(
//           { message: "Already sent job invitation." },
//           { status: 409 },
//         );
//         // }
//         // throw err;
//       }
//     }

//     // 6. Decrement the AI match counter
//     // await JobDetails.updateOne(
//     //   { _id: jobId, employerId: uid, aiMatchesCount: { $gt: 0 } },
//     //   { $inc: { aiMatchesCount: -1 } },
//     // );

//     // 7. Send the notification after the response is sent
//     after(async () => {
//       try {
//         await sendNotification({
//           title: "A new Job Invitation",
//           message: "You have received a new job invitation.",
//           notifType: "JOB_INVITATION",
//           senderId: uid,
//           recepientId: workerId,
//         });
//       } catch (notifyError) {
//         console.error("Notification failed:", notifyError);
//       }
//     });

//     return NextResponse.json(
//       {
//         message: "Successfully created a new Job Invitation",
//         data: jobInvitation,
//       },
//       { status: 201 },
//     );
//   } catch (error) {
//     console.error("Job invitation error:", error);
//     return NextResponse.json(
//       { message: "Unable to send job invitation." },
//       { status: 500 },
//     );
//   }
// }

import { generateId } from "@/lib/generateRandomId";
import { sendNotification } from "@/lib/notificationService";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobInvitation from "@/modals/JobInvitation";
import { after, NextResponse } from "next/server";

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

export async function POST(request) {
  // 1. Authenticate (401, not an unhandled 500)
  let uid;
  try {
    ({ uid } = await verifyFirebaseToken(request));
  } catch {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  // 2. Parse and validate input
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { workerId, jobId } = body ?? {};
  if (!isNonEmptyString(workerId) || !isNonEmptyString(jobId)) {
    return NextResponse.json(
      { message: "workerId and jobId must be non-empty strings." },
      { status: 400 },
    );
  }

  const filter = {
    employerId: uid,
    workerId: workerId.trim(),
    jobId: jobId.trim(),
  };

  try {
    // 3. Try to restore a previously cancelled invitation (single atomic query)
    let jobInvitation = await JobInvitation.findOneAndUpdate(
      { ...filter, cancelled: true },
      { $set: { cancelled: false } },
      { new: true, lean: true },
    );
    let statusCode = 200;

    // 4. Otherwise create a new one
    if (!jobInvitation) {
      try {
        const created = await JobInvitation.create({
          _id: generateId(),
          ...filter,
        });
        jobInvitation = created.toObject();
        statusCode = 201;
      } catch (err) {
        // Duplicate key: an active invitation already exists
        // (or another request created it a moment ago)

        return NextResponse.json(
          { message: "Already sent job invitation." },
          { status: 409 },
        );
      }
    }

    // 5. Notify after the response is sent (for both new and restored invites)
    after(async () => {
      try {
        await sendNotification({
          title: "A new Job Invitation",
          message: "You have received a new job invitation.",
          notifType: "JOB_INVITATION",
          senderId: uid,
          recepientId: filter.workerId,
        });
      } catch (notifyError) {
        console.error("Notification failed:", notifyError);
      }
    });

    return NextResponse.json(
      {
        message:
          statusCode === 201
            ? "Successfully created a new Job Invitation."
            : "Job invitation restored successfully.",
        data: jobInvitation,
      },
      { status: statusCode },
    );
  } catch (error) {
    console.error("Job invitation error:", error);
    return NextResponse.json(
      { message: "Unable to send job invitation." },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  // 1. Auth: failures here are 401, not 500
  let uid;
  try {
    ({ uid } = await verifyFirebaseToken(request));
  } catch {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  // 2. Parse and validate the body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { workerId, jobId, isCancelled = true } = body;

  if (
    typeof workerId !== "string" ||
    typeof jobId !== "string" ||
    !workerId ||
    !jobId ||
    typeof isCancelled !== "boolean"
  ) {
    return NextResponse.json(
      { message: "workerId, jobId and a boolean isCancelled are required." },
      { status: 400 },
    );
  }

  try {
    // 3. Match the opposite state so the update is always a real change
    const jobInvite = await JobInvitation.findOneAndUpdate(
      { employerId: uid, workerId, jobId, cancelled: !isCancelled },
      {
        $set: {
          cancelled: isCancelled,
        },
      },
      {
        new: true,
        lean: true,
        projection: { workerId: 1, jobId: 1, cancelled: 1, status: 1 },
      },
    );

    // 4. Don't report success when nothing changed
    if (!jobInvite) {
      return NextResponse.json(
        { message: "Job invitation not found or already in that state." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Job invitation cancelled successfully.",
        data: jobInvite,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT job invitation error:", error);
    return NextResponse.json(
      { message: "Unable to update job invitation." },
      { status: 500 },
    );
  }
}
