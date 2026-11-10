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

  // Depend on a stable primitive, not the whole user object
  const uid = user?.uid;

  /*
   * --------------------------------------------------
   * 2. Open / maintain the WebSocket while a user is logged in
   * --------------------------------------------------
   */
  useEffect(() => {
    if (!uid) {
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
      clearTimeout(retryTimer);
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

        // Effect may have been cleaned up while we awaited the token
        if (cancelled) return;

        const socket = new WebSocket(
          `${WS_URL}?token=${encodeURIComponent(token)}`
        );
        ws = socket;

        socket.onopen = () => {
          if (cancelled) {
            socket.close(1000, "unmounted");
            return;
          }
          console.log("✅ WebSocket connected");
          attempts = 0;
          setIsConnected(true);
        };

        socket.onmessage = (event) => {
          if (cancelled) return;
          try {
            const notification = JSON.parse(event.data);
            toast(notification?.title ?? "New notification", {
              description: notification?.message,
              duration: 10000,
            });
          } catch (error) {
            console.error("❌ Invalid WebSocket message:", error);
          }
        };

        socket.onerror = () => {
          if (cancelled) return;
          // The error event carries no details; the real info is in onclose.
          // Don't log socket.url here, it contains the auth token.
          console.error("❌ WebSocket error, readyState:", socket.readyState);
        };

        socket.onclose = (event) => {
          if (ws === socket) ws = null;
          if (cancelled) return; // closed by our own cleanup, don't retry

          console.warn("🔌 WebSocket closed", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          setIsConnected(false);
          scheduleRetry();
        };
      } catch (error) {
        if (cancelled) return;
        console.error("❌ Failed to connect WebSocket:", error);
        scheduleRetry();
      } finally {
        connecting = false;
      }
    }

    // Manual reconnect exposed through context
    reconnectRef.current = () => {
      if (cancelled) return;
      attempts = 0;
      clearTimeout(retryTimer);
      connect();
    };

    connect();

    // Runs on logout, user change, or when the app unmounts
    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      reconnectRef.current = () => {};

      if (ws) {
        const socket = ws;
        ws = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;

        if (socket.readyState === WebSocket.CONNECTING) {
          // Closing a CONNECTING socket makes the browser log
          // "closed before the connection is established".
          // Let it finish opening, then close it quietly.
          socket.onopen = () => socket.close(1000, "unmounted");
        } else {
          socket.onopen = null;
          socket.close(1000, "unmounted");
        }
      }
    };
  }, [uid]);

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
