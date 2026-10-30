import { auth } from "./firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

export async function fetchUserToken() {
  const user =
    auth.currentUser ||
    (await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    }));

  console.log(user, "logged in user");
  if (!user) {
    throw new Error("User is not logged in.");
  }

  return user.getIdToken();
}


// export async function fetchUserToken() {
//   await auth.authStateReady(); // Firebase v10.? / 9.2x+
//   const user = auth.currentUser;
//   if (!user) throw new Error("User is not logged in.");
//   return user.getIdToken();
// }