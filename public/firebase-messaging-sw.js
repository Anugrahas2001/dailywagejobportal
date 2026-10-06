importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

// Firebase service worker

firebase.initializeApp({
  //   apiKey: "YOUR_API_KEY",
  //   authDomain: "YOUR_AUTH_DOMAIN",
  //   projectId: "YOUR_PROJECT_ID",
  //   storageBucket: "YOUR_STORAGE_BUCKET",
  //   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  //   appId: "YOUR_APP_ID",

  apiKey: "AIzaSyCG5_n-_vlBfIUgzeiCSJm3KQXHfAIRHPY",
  authDomain: "authentication-f3888.firebaseapp.com",
  projectId: "authentication-f3888",
  storageBucket: "authentication-f3888.firebasestorage.app",
  messagingSenderId: "1041035832071",
  appId: "1:1041035832071:web:f764c22578a075fe2373a2",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  const notificationTitle = payload.notification?.title || "New notification";

  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icon.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
