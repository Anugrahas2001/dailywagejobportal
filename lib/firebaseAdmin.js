import admin from "firebase-admin";

// const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

// import serviceAccount from "../serviceAccount.json";

import serviceAccount from "../serviceAccount.json" with { type: "json" };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
export const messaging = admin.messaging();
