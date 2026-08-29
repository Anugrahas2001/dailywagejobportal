"use client";
import { auth } from "@/lib/firebaseClient";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import useLoading from "./hooks/useLoading";
import { fetchUserToken } from "@/lib/fetchUserToken";
import Loading from "./Loading";
import { BriefcaseBusiness, CircleUserRound } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";

const NavBar = () => {
  const [show, setShow] = useState(false);
  const { loading, setLoading } = useLoading();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [onboardingPage, setOnboardingPage] = useState(1);
  // const [onboardingCompleted, setOnboardingComplete] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const image = localStorage.getItem("profileImage");
    const roleUser = localStorage.getItem("role");
    const onboardPage = localStorage.getItem("onboardPage");
    // const isOnboardingComplete =
    //   localStorage.getItem("isOnboardingCompleted") === "true";
    setProfileImage(image);
    setUserRole(roleUser);
    setOnboardingPage(Number(onboardPage));
    // setOnboardingComplete(isOnboardingComplete);
  }, []);

  const reduxRole = useSelector((state) => state.user.role);
  const reduxOnboardPage = useSelector((state) => state.user.onboardPage);
  const reduxProfileImage = useSelector((state) => state.user.profileImage);

  const role = userRole || reduxRole;
  const onboardPage = onboardingPage || reduxOnboardPage;
  const profileimage = profileImage || reduxProfileImage;

  console.log(userRole, profileImage, onboardingPage, "PROFILE IMAGES DATA");

  const handleLogOut = async () => {
    const token = await fetchUserToken();
    if (token) {
      setLoading(true);
      const data = await fetch("/api/login", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(data, "LOGOUT DATA");
      await signOut(auth);
      localStorage.removeItem("role");
      localStorage.removeItem("profileImage");
      localStorage.clear();
      router.replace("/");
    }
    setLoading(false);
    setShow(false);
  };

  const handlePageData = () => {
    if (role === "worker") {
      router.replace("/workerDashboard");
    } else {
      router.replace("/employerDashboard");
    }
  };

  return (
    <div className="relative mx-4">
      <div className="flex justify-between">
        <button onClick={handlePageData}>
          <img
            src="https://eumbavyknovpbruaexpy.supabase.co/storage/v1/object/public/ImageBucket/1783930795229/1783930795229-8ce74683-ba1a-41fc-a08d-bbb20e3b94ba.png"
            alt="logo"
            width={120}
            height={60}
            className="w-32 md:w-44 h-16 rounded-lg mt-1 mx-2"
          />
        </button>

        <div className="flex items-center">
          {onboardPage >= 4 && role === "worker" && (
            <Link href="/workerDashboard/myjobs">
              <div className="flex cursor-pointer m-4">
                <BriefcaseBusiness />
                <button className="px-2 cursor-pointer">My Jobs</button>
              </div>
            </Link>
          )}

          <button
            onClick={() => {
              setShow(!show);
            }}
          >
            {profileimage ? (
              <img
                src={profileimage}
                alt="Profile"
                width={10}
                height={10}
                className="w-14 h-12 rounded-full object-cover"
              />
            ) : (
              <CircleUserRound className="w-5 h-6 m-2 md:w-12 md:h-12 object-none object-center rounded-full hover:scale-105 cursor-pointer" />
            )}
          </button>
        </div>
      </div>
      {show && (
        <div className="absolute top-full right-0 mt-2 w-24 mr-2 md:w-32 bg-white shadow-lg rounded-lg border z-50">
          <ul>
            <li className="px-4 py-2 hover:bg-red-100">Sign In</li>
            <li className="px-4 py-2 hover:bg-red-200">Profile</li>
            <li className="px-4 py-2 hover:bg-red-300" onClick={handleLogOut}>
              Logout
            </li>
          </ul>
        </div>
      )}
      {loading && <Loading />}
    </div>
  );
};

export default NavBar;
