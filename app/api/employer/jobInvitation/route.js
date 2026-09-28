import { generateId } from "@/lib/generateRandomId";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobInvitation from "@/modals/JobInvitation";
import { NextResponse } from "next/server";

export async function POST(request) {
console.log("app/api/employer/jobInvitation/route.js - POST");
  try {
    const { uid } = await verifyFirebaseToken(request);
    const body = await request.json();

    const bodyData = {
      _id: generateId(),
      employerId: uid,
      workerId: body.workerId,
    };
    const jobInvitation = await JobInvitation.create(bodyData);

    return NextResponse.json({
      message: "Successfully created a new Job Invitation",
      data: jobInvitation,
    });
  } catch (error) {
    console.log(error, "ERROR DATAp");
    return NextResponse.json({
      message: "Unable to sent job Invitation.",
    });
  }
}
