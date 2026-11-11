// import { NextResponse } from "next/server";
// import admin from "./firebaseAdmin";

// export const verifyFirebaseToken = async (request) => {
//   try {
//     const authHeader = request.headers.get("authorization");
//     if (!authHeader) {
//       throw new Error("Authorization header is missing.");
//     }

//     const token = authHeader.replace("Bearer ", "").trim();
//     if (!token) {
//       throw new Error("token is missing");
//     }
//     let data;

//     try {
//       data = await admin.auth().verifyIdToken(token, true);
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//     return data;
//   } catch (error) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }
// };

import { getAdmin } from "./firebaseAdmin";

export const verifyFirebaseToken = async (request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    throw new Error("Authorization header is missing.");
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    throw new Error("Token is missing.");
  }
  let data;

  // try {
  //   data = await admin.auth().verifyIdToken(token, true);
  // } catch (error) {
  //   console.error(error);
  //   throw error;
  // }
  // return data;

  // Throws if the token is invalid, expired or revoked
  return await getAdmin().auth().verifyIdToken(token, true);
};
