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
import JobInvitation from "@/modals/JobInvitation";
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("app/api/employer/jobInvitation/route.js - POST");

  // 1. Authenticate
  let uid;
  try {
    ({ uid } = await verifyFirebaseToken(request));
  } catch (error) {
    console.error("Auth failed:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Validate input
    const body = await request.json();
    const { workerId, jobId } = body;

    if (!workerId || !jobId) {
      return NextResponse.json(
        { message: "workerId and jobId are required." },
        { status: 400 },
      );
    }

    // 3. Create the invitation
    const jobInvitation = await JobInvitation.create({
      _id: generateId(),
      employerId: uid,
      workerId,
      jobId,
    });

    // 4. Send notification (must not fail the request)
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
