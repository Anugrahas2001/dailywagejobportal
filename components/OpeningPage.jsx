"use client";

import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import { useDispatch, useSelector } from "react-redux";
import { verifyLogin } from "@/lib/features/profiles/userThunk";

const OpeningPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const role = useSelector((state) => state.user.role);
  const status = useSelector((state) => state.user.status);

  const isOnboardingComplete = useSelector(
    (state) => state.user.isOnboardingCompleted
  );
  const onboardPage = useSelector(
    (state) => state.user.onboardPage
  );

  const handleRole = (roleSelected) => {
    router.replace(`/login?role=${roleSelected}`);
  };

  const getCardClass = (cardRole) => {
    const baseClass =
      "bg-zinc-50 m-2 p-2 border-2 rounded-xl transform-gpu transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl cursor-pointer";

    const selectedClass =
      "border-blue-600 bg-blue-50 ring-4 ring-blue-300 scale-105 shadow-2xl";

    return `${baseClass} ${
      role === cardRole ? selectedClass : "border-gray-200"
    }`;
  };

  // --------------------------------------------------
  // 1. Check Firebase authentication
  // --------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          
          // setIsAuthenticated(null);
          setAuthChecked(true);
          return;
        }

        // Firebase user exists
        setIsAuthenticated(user);

        const token = await user.getIdToken();

        // Verify user with backend / Redux
        await dispatch(
          verifyLogin({ token })
        ).unwrap();

      } catch (error) {
        console.log("Authentication verification failed:", error);

        setIsAuthenticated(null);
      } finally {
        // Firebase + backend authentication check is finished
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // --------------------------------------------------
  // 2. Handle navigation
  // --------------------------------------------------
  useEffect(() => {
    // VERY IMPORTANT:
    // Do absolutely nothing until Firebase authentication
    // has been checked.
    if (!authChecked) {
      return;
    }

    // ------------------------------------------------
    // User is NOT authenticated
    // ------------------------------------------------
    if (!isAuthenticated) {
      console.log("No authenticated user");

      // Stay on OpeningPage.
      // Do NOT redirect to onboarding.
      return;
    }

    // ------------------------------------------------
    // User IS authenticated
    // ------------------------------------------------

    // Wait until verifyLogin has populated the Redux state.
    if (status === "pending") {
      return;
    }

    // If onboarding is incomplete
    if (!isOnboardingComplete) {
      console.log(
        "Authenticated user has incomplete onboarding:",
        onboardPage
      );

      router.replace(`/onboarding/${onboardPage || 1}`);
      return;
    }

    // ------------------------------------------------
    // Onboarding completed
    // ------------------------------------------------

    if (role === "worker") {
      router.replace("/workerDashboard");
    } else if (role === "employer") {
      router.replace("/employerDashboard");
    }
  }, [
    authChecked,
    isAuthenticated,
    status,
    role,
    onboardPage,
    isOnboardingComplete,
    router,
  ]);

  // --------------------------------------------------
  // 3. Loading while authentication is being checked
  // --------------------------------------------------
  if (!authChecked) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen md:h-screen w-screen bg-slate-50">
      {/* User is not authenticated */}
      {!isAuthenticated && (
        <>
          <h1 className="m-3 md:mt-6 text-center text-2xl font-bold md:text-4xl">
            Welcome to Work Now
          </h1>

          <h3 className="text-center text-red-700 font-medium">
            Select Your Role
          </h3>

          <div className="flex flex-col md:flex-row justify-around items-center md:p-10">
            {/* Admin */}
            <div
              className={getCardClass("admin")}
              onClick={() => handleRole("admin")}
            >
              <h1 className="text-center text-black font-semibold pb-1">
                Admin
              </h1>

              <Image
                src="/avatar2.jpg"
                alt="Admin"
                width={250}
                height={250}
                className="w-32 md:w-60 h-auto"
              />
            </div>

            {/* Employer */}
            <div
              className={getCardClass("employer")}
              onClick={() => handleRole("employer")}
            >
              <h1 className="text-center text-black font-semibold pb-1">
                Employer
              </h1>

              <Image
                src="/avatar3.avif"
                alt="Employer"
                width={250}
                height={250}
                className="w-32 md:w-60 h-auto"
              />
            </div>

            {/* Worker */}
            <div
              className={getCardClass("worker")}
              onClick={() => handleRole("worker")}
            >
              <h1 className="text-center text-black font-semibold pb-1">
                Worker
              </h1>

              <Image
                src="/avatar2.jpg"
                alt="Worker"
                width={250}
                height={250}
                className="w-32 md:w-60 h-auto"
              />
            </div>
          </div>
        </>
      )}

      {status === "pending" && <Loading />}
    </div>
  );
};

export default OpeningPage;
