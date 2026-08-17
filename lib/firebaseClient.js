// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCG5_n-_vlBfIUgzeiCSJm3KQXHfAIRHPY",
  authDomain: "authentication-f3888.firebaseapp.com",
  projectId: "authentication-f3888",
  storageBucket: "authentication-f3888.firebasestorage.app",
  messagingSenderId: "1041035832071",
  appId: "1:1041035832071:web:f764c22578a075fe2373a2",
  measurementId: "G-J592GZ7ZPR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);

export default app;