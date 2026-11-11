// import admin from "firebase-admin";

// // import serviceAccount from "../serviceAccount.json" with { type: "json" };
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// // Fix escaped line breaks in the private key
// serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// export default admin;
// export const messaging = admin.messaging();


import admin from "firebase-admin";

export function getAdmin() {
  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
    }

    const serviceAccount = JSON.parse(raw);
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin;
}

export const getMessaging = () => getAdmin().messaging();
export default getAdmin;