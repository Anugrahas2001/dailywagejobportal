"use client";

import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebaseClient";
import Image from "next/image";
import useLoading from "@/components/hooks/useLoading";
import Loading from "@/components/Loading";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/lib/features/profiles/userThunk";
import Error from "@/components/Error";
import { clearOnboardingError } from "@/lib/features/profiles/userSlice";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, setLoading } = useLoading();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const onboardPage = useSelector((state) => state.user.onboardPage);
  const isOnboardingComplete = useSelector(
    (state) => state.user.isOnboardingCompleted,
  );
  const status = useSelector((state) => state.user.status);
  const userRole = useSelector((state) => state.user.role);
  const error = useSelector((state) => state.user.error);

  const handleLoginForm = async (e) => {
    e.preventDefault();

    try {
      let userCredential;
      if (loading) return;

      if (!email.trim()) {
        alert("Email is required");
        return;
      }

      if (!password.trim()) {
        alert("Password is required");
        return;
      }
      if (password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
      }
      setLoading(true);
      localStorage.setItem("role", role);
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();

        try {
          await dispatch(login({ token, role })).unwrap();
          return;
        } catch (error) {
          // Login failed
          console.log(error.message || "Login failed:", error);
        }
      }

      try {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
      } catch (error) {
        // If sign in fails, create the account

        switch (error.code) {
          case "auth/invalid-email":
            alert("Invalid email address");
            break;

          case "auth/wrong-password":
            alert("Incorrect password");
            break;

          case "auth/email-already-in-use":
            alert("Account already exists");
            break;

          case "auth/too-many-requests":
            alert("Too many attempts. Try again later.");
            break;

          case "auth/invalid-credential":
          case "auth/user-not-found":
            console.log("User not found. Creating account...");
            userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password,
            );

            console.log("✅ Account created");
            break;

          default:
            alert(error.message);
        }
      }

      const token = await userCredential.user.getIdToken();

      try {
          await dispatch(login({ token, role })).unwrap();
        } catch (error) {
          // Login failed
          console.log(error.message || "Login failed:", error);
        }
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error.code);
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const Provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, Provider);
      const token = await result.user.getIdToken();
      await dispatch(login({ token, role })).unwrap();
      return;
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    const handleRedirect = async () => {
      if (!userRole) return;

      // User selected the wrong role
      if (role !== userRole) {
        await signOut(auth);

        alert(`You selected the wrong role. Your actual role is: ${userRole}`);

        localStorage.removeItem("role");
        localStorage.removeItem("profileImage");
        router.replace("/");
        return;
      }

      // Onboarding is not completed
      if (!isOnboardingComplete) {
        console.log("Redirecting to onboarding:", onboardPage);

        router.replace(`/onboarding/${onboardPage}`);
        return;
      }

      // Onboarding completed
      if (isOnboardingComplete) {
        console.log(userRole, role, "USER ROLE DATA");
        router.replace(
          role === "worker" ? "/workerDashboard" : "/employerDashboard",
        );
      }
    };

    handleRedirect();
  }, [role, userRole, isOnboardingComplete, onboardPage, router]);

  return (
    <div className="h-screen w-screen bg-slate-50">
      <div className="flex flex-col justify-center items-center">
        <form
          onSubmit={handleLoginForm}
          className="border border-gray-700 bg-zinc-50 m-4"
        >
          <div className="h-64 flex flex-col items-center justify-center p-4">
            <input
              className="w-54 md:w-80 bg-zinc-300 p-2 border-0 outline-none rounded-sm"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-54 md:w-80 bg-zinc-300 mt-4 p-2 border-0 outline-none rounded-sm"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* <button type="submit">Continue</button>
             */}
            <button
              disabled={loading}
              className="bg-blue-700 w-36 mt-4 h-12 rounded-sm cursor-pointer text-white font-semibold"
            >
              {loading ? "Please wait..." : "Login"}
            </button>
          </div>
        </form>
        <div>(Or)</div>
        <div
          className="h-12 w-64 mt-4 bg-blue-700 flex border-0 rounded-sm cursor-pointer"
          onClick={handleGoogleSignIn}
        >
          <Image
            src="/googleIcon.webp"
            alt="google"
            width={20}
            height={20}
            className="w-10 h-10 bg-white object-none object-center m-1 rounded-full"
          />
          <button className="rounded-lg cursor-pointer text-white font-semibold w-64">
            Sign In with Google
          </button>
        </div>
      </div>
      {(status === "pending" || loading) && <Loading />}
      {error && (
        <Error error={error} onClick={() => dispatch(clearOnboardingError())} />
      )}
    </div>
  );
};

export default LoginForm;
