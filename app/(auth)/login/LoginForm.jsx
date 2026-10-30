// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   GoogleAuthProvider,
//   signInWithPopup,
//   signOut,
// } from "firebase/auth";
// import { useRouter, useSearchParams } from "next/navigation";
// import { auth } from "@/lib/firebaseClient";
// import Image from "next/image";
// import useLoading from "@/components/hooks/useLoading";
// import Loading from "@/components/Loading";
// import { useDispatch, useSelector } from "react-redux";
// import { login } from "@/lib/features/profiles/userThunk";
// import Error from "@/components/Error";
// import { clearOnboardingError } from "@/lib/features/profiles/userSlice";

// const LoginForm = () => {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const { loading, setLoading } = useLoading();
//   const dispatch = useDispatch();
//   const searchParams = useSearchParams();
//   const role = searchParams.get("role");
//   const onboardPage = useSelector((state) => state.user.onboardPage);
//   const isOnboardingComplete = useSelector(
//     (state) => state.user.isOnboardingCompleted,
//   );
//   const status = useSelector((state) => state.user.status);
//   const userRole = useSelector((state) => state.user.role);
//   const error = useSelector((state) => state.user.error);
//   localStorage.setItem("role", role);

//   const handleLoginForm = async (e) => {
//     e.preventDefault();

//     try {
//       let userCredential;
//       if (loading) return;

//       if (!email.trim()) {
//         alert("Email is required");
//         return;
//       }

//       if (!password.trim()) {
//         alert("Password is required");
//         return;
//       }
//       if (password.length < 6) {
//         alert("Password must be at least 6 characters");
//         return;
//       }
//       setLoading(true);
//       // localStorage.setItem("role", role);
//       if (auth.currentUser) {
//         const token = await auth.currentUser.getIdToken();

//         try {
//           const { data } = await dispatch(login({ token, role })).unwrap();
//           console.log(data, "SECOND PROFILE IMAGE");
//           localStorage.setItem("profileImage", data?.profileImage);
//           return;
//         } catch (error) {
//           // Login failed
//           console.log(error.message || "Login failed:", error);
//         }
//       }

//       try {
//         userCredential = await signInWithEmailAndPassword(
//           auth,
//           email,
//           password,
//         );
//       } catch (error) {
//         // If sign in fails, create the account

//         switch (error.code) {
//           case "auth/invalid-email":
//             alert("Invalid email address");
//             break;

//           case "auth/wrong-password":
//             alert("Incorrect password");
//             break;

//           case "auth/email-already-in-use":
//             alert("Account already exists");
//             break;

//           case "auth/too-many-requests":
//             alert("Too many attempts. Try again later.");
//             break;

//           case "auth/invalid-credential":
//           case "auth/user-not-found":
//             console.log("User not found. Creating account...");
//             userCredential = await createUserWithEmailAndPassword(
//               auth,
//               email,
//               password,
//             );

//             console.log("✅ Account created");
//             break;

//           default:
//             alert(error.message);
//         }
//       }

