// "use client";

// import { fetchUserToken } from "@/lib/fetchUserToken";
// import { useEffect, useState } from "react";

// export function useNotifications() {
//   const [items, setItems] = useState([]);

//   useEffect(() => {
//     let ws = null;
//     let retryTimer = null;
//     let closed = false;

//     // --------------------------------------------------
//     // 1. Load existing notifications
//     // --------------------------------------------------
//     async function loadNotifications() {
//       try {
//         const response = await fetch("/api/notifications", {
//           method: "GET",
//           credentials: "include",
//         });

//         if (!response.ok) {
//           throw new Error("Failed to load notifications");
//         }

//         const data = await response.json();

//         setItems(Array.isArray(data) ? data : []);
//       } catch (error) {
//         console.error("Failed to load notifications:", error);
//       }
//     }

//     // --------------------------------------------------
//     // 2. Connect to WebSocket
//     // --------------------------------------------------
//     async function connect() {
//       if (closed) return;

//       try {
//         // Get a Firebase ID token from your Next.js API

//         const token=await fetchUserToken();

//         if (!token) {
//           throw new Error("WebSocket token is missing");
//         }

//         if (closed) return;

//         // IMPORTANT:
//         // NEXT_PUBLIC_WS_URL should be something like:
//         //
//         // NEXT_PUBLIC_WS_URL=wss://your-domain.com
//         //

//         // NEXT_PUBLIC_WS_URL=ws://localhost:8080
//         // NOT ws:// in production.
//         ws = new WebSocket(
//           `${process.env.NEXT_PUBLIC_WS_URL}?token=${encodeURIComponent(token)}`
//         );

//         // --------------------------------------------------
//         // Connection opened
//         // --------------------------------------------------
//         ws.onopen = () => {
//           console.log("WebSocket connected");
//         };

//         // --------------------------------------------------
//         // Receive notification
//         // --------------------------------------------------
//         ws.onmessage = (event) => {
//           try {
//             const notification = JSON.parse(event.data);

//             setItems((previousItems) => [
//               notification,
//               ...previousItems,
//             ]);
//           } catch (error) {
//             console.error(
//               "Invalid WebSocket message:",
//               error
//             );
//           }
//         };

//         // --------------------------------------------------
//         // Connection error
//         // --------------------------------------------------
//         ws.onerror = (error) => {
//           console.error("WebSocket error:", error);
//         };

//         // --------------------------------------------------
//         // Connection closed
//         // --------------------------------------------------
//         ws.onclose = () => {
//           console.log("WebSocket disconnected");

//           ws = null;

//           if (!closed) {
//             retryTimer = setTimeout(() => {
//               connect();
//             }, 3000);
//           }
//         };
//       } catch (error) {
//         console.error(
//           "WebSocket connection failed:",
//           error
//         );

//         if (!closed) {
//           retryTimer = setTimeout(() => {
//             connect();
//           }, 3000);
//         }
//       }
//     }

//     loadNotifications();
//     connect();

//     // --------------------------------------------------
//     // Cleanup
//     // --------------------------------------------------
//     return () => {
//       closed = true;

//       if (retryTimer) {
//         clearTimeout(retryTimer);
//       }

//       if (ws) {
//         ws.close();
//         ws = null;
//       }
//     };
//   }, []);

//   return items;
// }

// SECOND WORKING

"use client";
console.log("🔥 useNotifications.js FILE LOADED");

