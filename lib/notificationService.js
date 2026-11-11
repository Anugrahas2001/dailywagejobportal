import Notifications from "@/modals/Notifications";
import { generateId } from "./generateRandomId";
import { connectDB } from "./mongodb";
import User from "@/modals/User";
import { getMessaging } from "./firebaseAdmin";
import "dotenv/config";

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
    // const appUrl =
    //   process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8080/notify";

    const wsServerUrl =
      process.env.WS_SERVER_URL || "http://localhost:8080/notify";
    console.log(wsServerUrl, "WEB SOCKET SERVER URL");
    const internalSecret = process.env.INTERNAL_SECRET;

    let delivered = false;
    try {
      const r = await fetch(wsServerUrl, {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": internalSecret,
        },
        body: JSON.stringify({ userId: String(recepientId), notification }),
        signal: AbortSignal.timeout(5000),
      });
      delivered = (await r.json()).delivered === true;
      console.log("IN APP NOTIFICATION SEND");
    } catch (e) {
      console.error("WS push failed", e);
    }
    console.log(delivered, "TRUE/FALSE");
    // User not connected (or WS down) -> send a background push
    if (!delivered) {
      try {
        await sendFcmPush({
          recepientId,
          title,
          message,
          data,
          notifType,
          notificationId: String(notification._id),
        });
        console.log("PUSH NOTIFICATION SEND");
      } catch (e) {
        console.error("FCM push failed", e);
      }
    }
  } catch (error) {
    console.log(error, "ERROR DATA");
    return error;
  }
}

async function sendFcmPush({
  recepientId,
  title,
  message,
  data,
  notifType,
  notificationId,
}) {
  console.log("[FCM] sendFcmPush called", {
    recepientId,
    title,
    notifType,
    notificationId,
  });

  const user = await User.findById(recepientId).select("fcmToken").lean();
  console.log("[FCM] user found:", !!user, "| has fcmToken:", !!user?.fcmToken);

  // Wrap the single token in an array (empty array if the user has none)
  const tokens = user?.fcmToken ? [user.fcmToken] : [];
  console.log("[FCM] tokens to send to:", tokens.length, tokens);

  if (!tokens.length) {
    console.log("[FCM] No token for this user, skipping push");
    return { sent: 0, failed: 0 };
  }

  // FCM data values MUST be strings
  const stringData = Object.fromEntries(
    Object.entries({ ...data, notifType, notificationId })
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]),
  );
  console.log("[FCM] data payload:", stringData);

  // FCM only accepts an absolute HTTPS link, so skip it on localhost
  const appUrl =
    "http://localhost:3000" || process.env.NEXT_PUBLIC_APP_URL || "";
  const webpush = appUrl.startsWith("https://")
    ? { fcmOptions: { link: `${appUrl}/notifications` } }
    : undefined;
  console.log(
    "[FCM] webpush link:",
    webpush?.fcmOptions?.link || "none (not https)",
  );

  const res = await getMessaging().sendEachForMulticast({
    tokens,
    notification: { title, body: message },
    data: stringData,
    ...(webpush && { webpush }),
  });

  console.log("[FCM] result:", {
    successCount: res.successCount,
    failureCount: res.failureCount,
  });

  // Clean up dead tokens
  const invalid = [];
  res.responses.forEach((r, i) => {
    if (r.success) {
      console.log(`[FCM] token ${i} sent OK, messageId:`, r.messageId);
      return;
    }
    const code = r.error?.code;
    console.error(`[FCM] token ${i} FAILED:`, code, r.error?.message);

    if (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token"
    ) {
      invalid.push(tokens[i]);
    }
  });

  if (invalid.length) {
    console.log("[FCM] removing invalid tokens:", invalid.length);
    // fcmToken is a String, so use $unset (not $pull)
    await User.updateOne(
      { _id: recepientId, fcmToken: { $in: invalid } },
      { $unset: { fcmToken: "" } },
    );
  }
}
