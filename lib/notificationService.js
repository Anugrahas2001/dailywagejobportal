import Notifications from "@/modals/Notifications";
import { generateId } from "./generateRandomId";
import { connectDB } from "./mongodb";
// import { fetchUserToken } from "./fetchUserToken";

export async function sendNotification({
  title,
  message,
  senderId,
  recepientId,
  data = {},
  notifType,
}) {
  console.log(
    title,
    message,
    senderId,
    recepientId,
    data,
    notifType,
    "EXPLAIN THESE 3",
  );
  try {
    await connectDB();
    const notificationObj = {
      _id: generateId(),
      title,
      message,
      fromId: senderId,
      toId: recepientId,
      data,
      notifType,
    };

    // console.log(notificationObj, "REAL NOTIFICATION OBJECT");

    const notification = await Notifications.create(notificationObj);

    // 2. Ask the WS server to push it
    // ${process.env.WS_URL}
    try {
      // const token = await fetchUserToken();
      console.log("USER TOKEN DATA");
      // await fetch(`ws://localhost:8080/notify`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     // Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({ userId: String(senderId), notification }),
      //   signal: AbortSignal.timeout(2000),
      // });.

      await fetch("http://localhost:8080/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: String(recepientId),
          notification,
        }),
        signal: AbortSignal.timeout(5000),
      });

      console.log("USER TOKEN DATA NOTIFY IS CALLED");
    } catch (e) {
      console.error("WS push failed", e);

      console.error("WS push failed", {
        url: "http://localhost:8080/notify",
        recepientId: String(recepientId),
        code: e.cause?.code,
        message: e.cause?.message,
      });
    }
  } catch (error) {
    console.log(error, "ERROR DATA");
    return error;
  }
}
