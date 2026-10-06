// "use client";

// import { useEffect, useState } from "react";
// import { getMessaging, getToken } from "firebase/messaging";
// import app from "@/lib/firebaseClient";
// import { fetchUserToken } from "@/lib/fetchUserToken";
// // import { app } from "@/lib/firebase";

// export default function FcmTokenRegistrar() {
//   const [permission, setPermission] = useState(null);

//   async function registerToken() {
//     // Browser, please install/register this service worker for my website.
//     const registration = await navigator.serviceWorker.register(
//       "/firebase-messaging-sw.js",
//     );
//     const activeRegistration = await navigator.serviceWorker.ready;
//     console.log(activeRegistration, "ACTIVE REGISTRATION");
//     // I want to use Firebase Cloud Messaging with this Firebase application.
//     const messaging = getMessaging(app);
//     // The VAPID public key is used for Web Push authentication/identification.
//     //     VAPID public key ≠ FCM token.
//     // The VAPID key is part of your Firebase/Web Push configuration.
//     // The FCM token is specific to a user's browser/app installation.
//     const fcmToken = await getToken(messaging, {
//       vapidKey:
//         "BBolJpgZrrb67d64RzlPrKDvOcx_55qaLPjSd72k3giXZFEhzdjJBVtMPCh1CcfLMhK9MnyGpT_Gr_Z3DGBbktA" ||
//         process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
//       serviceWorkerRegistration: activeRegistration,
//     });

//     if (fcmToken) {
//       console.log(fcmToken, "FCM TOKEN AVALIABLE");
//       const token = await fetchUserToken();
//       await fetch("/api/common/fcm", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ fcm: fcmToken }),
//       });
//     }
//   }

//   useEffect(() => {
//     // This checks whether the browser supports the Notification API.
//     if (!("Notification" in window)) return;
//     // Get current permission
//     setPermission(Notification.permission);

//     //    First visit
//     // Notification.permission
//     //         ↓
//     // "default"
//     // User allowed
//     // Notification.permission
//     //         ↓
//     // "granted"
//     // User blocked
//     // Notification.permission
//     //         ↓
//     // "denied"

//     if (Notification.permission === "granted") {
//       registerToken().catch(console.error);
//     }
//   }, []);

//   async function handleEnable() {
//     // This causes the browser's permission dialog to appear.
//     // Something like: dailywagejob.com wants to send you notifications
//     //     [Allow] [Block]
//     const result = await Notification.requestPermission();
//     setPermission(result);
//     if (result === "granted") {
//       await registerToken().catch(console.error);
//     }
//   }

//   // Only show the banner when we haven't asked yet
//   if (permission !== "default") return null;

//   return (
//     <div className="mb-4 flex items-center justify-between rounded-md bg-blue-50 border border-blue-200 p-3">
//       <p className="text-sm text-blue-900">
//         Turn on notifications to get updates about jobs and applications.
//       </p>
//       <button
//         onClick={handleEnable}
//         className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
//       >
//         Enable
//       </button>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { getMessaging, getToken } from "firebase/messaging";
import app from "@/lib/firebaseClient";
import { fetchUserToken } from "@/lib/fetchUserToken";

const DISMISS_KEY = "notif-popup-dismissed";

export default function FcmTokenRegistrar() {
  const [permission, setPermission] = useState(null);
  const [dismissed, setDismissed] = useState(true); // true until we've checked storage (avoids flash/hydration issues)

  async function registerToken() {
    await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const activeRegistration = await navigator.serviceWorker.ready;

    const messaging = getMessaging(app);
    const fcmToken = await getToken(messaging, {
      vapidKey:
        process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
        "BBolJpgZrrb67d64RzlPrKDvOcx_55qaLPjSd72k3giXZFEhzdjJBVtMPCh1CcfLMhK9MnyGpT_Gr_Z3DGBbktA",
      serviceWorkerRegistration: activeRegistration,
    });

    if (fcmToken) {
      const token = await fetchUserToken();
      await fetch("/api/common/fcm", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fcm: fcmToken }),
      });
    }
  }

  useEffect(() => {
    if (!("Notification" in window)) return;
    setPermission(Notification.permission);

    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }

    if (Notification.permission === "granted") {
      registerToken().catch(console.error);
    }
  }, []);

  // Close popup on Escape
  const open = permission === "default" && !dismissed;
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && handleDismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function handleDismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  async function handleEnable() {
    setDismissed(true); // close our popup; the browser's own dialog takes over
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      await registerToken().catch(console.error);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleDismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-title"
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="notif-title" className="text-lg font-semibold text-gray-900">
          Enable notifications
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Turn on notifications to get updates about jobs and applications.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={handleDismiss}
            className="rounded px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Not now
          </button>
          <button
            onClick={handleEnable}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
