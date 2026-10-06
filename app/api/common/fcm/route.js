import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import User from "@/modals/User";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    const { fcm } = await request.json();
    console.log(fcm,uid, "FCM TOKEN DATA");
    const updatedUser = await User.findByIdAndUpdate(
      {_id:uid},
      {
        $set: {
          fcmToken: fcm,
        },
      },
      {
        returnDocument: "after",
        upsert: false,
      },
    );

    console.log(updatedUser, "UPDATED USER DATA");

    return NextResponse.json(
      {
        message: "Successfully updated the fcm token for the user.",
        data: updatedUser,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to update the fcm token for the user.",
      },
      {
        status: 500,
      },
    );
  }
}
