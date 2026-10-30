// "use client";

// import { auth } from "@/lib/firebaseClient";
// import { onAuthStateChanged } from "firebase/auth";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import Loading from "./Loading";
// import { useDispatch, useSelector } from "react-redux";
// import { verifyLogin } from "@/lib/features/profiles/userThunk";

// const OpeningPage = () => {
//   console.log("INSIDE OF THE OPENING PAGE");
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const [isAuthenticated, setIsAuthenticated] = useState(null);
//   const [authChecked, setAuthChecked] = useState(false);

//   console.log(isAuthenticated, "CHECK AUTH AUTH");

//   const role = useSelector((state) => state.user.role);
//   const status = useSelector((state) => state.user.status);

//   const isOnboardingComplete = useSelector(
//     (state) => state.user.isOnboardingCompleted,
//   );
//   const onboardPage = useSelector((state) => state.user.onboardPage);

//   const handleRole = (roleSelected) => {
//     router.replace(`/login?role=${roleSelected}`);
//   };

//   const getCardClass = (cardRole) => {
//     const baseClass =
//       "bg-zinc-50 m-2 p-2 border-2 rounded-xl transform-gpu transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl cursor-pointer";

//     const selectedClass =
//       "border-blue-600 bg-blue-50 ring-4 ring-blue-300 scale-105 shadow-2xl";

//     return `${baseClass} ${
//       role === cardRole ? selectedClass : "border-gray-200"
//     }`;
//   };

