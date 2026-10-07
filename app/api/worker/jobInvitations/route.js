import { connectDB } from "@/lib/mongodb";
import { sendNotification } from "@/lib/notificationService";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobDetails from "@/modals/JobDetails";
import JobInvitation from "@/modals/JobInvitation";
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

export async function PUT(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    // const { searchParams } = new URL(request.url);
    // const jobId = searchParams.get("jobId");
    // const status = searchParams.get("status");

    const {
      jobId,
      status: invitationStatus,
      employerId,
    } = await request.json();
    console.log(jobId, invitationStatus, employerId, "VERIFYING BODY DATA");
    const updatedJobInvitation = await JobInvitation.findOneAndUpdate(
      { jobId, workerId: uid },
      {
        $set: {
          status: invitationStatus,
        },
      },
      {
        returnDocument: "after",
      },
    );

    console.log(updatedJobInvitation, "UPDATED JOB INVITATION");

    if (invitationStatus === "accepted") {
      await sendNotification({
        title: "Invitation accepted",
        notifType: "JOB_INVITATION_ACCEPTED",
        message:
          "A candidate accepted your job invitation. View their profile to take the next step.",
        senderId: uid,
        recepientId: employerId,
      });
    }

    return NextResponse.json(
      {
        message: "Sucessfully updated job invitation status.",
        data: updatedJobInvitation,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");

    return NextResponse.json(
      {
        message: "Unable to update the jonInvitation Status.",
      },
      {
        status: 500,
      },
    );
  }
}
