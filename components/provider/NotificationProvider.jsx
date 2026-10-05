// "use client";

// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import { toast } from "sonner";
// import { fetchUserToken } from "@/lib/fetchUserToken";

// const NotificationContext = createContext(null);

// export function NotificationProvider({ children }) {
//   const [isConnected, setIsConnected] = useState(false);

//   const wsRef = useRef(null);
//   const retryTimerRef = useRef(null);
//   const closedRef = useRef(false);
//   const connectingRef = useRef(false);

//   /*
//    * --------------------------------------------------
//    * WebSocket connection
//    * --------------------------------------------------
//    */
//   const connect = useCallback(async () => {
//     if (closedRef.current) {
//       return;
//     }

//     // Prevent duplicate connections
//     if (
//       connectingRef.current ||
//       wsRef.current?.readyState === WebSocket.OPEN ||
//       wsRef.current?.readyState === WebSocket.CONNECTING
//     ) {
//       return;
//     }

//     connectingRef.current = true;

//     try {
//       console.log("🔐 Fetching Firebase token...");

//       const token = await fetchUserToken();

//       if (!token) {
//         throw new Error("WebSocket token is missing");
//       }

//       if (closedRef.current) {
//         return;
//       }

//       const wsUrl = "ws://localhost:8080" || process.env.NEXT_PUBLIC_WS_URL;

//       if (!wsUrl) {
//         throw new Error("NEXT_PUBLIC_WS_URL is not defined");
//       }

//       const websocketUrl = `${wsUrl}?token=${encodeURIComponent(token)}`;

//       console.log("🔌 Creating WebSocket connection...");

//       const ws = new WebSocket(websocketUrl);

//       wsRef.current = ws;

//       /*
//        * --------------------------------------------------
//        * Connected
//        * --------------------------------------------------
//        */
//       ws.onopen = () => {
//         console.log("✅ WebSocket connected");

//         connectingRef.current = false;
//         setIsConnected(true);
//       };

//       /*
//        * --------------------------------------------------
//        * Notification received
//        * --------------------------------------------------
//        */
//       ws.onmessage = (event) => {
//         try {
//           const notification = JSON.parse(event.data);

//           console.log("🔔 Notification received:", notification);

//           toast(notification?.title ?? "New notification", {
//             description: notification?.message,
//           });
//         } catch (error) {
//           console.error("❌ Invalid WebSocket message:", error);
//         }
//       };

//       /*
//        * --------------------------------------------------
//        * Error
//        * --------------------------------------------------
//        */
//       ws.onerror = (error) => {
//         console.error("❌ WebSocket error:", error);
//       };

//       /*
//        * --------------------------------------------------
//        * Closed
//        * --------------------------------------------------
//        */
//       ws.onclose = (event) => {
//         console.log("🔌 WebSocket disconnected:", event.code, event.reason);

//         connectingRef.current = false;
//         wsRef.current = null;

//         setIsConnected(false);

//         if (!closedRef.current) {
//           retryTimerRef.current = setTimeout(() => {
//             connect();
//           }, 3000);
//         }
//       };
//     } catch (error) {
//       console.error("❌ Failed to connect WebSocket:", error);

//       connectingRef.current = false;
//       setIsConnected(false);

//       if (!closedRef.current) {
//         retryTimerRef.current = setTimeout(() => {
//           connect();
//         }, 3000);
//       }
//     }
//   }, []);

//   /*
//    * --------------------------------------------------
//    * Start notification system
//    * --------------------------------------------------
//    */
//   useEffect(() => {
//     closedRef.current = false;
//     connect();

//     /*
//      * Cleanup only when Provider is destroyed
//      */
//     return () => {
//       console.log("🧹 Cleaning NotificationProvider");

//       closedRef.current = true;

//       if (retryTimerRef.current) {
//         clearTimeout(retryTimerRef.current);
//         retryTimerRef.current = null;
//       }

//       if (wsRef.current) {
//         wsRef.current.close();
//         wsRef.current = null;
//       }

//       connectingRef.current = false;
//     };
//   }, [connect]);

//   /*
//    * --------------------------------------------------
//    * Context value
//    * --------------------------------------------------
//    */
//   const value = {
//     isConnected,
//     reconnect: connect,
//   };

//   return (
//     <NotificationContext.Provider value={value}>
//       {children}
//     </NotificationContext.Provider>
//   );
// }

// /*
//  * --------------------------------------------------
//  * Custom hook
//  * --------------------------------------------------
//  */
// export function useNotification() {
//   const context = useContext(NotificationContext);

//   if (!context) {
//     throw new Error("useNotification must be used inside NotificationProvider");
//   }

//   return context;
// }

"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import { fetchUserToken } from "@/lib/fetchUserToken";

const NotificationContext = createContext(null);

// env variable first, localhost only as a dev fallback
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

export function NotificationProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(null);
  const reconnectRef = useRef(() => {});

  /*
   * --------------------------------------------------
   * 1. Track the logged-in Firebase user
   * --------------------------------------------------
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  /*
   * --------------------------------------------------
   * 2. Connect while a user is logged in, disconnect on logout.
   *    Everything is local to this effect run, so React Strict Mode
   *    (which runs effects twice in dev) can't create two sockets.
   * --------------------------------------------------
   */
  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      reconnectRef.current = () => {};
      return;
    }

    let cancelled = false;
    let ws = null;
    let retryTimer = null;
    let attempts = 0;
    let connecting = false;

    const scheduleRetry = () => {
      if (cancelled) return;
      // Backoff: 1s, 2s, 4s ... max 30s
      const delay = Math.min(1000 * 2 ** attempts, 30000);
      attempts += 1;
      retryTimer = setTimeout(connect, delay);
    };

    async function connect() {
      if (cancelled || connecting) return;

      if (
        ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      connecting = true;

      try {
        // Fresh token each time, since Firebase tokens expire
        const token = await fetchUserToken();
        if (!token) throw new Error("WebSocket token is missing");
        if (cancelled) return;

        ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);

        ws.onopen = () => {
          console.log("✅ WebSocket connected");
          attempts = 0;
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            toast(notification?.title ?? "New notification", {
              // avoids duplicate toasts
              description: notification?.message,
              duration: 10000,
            });
          } catch (error) {
            console.error("❌ Invalid WebSocket message:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
        };

        ws.onclose = (event) => {
          console.log("🔌 WebSocket disconnected:", event.code, event.reason);
          ws = null;
          if (!cancelled) setIsConnected(false);
          scheduleRetry();
        };
      } catch (error) {
        console.error("❌ Failed to connect WebSocket:", error);
        scheduleRetry();
      } finally {
        connecting = false;
      }
    }

    reconnectRef.current = connect;
    connect();

    // Runs on logout, user change, or when the app unmounts
    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      if (ws) {
        ws.close();
        ws = null;
      }
      setIsConnected(false);
    };
  }, [user]);

  const value = {
    isConnected,
    reconnect: () => reconnectRef.current(),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }
  return context;
}