import { fetchUserToken } from "@/lib/fetchUserToken";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useNotifications() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let ws = null;
    let retryTimer = null;
    let closed = false;

    console.log("🔔 useNotifications mounted");

    // --------------------------------------------------
    // 1. Load existing notifications
    // --------------------------------------------------
    // async function loadNotifications() {
    //   console.log("📥 Loading existing notifications...");

    //   try {
    //     const response = await fetch("/api/notifications", {
    //       method: "GET",
    //       credentials: "include",
    //     });

    //     console.log("📥 Notifications API response:", response.status);

    //     if (!response.ok) {
    //       throw new Error("Failed to load notifications");
    //     }

    //     const data = await response.json();

    //     console.log("✅ Existing notifications loaded:", data);

    //     setItems(Array.isArray(data) ? data : []);
    //   } catch (error) {
    //     console.error("❌ Failed to load notifications:", error);
    //   }
    // }

    // --------------------------------------------------
    // 2. Connect to WebSocket
    // --------------------------------------------------
    async function connect() {
      console.log("\n========== WebSocket Connect ==========");

      if (closed) {
        console.log("⚠️ Connection cancelled because hook is closed");
        return;
      }

      try {
        // ----------------------------------------------
        // Get Firebase token
        // ----------------------------------------------
        console.log("🔐 Fetching Firebase token...");

        const token = await fetchUserToken();

        if (!token) {
          console.error("❌ Firebase token is missing");
          throw new Error("WebSocket token is missing");
        }

        console.log("✅ Firebase token received");
        console.log("Token length:", token.length);

        if (closed) {
          console.log("⚠️ Hook closed before WebSocket connection");
          return;
        }

        // ----------------------------------------------
        // WebSocket URL
        // ----------------------------------------------
        // const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
        const wsUrl = "ws://localhost:8080";

        console.log("🌐 NEXT_PUBLIC_WS_URL:", wsUrl);

        if (!wsUrl) {
          throw new Error("NEXT_PUBLIC_WS_URL is not defined");
        }

        const websocketUrl = `${wsUrl}?token=${encodeURIComponent(token)}`;

        console.log("🔌 Creating WebSocket connection...");

        // Don't log the complete URL because it contains
        // the Firebase token.
        console.log("🔌 WebSocket base URL:", wsUrl);

        // ----------------------------------------------
        // Create WebSocket
        // ----------------------------------------------
        ws = new WebSocket(websocketUrl);

        console.log("🔄 WebSocket object created");

        console.log("🔄 Initial readyState:", ws.readyState);

        // --------------------------------------------------
        // Connection opened
        // --------------------------------------------------
        ws.onopen = () => {
          console.log("\n====================================");

          console.log("✅✅ WEBSOCKET CONNECTED SUCCESSFULLY");

          console.log("🔌 WebSocket readyState:", ws.readyState);

          console.log("🌐 Connected to:", wsUrl);

          console.log("====================================\n");
        };

        // --------------------------------------------------
        // Receive notification
        // --------------------------------------------------
        ws.onmessage = (event) => {
          console.log("📨 WebSocket message received");

          console.log("Raw message:", event.data);

          try {
            const notification = JSON.parse(event.data);

            console.log("✅ Notification parsed:", notification);

            //             Notification: {
            //   _id: '01b801a9ea9ecddc06b6d825e0bb',
            //   title: 'Application status updated',
            //   message: 'The status of your job application has changed. Open your applications to see the latest update.',
            //   fromId: 'Q2c5A9SXtYcIBBaqMyvJIfuOKbd2',
            //   toId: 'hJwhgPovT9efMzPVoSqwTzwIDaw2',
            //   createdAt: '2026-10-03T08:10:49.766Z',
            //   updatedAt: '2026-10-03T08:10:49.766Z',
            //   __v: 0
            // }
            toast(notification?.title ?? "New notification", {
              description: notification?.message,
            });
            setItems((previousItems) => [notification, ...previousItems]);
          } catch (error) {
            console.error("❌ Invalid WebSocket message:", error);
          }
        };

        // --------------------------------------------------
        // Connection error
        // --------------------------------------------------
        ws.onerror = (error) => {
          console.error("\n❌❌ WEBSOCKET ERROR");

          console.error("WebSocket error:", error);

          console.error("Current readyState:", ws?.readyState);
        };

        // --------------------------------------------------
        // Connection closed
        // --------------------------------------------------
        ws.onclose = (event) => {
          console.log("\n========== WebSocket Closed ==========");

          console.log("Close code:", event.code);

          console.log("Close reason:", event.reason || "No reason provided");

          console.log("Was clean:", event.wasClean);

          console.log("======================================");

          ws = null;

          if (!closed) {
            console.log("🔄 Reconnecting WebSocket in 3 seconds...");

            retryTimer = setTimeout(() => {
              connect();
            }, 3000);
          } else {
            console.log(
              "🛑 WebSocket reconnect cancelled because hook is closed",
            );
          }
        };
      } catch (error) {
        console.error("\n❌ WebSocket connection failed:", error);

        console.error("Error message:", error?.message);

        if (!closed) {
          console.log("🔄 Retrying WebSocket connection in 3 seconds...");

          retryTimer = setTimeout(() => {
            connect();
          }, 3000);
        }
      }
    }

    // --------------------------------------------------
    // Start
    // --------------------------------------------------

    console.log("🚀 Starting notification system...");

    // loadNotifications();
    connect();

    // --------------------------------------------------
    // Cleanup
    // --------------------------------------------------
    return () => {
      console.log("🧹 Cleaning up useNotifications...");

      closed = true;

      if (retryTimer) {
        console.log("🧹 Clearing WebSocket retry timer");

        clearTimeout(retryTimer);
      }

      if (ws) {
        console.log("🧹 Closing WebSocket connection");

        ws.close();
        ws = null;
      }

      console.log("🧹 Notification system cleanup completed");
    };
  }, []);

  return items;
}

