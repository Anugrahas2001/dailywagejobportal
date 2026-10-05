import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import Notifications from "@/modals/Notifications";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    const allNotifications = await Notifications.find({ toId: uid })
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const notificationsCount = await Notifications.countDocuments({
      toId: uid,
    });

    console.log(allNotifications, "ALL THE AVILABLE NOTIFICATIONS");
    return NextResponse.json(
      {
        message: "Successfully fetched all the avilable notifications.",
        data: allNotifications,
        totalCount: notificationsCount,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Unable to fetch the notifications.",
      },
      {
        status: 500,
      },
    );
  }
}