//       const token = await userCredential.user.getIdToken();
//       console.log(token, userCredential, "CHECK THESE 2 THINGS IN DEPTH");
//       try {
//         const { data } = await dispatch(login({ token, role })).unwrap();
//         console.log(data, "FIRST PROFILE IMAGE");
//         localStorage.setItem("profileImage", data?.profileImage);
//       } catch (error) {
//         // Login failed
//         console.log(error.message || "Login failed:", error);
//       }
//       setEmail("");
//       setPassword("");
//     } catch (error) {
//       console.error(error.code);
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     try {
//       const Provider = new GoogleAuthProvider();
//       const result = await signInWithPopup(auth, Provider);
//       const token = await result.user.getIdToken();
//       await dispatch(login({ token, role })).unwrap();
//       return;
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   useEffect(() => {
//     const handleRedirect = async () => {
//       if (!userRole) return;

//       // User selected the wrong role
//       if (role !== userRole) {
//         await signOut(auth);

//         alert(`You selected the wrong role. Your actual role is: ${userRole}`);

//         localStorage.removeItem("role");
//         localStorage.removeItem("profileImage");
//         router.replace("/");
//         return;
//       }

//       // Onboarding is not completed
//       if (!isOnboardingComplete) {
//         console.log("Redirecting to onboarding:", onboardPage);

//         router.replace(`/onboarding/${onboardPage}`);
//         return;
//       }

//       // Onboarding completed
//       if (isOnboardingComplete) {
//         console.log(userRole, role, "USER ROLE DATA");
//         router.replace(
//           role === "worker" ? "/workerDashboard" : "/employerDashboard",
//         );
//       }
//     };

//     handleRedirect();
//   }, [role, userRole, isOnboardingComplete, onboardPage, router]);

//   return (
//     <div className="h-screen w-screen bg-gray-100">
//       <div className="flex flex-col justify-center items-center w-full px-4">
//         <form
//           onSubmit={handleLoginForm}
//           className="w-full max-w-sm border border-blue-600 rounded-2xl bg-white p-6 shadow-md space-y-4"
//         >
//           <div>
//             <label className="block text-sm font-medium mb-1" htmlFor="email">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               required
//               autoComplete="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="demo@example.com"
//               className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//           </div>

//           <div>
//             <label
//               className="block text-sm font-medium mb-1"
//               htmlFor="password"
//             >
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 required
//                 autoComplete="current-password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//                 className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword((s) => !s)}
//                 className="absolute inset-y-0 right-3 text-sm text-slate-500 hover:text-slate-800"
//               >
//                 {showPassword ? "Hide" : "Show"}
//               </button>
//             </div>
//           </div>

//           <div className="flex justify-center">
//             <button
//               type="submit"
//               disabled={loading}
//               className="bg-blue-700 hover:bg-blue-800 w-36 h-12 rounded-lg cursor-pointer text-white font-semibold disabled:opacity-60"
//             >
//               {loading || status === "pending" ? "Please wait..." : "Login"}
//             </button>
//           </div>
//         </form>

//         <div className="flex items-center gap-3 mt-4 w-full max-w-sm mx-auto">
//           <div className="flex-1 h-px bg-gray-300" />
//           <span className="text-sm font-medium text-slate-500 uppercase">
//             Or
//           </span>
//           <div className="flex-1 h-px bg-gray-300" />
//         </div>
//         <div
//           className="h-12 w-64 mt-4 bg-blue-700 flex border-0 rounded-sm cursor-pointer"
//           onClick={handleGoogleSignIn}
//         >
//           <Image
//             src="/googleIcon.webp"
//             alt="google"
//             width={20}
//             height={20}
//             className="w-10 h-10 bg-white object-none object-center m-1 rounded-full"
//           />
//           <button className="rounded-lg cursor-pointer text-white font-semibold w-64">
//             {status === "pending" ? "Please wait" : "Sign In with Google"}
//           </button>
//         </div>
//       </div>
//       {(status === "pending" || loading) && <Loading />}
//       {error && (
//         <Error error={error} onClick={() => dispatch(clearOnboardingError())} />
//       )}
//     </div>
//   );
// };

// export default LoginForm;

"use client";

import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebaseClient";
import Image from "next/image";
import useLoading from "@/components/hooks/useLoading";
import Loading from "@/components/Loading";
import { useSelector } from "react-redux";
import { login } from "@/lib/features/profiles/userThunk";
import Error from "@/components/Error";
import { clearOnboardingError } from "@/lib/features/profiles/userSlice";
import useControls from "@/components/hooks/useControls";
import LoginSkeleton from "@/components/skeltons/LoginSkeleton";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loading, setLoading } = useLoading();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const onboardPage = useSelector((state) => state.user.onboardPage);
  const isOnboardingComplete = useSelector(
    (state) => state.user.isOnboardingCompleted,
  );
  const status = useSelector((state) => state.user.status);
  const userRole = useSelector((state) => state.user.role);
  const error = useSelector((state) => state.user.error);
  // localStorage.setItem("role", role);

  const {
    page,
    setPage,
    router,
    dispatch,
    runWithPending,
    isPending,
    initialLoading,
    setInitialLoading,
  } = useControls();

  useEffect(() => {
    if (role) {
      localStorage.setItem("role", role);
      setInitialLoading(false);
    }
  }, [role]);

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
      // localStorage.setItem("role", role);
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();

        try {
          const { data } = await dispatch(login({ token, role })).unwrap();
          console.log(data, "SECOND PROFILE IMAGE");
          localStorage.setItem("profileImage", data?.profileImage);
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
        const { data } = await dispatch(login({ token, role })).unwrap();
        console.log(data, "FIRST PROFILE IMAGE");
        localStorage.setItem("profileImage", data?.profileImage);
      } catch (error) {
        // Login failed
        console.log(error.message || "Login failed:", error);
      }
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error.code);
      console.error(error);
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

  if (initialLoading) return <LoginSkeleton />;

  return (
    <div className="h-screen w-screen bg-gray-100">
      <div className="flex flex-col justify-center items-center">
        <form
          onSubmit={handleLoginForm}
          className="w-full max-w-sm border border-blue-600 rounded-2xl bg-white p-6 shadow-md space-y-4"
        >
          <div className="h-64 flex flex-col items-center justify-center p-1">
            {/* <input
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
            /> */}

            <div className="mx-auto w-full max-w-xl space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@example.com"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-16 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-3 my-auto h-fit rounded px-1 text-sm font-medium text-gray-500 transition hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            {/* <button type="submit">Continue</button>
             */}
            <button
              disabled={loading}
              className="bg-blue-700 w-36 mt-4 h-12 rounded-sm cursor-pointer text-white font-semibold"
            >
              {loading || status === "pending" ? "Please wait..." : "Login"}
            </button>
          </div>
        </form>
        <div className="flex items-center gap-3 mt-4 w-full max-w-sm mx-auto">
          <div className="flex-1 h-px bg-gray-300" />{" "}
          <span className="text-sm font-medium text-slate-500 uppercase">
            Or{" "}
          </span>
          <div className="flex-1 h-px bg-gray-300" />{" "}
        </div>
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
            {status === "pending" ? "Please wait" : "Sign In with Google"}
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
