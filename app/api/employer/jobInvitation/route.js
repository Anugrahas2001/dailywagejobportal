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

import { generateId } from "@/lib/generateRandomId";
import { sendNotification } from "@/lib/notificationService";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobDetails from "@/modals/JobDetails";
import JobInvitation from "@/modals/JobInvitation";
import { after, NextResponse } from "next/server";

// export async function POST(request) {
//   console.log("app/api/employer/jobInvitation/route.js - POST");

//   // 1. Authenticate
//   let uid;
//   try {
//     ({ uid } = await verifyFirebaseToken(request));
//   } catch (error) {
//     console.error("Auth failed:", error);
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     // 2. Validate input
//     const body = await request.json();
//     const { workerId, jobId } = body;

//     if (!workerId || !jobId) {
//       return NextResponse.json(
//         { message: "workerId and jobId are required." },
//         { status: 400 },
//       );
//     }

//     const existJobInvitation = await JobInvitation.findOne({
//       employerId: uid,
//       workerId,
//       jobId,
//     }).lean();

//     if (existJobInvitation) {
//       return NextResponse.json(
//         { message: "Already sent job Invitation." },
//         { status: 400 },
//       );
//     }

//     // 3. Create the invitation
//     const jobInvitation = await JobInvitation.create({
//       _id: generateId(),
//       employerId: uid,
//       workerId,
//       jobId,
//     });

//     if (!jobInvitation) {
//       return NextResponse.json(
//         {
//           message: "Failed to create a new Job New Invitation.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     await JobDetails.findOneAndUpdate(
//       { _id: jobId, employerId: uid, aiMatchesCount: { $gt: 0 } },
//       { $inc: { aiMatchesCount: -1 } },
//       { returnDocument: "after", lean: true },
//     );

//     // 4. Send notification (must not fail the request)
//     try {
//       await sendNotification({
//         title: "A new Job Invitation",
//         message: "You have received a new job invitation.",
//         notifType: "JOB_INVITATION",
//         senderId: uid,
//         recepientId: workerId,
//       });
//     } catch (notifyError) {
//       console.error("Notification failed:", notifyError);
//     }

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

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

export async function POST(request) {
  // 1. Authenticate
  const { uid } = await verifyFirebaseToken(request);

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

  try {
    // 3. Make sure the job belongs to this employer
    const ownsJob = await JobDetails.exists({ _id: jobId, employerId: uid });
    if (!ownsJob) {
      return NextResponse.json({ message: "Job not found." }, { status: 404 });
    }

    // 4. Check if the invitation already exists
    const alreadyInvited = await JobInvitation.exists({
      employerId: uid,
      workerId,
      jobId,
    });
    if (alreadyInvited) {
      return NextResponse.json(
        { message: "Already sent job invitation." },
        { status: 409 },
      );
    }

    // 5. Create the invitation
    let jobInvitation;
    try {
      jobInvitation = await JobInvitation.create({
        _id: generateId(),
        employerId: uid,
        workerId,
        jobId,
      });
    } catch (err) {
      // Race condition: another request created it between the check and create
      if (err?.code === 11000) {
        return NextResponse.json(
          { message: "Already sent job invitation." },
          { status: 409 },
        );
      }
      throw err;
    }

    // 6. Decrement the AI match counter
    await JobDetails.updateOne(
      { _id: jobId, employerId: uid, aiMatchesCount: { $gt: 0 } },
      { $inc: { aiMatchesCount: -1 } },
    );

    // 7. Send the notification after the response is sent
    after(async () => {
      try {
        await sendNotification({
          title: "A new Job Invitation",
          message: "You have received a new job invitation.",
          notifType: "JOB_INVITATION",
          senderId: uid,
          recepientId: workerId,
        });
      } catch (notifyError) {
        console.error("Notification failed:", notifyError);
      }
    });

    return NextResponse.json(
      {
        message: "Successfully created a new Job Invitation",
        data: jobInvitation,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Job invitation error:", error);
    return NextResponse.json(
      { message: "Unable to send job invitation." },
      { status: 500 },
    );
  }
}
