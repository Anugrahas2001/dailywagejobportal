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

  if (!user) {
    throw new Error("User is not logged in.");
  }

  return user.getIdToken();
}