//   // --------------------------------------------------
//   // 1. Check Firebase authentication
//   // --------------------------------------------------
//   useEffect(() => {
//     console.log("USE EFFECT IS CALLED 1");
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       try {
//         if (!user) {
//           // setIsAuthenticated(null);
//           setAuthChecked(true);
//           return;
//         }

//         // Firebase user exists
//         setIsAuthenticated(user);

//         const token = await user.getIdToken();

//         // Verify user with backend / Redux
//         await dispatch(verifyLogin({ token })).unwrap();
//       } catch (error) {
//         console.log("Authentication verification failed:", error);

//         setIsAuthenticated(null);
//       } finally {
//         // Firebase + backend authentication check is finished
//         setAuthChecked(true);
//       }
//     });

//     return () => unsubscribe();
//   }, [dispatch]);

//   // --------------------------------------------------
//   // 2. Handle navigation
//   // --------------------------------------------------
//   useEffect(() => {
//     // VERY IMPORTANT:
//     // Do absolutely nothing until Firebase authentication
//     // has been checked.
//     console.log("USE EFFECT IS CALLED 2");
//     if (!authChecked) {
//       return;
//     }

//     // ------------------------------------------------
//     // User is NOT authenticated
//     // ------------------------------------------------
//     if (!isAuthenticated) {
//       console.log("No authenticated user");

//       // Stay on OpeningPage.
//       // Do NOT redirect to onboarding.
//       return;
//     }

//     // ------------------------------------------------
//     // User IS authenticated
//     // ------------------------------------------------

//     // Wait until verifyLogin has populated the Redux state.
//     if (status === "pending") {
//       return;
//     }

//     // If onboarding is incomplete
//     if (!isOnboardingComplete) {
//       console.log("Authenticated user has incomplete onboarding:", onboardPage);

//       router.replace(`/onboarding/${onboardPage || 1}`);
//       return;
//     }

//     console.log(isOnboardingComplete, role, "CHECK BOTH for onboarding");
//     // ------------------------------------------------
//     // Onboarding completed
//     // ------------------------------------------------

//     if (role === "worker") {
//       router.replace("/workerDashboard");
//     } else if (role === "employer") {
//       router.replace("/employerDashboard");
//     }
//   }, [
//     authChecked,
//     isAuthenticated,
//     status,
//     role,
//     onboardPage,
//     isOnboardingComplete,
//     router,
//   ]);

//   // --------------------------------------------------
//   // 3. Loading while authentication is being checked
//   // --------------------------------------------------
//   if (!authChecked) {
//     return <Loading />;
//   }

//   return (
//     <div className="min-h-screen md:h-screen w-screen bg-slate-50">
//       {/* User is not authenticated */}
//       {!isAuthenticated && (
//         <>
//           <h1 className="m-3 md:mt-6 text-center text-2xl font-bold md:text-4xl">
//             Welcome to Work Now
//           </h1>

//           <h3 className="text-center text-red-700 font-medium">
//             Select Your Role
//           </h3>

//           <div className="flex flex-col md:flex-row justify-around items-center md:p-10">

//             {/* Employer */}
//             <div
//               className={getCardClass("employer")}
//               onClick={() => handleRole("employer")}
//             >
//               <h1 className="text-center text-black font-semibold pb-1">
//                 Employer
//               </h1>

//               <Image
//                 src="/avatar3.avif"
//                 alt="Employer"
//                 width={250}
//                 height={250}
//                 className="w-32 md:w-60 h-auto"
//               />
//             </div>

//             {/* Worker */}
//             <div
//               className={getCardClass("worker")}
//               onClick={() => handleRole("worker")}
//             >
//               <h1 className="text-center text-black font-semibold pb-1">
//                 Worker
//               </h1>

//               <Image
//                 src="/avatar2.jpg"
//                 alt="Worker"
//                 width={250}
//                 height={250}
//                 className="w-32 md:w-60 h-auto"
//               />
//             </div>
//           </div>
//         </>
//       )}

//       {status === "pending" && <Loading />}
//     </div>
//   );
// };

// export default OpeningPage;

"use client";

import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import { useDispatch, useSelector } from "react-redux";
import { verifyLogin } from "@/lib/features/profiles/userThunk";
import Button from "./Button";

// Demo credentials, prefilled when a role is selected.
// Replace these with real demo accounts from your Firebase project.
const DEMO_CREDENTIALS = {
  employer: { email: "employer@demo.com", password: "Demo@1234" },
  worker: { email: "worker@demo.com", password: "Demo@1234" },
};

const ROLES = [
  {
    id: "employer",
    title: "Employer",
    description: "Post jobs and hire workers",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="w-10 h-10 md:w-14 md:h-14"
      >
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18" />
      </svg>
    ),
  },
  {
    id: "worker",
    title: "Worker",
    description: "Find jobs and start earning",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="w-10 h-10 md:w-14 md:h-14"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

const OpeningPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const role = useSelector((state) => state.user.role);
  const status = useSelector((state) => state.user.status);
  const isOnboardingComplete = useSelector(
    (state) => state.user.isOnboardingCompleted,
  );
  const onboardPage = useSelector((state) => state.user.onboardPage);

  // --------------------------------------------------
  // 1. Check Firebase authentication
  // --------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setIsAuthenticated(null);
          return;
        }

        setIsAuthenticated(user);
        const token = await user.getIdToken();
        await dispatch(verifyLogin({ token })).unwrap();
      } catch (err) {
        console.log("Authentication verification failed:", err);
        setIsAuthenticated(null);
      } finally {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // --------------------------------------------------
  // 2. Handle navigation
  // --------------------------------------------------
  useEffect(() => {
    if (!authChecked || !isAuthenticated) return;
    if (status === "pending") return;

    if (!isOnboardingComplete) {
      router.replace(`/onboarding/${onboardPage || 1}`);
      return;
    }

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
  // 3. Role selection + login
  // --------------------------------------------------
  const handleSelectRole = (roleId) => {
    if (selectedRole) return; // already chosen
    setSelectedRole(roleId);
    setEmail(DEMO_CREDENTIALS[roleId].email);
    setPassword(DEMO_CREDENTIALS[roleId].password);
    setError("");
  };

  const handleChangeRole = () => {
    setSelectedRole(null);
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setError("");
  };

  const getCardClass = (cardRole) => {
    const base =
      "flex flex-col items-center text-center w-full md:w-72 p-6 rounded-2xl border-2 bg-white transform-gpu transition-all duration-300 ease-in-out";
    const selected =
      "border-blue-600 bg-blue-50 ring-4 ring-blue-300 shadow-2xl text-blue-700";
    const idle =
      "border-gray-200 text-slate-700 cursor-pointer hover:scale-105 hover:shadow-2xl";
    return `${base} ${selectedRole === cardRole ? selected : idle}`;
  };

  // Show both roles first; after selection show only the chosen one
  const visibleRoles = selectedRole
    ? ROLES.filter((r) => r.id === selectedRole)
    : ROLES;

  // --------------------------------------------------
  // 4. Loading while authentication is being checked
  // --------------------------------------------------
  if (!authChecked) {
    return <Loading />;
  }

  // return (
  //   <div className="min-h-screen w-screen bg-slate-50 px-4 py-8">
  //     <div className="ml-auto relative">
  //       <button
  //         type="button"
  //         onClick={handleChangeRole}
  //         className="text-blue-600 hover:underline absolute right-10 text-lg"
  //       >
  //         Change role
  //       </button>
  //     </div>
  //     {!isAuthenticated && (
  //       <div className="max-w-3xl mx-auto">
  //         <h1 className="text-center text-2xl font-bold md:text-4xl">
  //           Welcome to Work Now
  //         </h1>

  //         <h3 className="mt-2 text-center text-red-700 font-medium">
  //           {selectedRole
  //             ? "Enter your details to continue"
  //             : "Select Your Role"}
  //         </h3>

  //         {/* Role cards (only the selected one remains after click) */}
  //         <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-6">
  //           {visibleRoles.map((r) => (
  //             <div
  //               key={r.id}
  //               className={getCardClass(r.id)}
  //               onClick={() => handleSelectRole(r.id)}
  //             >
  //               {r.icon}
  //               <h2 className="mt-3 text-lg font-semibold text-black">
  //                 {r.title}
  //               </h2>
  //               <p className="text-sm text-slate-500">{r.description}</p>
  //             </div>
  //           ))}
  //         </div>

  //         {/* Email + password directly below the selected icon */}
  //         {selectedRole && (
  //           <>
  //             <p className="text-center text-lg text-slate-600 mt-6">
  //               Try the app with these demo credentials
  //             </p>
  //             <p>Email:{`demo${selectedRole}@gmail.com`}</p>
  //             <p>Password:{`Demo${selectedRole}@01`}</p>
  //             <Button
  //               onClick={(selectedRole) =>
  //                 router.replace(`/login?role=${selectedRole}`)
  //               }
  //             >
  //               Login
  //             </Button>
  //           </>
  //         )}
  //       </div>
  //     )}

  //     {status === "pending" && <Loading />}
  //   </div>
  // );
  return (
    <div className="min-h-screen w-screen bg-slate-50 px-4 py-8">
      {!isAuthenticated && (
        <div className="max-w-3xl mx-auto">
          {/* Change role: only visible after a role is chosen */}
          {selectedRole && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleChangeRole}
                className="text-blue-600 hover:underline text-base md:text-lg"
              >
                Change role
              </button>
            </div>
          )}

          <h1 className="text-center text-2xl font-bold md:text-4xl">
            Welcome to Work Now
          </h1>

          <h3 className="mt-2 text-center text-red-700 font-medium">
            {selectedRole
              ? "Enter your details to continue"
              : "Select Your Role"}
          </h3>

          {/* Role cards (only the selected one remains after click) */}
          <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-6">
            {visibleRoles.map((r) => (
              <div
                key={r.id}
                className={getCardClass(r.id)}
                onClick={() => handleSelectRole(r.id)}
              >
                {r.icon}
                <h2 className="mt-3 text-lg font-semibold text-black">
                  {r.title}
                </h2>
                <p className="text-sm text-slate-500">{r.description}</p>
              </div>
            ))}
          </div>

          {/* Demo credentials directly below the selected icon */}
          {selectedRole && (
            <div className="mt-6 w-full max-w-sm mx-auto text-center">
              <p className="text-base text-slate-600">
                Try the app with these demo credentials
              </p>

              <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 text-left text-sm shadow-sm space-y-2">
                <p className="text-slate-700">
                  <span className="font-semibold">Email: </span>
                  {`demo${selectedRole}@gmail.com`}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Password: </span>
                  {`Demo${selectedRole}@01`}
                </p>
              </div>

              <div className="mt-4 flex justify-center">
                <Button
                  onClick={() => router.replace(`/login?role=${selectedRole}`)}
                >
                  Login
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {status === "pending" && <Loading />}
    </div>
  );
};

export default OpeningPage;
