

"use client";

import { useNotifications } from "./hooks/useNotifications";


export default function TestNotifications() {
  console.log("🟢 TestNotifications rendered");

  const notifications = useNotifications();

  console.log(
    "🟢 Notifications:",
    notifications
  );

  return <div>Notification test</div>;
}