//================================= DONE DONE
// "use client";

// import { useEffect, useRef } from "react";
// import { getAuth } from "firebase/auth";

// export function useNotifications() {
//   const wsRef = useRef(null);

//   useEffect(() => {
//     let ws;
//     let cancelled = false;

//     const connect = async () => {
//       try {
//         const auth = getAuth();

//         const user = auth.currentUser;

//         if (!user) {
//           console.log("⚠️ No authenticated Firebase user");
//           return;
//         }

//         /*
//          * Get Firebase ID token
//          */
//         const token = await user.getIdToken();

//         if (cancelled) {
//           return;
//         }

//         /*
//          * Create WebSocket connection
//          */
//         const wsUrl =
//           `${process.env.NEXT_PUBLIC_WS_URL}` +
//           `?token=${encodeURIComponent(token)}`;

//         console.log("🌐 Connecting to:", process.env.NEXT_PUBLIC_WS_URL);

//         ws = new WebSocket(wsUrl);

//         wsRef.current = ws;

//         /*
//          * Connection opened
//          */
//         ws.onopen = () => {
//           console.log("✅ WebSocket connected");
//         };

//         /*
//          * Notification received
//          */
//         ws.onmessage = (event) => {
//           try {
//             console.log("📩 Raw WebSocket message:", event.data);

//             const notification = JSON.parse(event.data);

//             console.log(
//               "🔔 Notification received:",
//               notification
//             );

//             /*
//              * Here you can:
//              *
//              * dispatch(addNotification(notification));
//              *
//              * or
//              *
//              * showToast(notification);
//              */
//           } catch (error) {
//             console.error(
//               "❌ Failed to parse WebSocket message:",
//               error
//             );
//           }
//         };

//         /*
//          * WebSocket error
//          */
//         ws.onerror = (error) => {
//           console.error(
//             "❌ WebSocket connection error:",
//             error
//           );
//         };

//         /*
//          * WebSocket closed
//          */
//         ws.onclose = (event) => {
//           console.log(
//             "🔌 WebSocket disconnected",
//             event.code,
//             event.reason
//           );

//           wsRef.current = null;
//         };
//       } catch (error) {
//         console.error(
//           "❌ Failed to connect WebSocket:",
//           error
//         );
//       }
//     };

//     connect();

//     return () => {
//       cancelled = true;

//       if (ws) {
//         ws.close();
//       }

//       wsRef.current = null;
//     };
//   }, []);

//   return {
//     ws: wsRef.current,
//   };
// }
