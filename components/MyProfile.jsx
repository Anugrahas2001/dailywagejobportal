// "use client";
// import { SquarePen, Verified } from "lucide-react";
// import React from "react";

// const MyProfile = () => {
//   console.log("My profile pge");
//   return (
//     <div className="m-4">
//       <div className="flex flex-col items-center">
//         <div
//           class="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-5xl font-semibold text-white select-none"
//           id="avatar"
//         >
//           {/* <img
//             id="avatar-img"
//             src="profile.jpg"
//             alt="Profile photo"
//             class="absolute inset-0 h-full w-full object-cover"
//             onerror="this.classList.add('hidden')"
//           /> */}
//           <div class="avatar-initials">AK</div>
//         </div>
//         <div className="flex">
//           <h1>Akshay Kumar</h1>
//           <Verified className="w-5 h-5 text-blue-500" />
//         </div>
//         <div className="flex">
//           <p>Masor (Primary) | </p>
//           <p> Palakkad, Kerala | </p>
//           <p> 28 Yrs</p>
//         </div>
//         <div className="flex">
//           <p>128 jobs completed</p>
//           <p className="font-bold">₹800-1000/day</p>
//         </div>
//         <button className="w-40 h-10 border rounded-md border-gray-600 cursor-pointer">
//           Change photo/Camera
//         </button>
//       </div>
//       <div className="grid grid-cols-4 gap-3 mt-5">
//         <div className="flex flex-col items-center border border-gray-500 p-2 rounded-md">
//           <span className="text-3xl font-bold">128</span>
//           <span>Jobs done</span>
//         </div>
//         <div className="flex flex-col items-center border border-gray-500 p-2 rounded-md">
//           <span className="text-3xl font-bold">6 Yrs</span>
//           <span>Experience</span>
//         </div>
//         <div className="flex flex-col items-center border border-gray-500 p-2 rounded-md">
//           <span className="text-3xl font-bold">28</span>
//           <span>Saved Jobs</span>
//         </div>
//         <div className="flex flex-col items-center border border-gray-500 p-2 rounded-md">
//           <span className="text-3xl font-bold">18</span>
//           <span>Job Invitations</span>
//         </div>
//       </div>
//       <div className="border border-gray-500 p-2 rounded-md flex justify-between items-center mt-3">
//         <span>Profile completeness</span>
//         <span>70%</span>
//       </div>
//       <div className="mt-3">
//         <div className="flex justify-between">
//           <h1 className="text-3xl font-bold">Skills</h1>
//           <SquarePen />
//         </div>

//         <div className="grid grid-cols-4 gap-3 mt-5">
//           <div className="flex flex-col items-center border border-gray-500 p-2 rounded-md">
//             <span className="text-xl font-bold">Construction</span>
//             <span>Beginner</span>
//           </div>
//           <div className="flex flex-col items-center border border-gray-500 p-2 rounded-md">
//             <span className="text-xl font-bold">Painter</span>
//             <span>Intermediate</span>
//           </div>
//           <div className="flex flex-col items-center border border-gray-500 p-2 rounded-md">
//             <span className="text-xl font-bold">Electrician</span>
//             <span>Experienced</span>
//           </div>
//           <div className="flex flex-col items-center border border-gray-500 p-2 rounded-md">
//             <span className="text-xl font-bold">Carpenter</span>
//             <span>Advanced</span>
//           </div>
//         </div>
//       </div>

//       <div>
//         <div className="flex justify-between">
//           <h1>Job Prefrences</h1>
//           <SquarePen />
//         </div>
//         <div>
//           <p>Daily Wage</p>
//           <p>₹800-1000/day</p>
//         </div>
//         <div>
//           <p>Job Type</p>
//           <p>mason</p>
//         </div>
//         <div>
//           <p>Job Category</p>
//           <p>Construction</p>
//         </div>
//         <div>
//           <p>joiningPeriod</p>
//           <p>10 KM</p>
//         </div>
//         <div>
//           <p>shiftType</p>
//           <p>Morning</p>
//         </div>
//         <div>
//           <p>Job Category</p>
//           <p>Construction</p>
//         </div>
//         <div>
//           <p>locRange</p>
//           <p>10</p>
//         </div>
//       </div>

//       <div>
//         <div className="flex justify-between">
//           <h1>Contact Info</h1>
//           <SquarePen />
//         </div>
//         <div>
//           <p>Mobile Number</p>
//           <p>+91-718818188191</p>
//         </div>
//         <div>
//           <p>Email</p>
//           <p>worker@gmail.com</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyProfile;

"use client";
import React, { useEffect, useState } from "react";
import {
  Camera,
  MapPin,
  Mail,
  Phone,
  Pencil,
  Star,
  Verified,
} from "lucide-react";
import { fetchUserToken } from "@/lib/fetchUserToken";
// const skills = [
//   { name: "Construction", level: "Beginner" },
//   { name: "Painter", level: "Intermediate" },
//   { name: "Electrician", level: "Experienced" },
//   { name: "Carpenter", level: "Advanced" },
// ];
// const stats = [
//   { value: "128", label: "Jobs Done" },
//   { value: "6 Yrs", label: "Experience" },
//   { value: "28", label: "Saved Jobs" },
//   { value: "18", label: "Invitations" },
// ];
// const preferences = [
//   { icon: Wallet, label: "Daily Wage", value: "₹800 – ₹1,000 / day" },
//   { icon: BriefcaseBusiness, label: "Job Type", value: "Mason" },
//   { icon: BriefcaseBusiness, label: "Job Category", value: "Construction" },
//   { icon: CalendarDays, label: "Joining Period", value: "Immediate" },
//   { icon: Clock3, label: "Shift Type", value: "Morning" },
//   { icon: MapPin, label: "Preferred Distance", value: "Within 10 KM" },
// ];

const MyProfile = () => {
  const [profile, setProfile] = useState({});
  console.log(profile, "PROFILE DATA MY PROFILE");

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const token=await fetchUserToken();
        const response = await fetch("/api/common/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { data } = await response.json();
        setProfile(data);
      } catch (error) {
        console.log(error, "ERROR DATA");
      }
    };

    fetchProfileDetails();
  }, []);

  return (
    <></>
    // <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    //   {" "}
    //   <div className="mx-auto max-w-5xl space-y-5">
    //     {" "}
    //     {/* Profile Header */}{" "}
    //     <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    //       {" "}
    //       <div className="flex flex-col items-center text-center">
    //         {" "}
    //         {/* Profile Image */}{" "}
    //         <div className="relative">
    //           {" "}
    //           <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-4xl font-bold text-white ring-4 ring-indigo-50">
    //             {" "}
    //             AK{" "}
    //           </div>{" "}
    //           {/* <button
    //             type="button"
    //             className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-900 text-white shadow-md transition hover:bg-gray-700"
    //             aria-label="Change profile photo"
    //           >
    //             {" "}
    //             <Camera className="h-4 w-4" />{" "}
    //           </button>{" "} */}
    //         </div>{" "}
    //         {/* Name */}{" "}
    //         <div className="mt-4 flex items-center gap-2">
    //           {" "}
    //           <h1 className="text-2xl font-bold text-gray-900">
    //             {" "}
    //             Akshay Kumar{" "}
    //           </h1>{" "}
    //           <Verified
    //             className="h-5 w-5 fill-blue-500 text-white"
    //             aria-label="Verified profile"
    //           />{" "}
    //         </div>{" "}
    //         {/* Basic Information */}{" "}
    //         <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-gray-500">
    //           {" "}
    //           <span className="font-medium text-gray-700">Mason</span>{" "}
    //           <span className="hidden sm:inline">•</span>{" "}
    //           <span className="flex items-center gap-1">
    //             {" "}
    //             <MapPin className="h-4 w-4" /> Palakkad, Kerala{" "}
    //           </span>{" "}
    //           <span className="hidden sm:inline">•</span>{" "}
    //           <span>28 Yrs</span>{" "}
    //         </div>{" "}
    //         {/* Rating / Wage */}{" "}
    //         <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm">
    //           {" "}
    //           <span className="flex items-center gap-1 text-gray-600">
    //             {" "}
    //             <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{" "}
    //             <strong className="text-gray-900">4.8</strong>{" "}
    //             <span>(128 jobs)</span>{" "}
    //           </span>{" "}
    //           <span className="font-semibold text-green-600">
    //             {" "}
    //             ₹800 – ₹1,000/day{" "}
    //           </span>{" "}
    //         </div>{" "}
    //         {/* Change Photo */}{" "}
    //         <button
    //           type="button"
    //           className="mt-5 flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
    //         >
    //           {" "}
    //           <Camera className="h-4 w-4" /> Change Photo{" "}
    //         </button>{" "}
    //       </div>{" "}
    //     </section>{" "}
    //     {/* Stats */}{" "}
    //     <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    //       {" "}
    //       {stats.map((stat) => (
    //         <div
    //           key={stat.label}
    //           className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm"
    //         >
    //           {" "}
    //           <p className="text-2xl font-bold text-gray-900">
    //             {" "}
    //             {stat.value}{" "}
    //           </p>{" "}
    //           <p className="mt-1 text-sm text-gray-500"> {stat.label} </p>{" "}
    //         </div>
    //       ))}{" "}
    //     </section>{" "}
    //     {/* Profile Completeness */}{" "}
    //     <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    //       {" "}
    //       <div className="flex items-center justify-between">
    //         {" "}
    //         <div>
    //           {" "}
    //           <h2 className="font-semibold text-gray-900">
    //             {" "}
    //             Profile Completeness{" "}
    //           </h2>{" "}
    //           <p className="mt-1 text-sm text-gray-500">
    //             {" "}
    //             Complete your profile to get better job matches.{" "}
    //           </p>{" "}
    //         </div>{" "}
    //         <span className="text-lg font-bold text-indigo-600">
    //           {" "}
    //           70%{" "}
    //         </span>{" "}
    //       </div>{" "}
    //       <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
    //         {" "}
    //         <div
    //           className="h-full rounded-full bg-indigo-600"
    //           style={{ width: "70%" }}
    //         />{" "}
    //       </div>{" "}
    //     </section>{" "}
    //     {/* Skills */}{" "}
    //     <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    //       {" "}
    //       <div className="flex items-center justify-between">
    //         {" "}
    //         <div>
    //           {" "}
    //           <h2 className="text-xl font-bold text-gray-900"> Skills </h2>{" "}
    //           <p className="mt-1 text-sm text-gray-500">
    //             {" "}
    //             Your professional skills and experience level.{" "}
    //           </p>{" "}
    //         </div>{" "}
    //         <button
    //           type="button"
    //           className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
    //           aria-label="Edit skills"
    //         >
    //           {" "}
    //           <Pencil className="h-5 w-5" />{" "}
    //         </button>{" "}
    //       </div>{" "}
    //       <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    //         {" "}
    //         {skills.map((skill) => (
    //           <div
    //             key={skill.name}
    //             className="rounded-xl border border-gray-200 bg-gray-50 p-4"
    //           >
    //             {" "}
    //             <p className="font-semibold text-gray-900">
    //               {" "}
    //               {skill.name}{" "}
    //             </p>{" "}
    //             <span className="mt-2 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
    //               {" "}
    //               {skill.level}{" "}
    //             </span>{" "}
    //           </div>
    //         ))}{" "}
    //       </div>{" "}
    //     </section>{" "}
    //     {/* Job Preferences */}{" "}
    //     <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    //       {" "}
    //       <div className="flex items-center justify-between">
    //         {" "}
    //         <div>
    //           {" "}
    //           <h2 className="text-xl font-bold text-gray-900">
    //             {" "}
    //             Job Preferences{" "}
    //           </h2>{" "}
    //           <p className="mt-1 text-sm text-gray-500">
    //             {" "}
    //             Your preferred job requirements.{" "}
    //           </p>{" "}
    //         </div>{" "}
    //         <button
    //           type="button"
    //           className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
    //           aria-label="Edit job preferences"
    //         >
    //           {" "}
    //           <Pencil className="h-5 w-5" />{" "}
    //         </button>{" "}
    //       </div>{" "}
    //       <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    //         {" "}
    //         {preferences.map((item) => {
    //           const Icon = item.icon;
    //           return (
    //             <div
    //               key={item.label}
    //               className="flex items-start gap-3 rounded-xl border border-gray-200 p-4"
    //             >
    //               {" "}
    //               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
    //                 {" "}
    //                 <Icon className="h-4 w-4" />{" "}
    //               </div>{" "}
    //               <div>
    //                 {" "}
    //                 <p className="text-sm text-gray-500"> {item.label} </p>{" "}
    //                 <p className="mt-1 font-semibold capitalize text-gray-900">
    //                   {" "}
    //                   {item.value}{" "}
    //                 </p>{" "}
    //               </div>{" "}
    //             </div>
    //           );
    //         })}{" "}
    //       </div>{" "}
    //     </section>{" "}
    //     {/* Contact Information */}{" "}
    //     <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    //       {" "}
    //       <div className="flex items-center justify-between">
    //         {" "}
    //         <div>
    //           {" "}
    //           <h2 className="text-xl font-bold text-gray-900">
    //             {" "}
    //             Contact Information{" "}
    //           </h2>{" "}
    //           <p className="mt-1 text-sm text-gray-500">
    //             {" "}
    //             Your registered contact details.{" "}
    //           </p>{" "}
    //         </div>{" "}
    //         <button
    //           type="button"
    //           className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
    //           aria-label="Edit contact information"
    //         >
    //           {" "}
    //           <Pencil className="h-5 w-5" />{" "}
    //         </button>{" "}
    //       </div>{" "}
    //       <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
    //         {" "}
    //         <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
    //           {" "}
    //           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
    //             {" "}
    //             <Phone className="h-5 w-5" />{" "}
    //           </div>{" "}
    //           <div>
    //             {" "}
    //             <p className="text-sm text-gray-500"> Mobile Number </p>{" "}
    //             <p className="mt-1 font-medium text-gray-900">
    //               {" "}
    //               +91 71881 818819{" "}
    //             </p>{" "}
    //           </div>{" "}
    //         </div>{" "}
    //         <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
    //           {" "}
    //           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
    //             {" "}
    //             <Mail className="h-5 w-5" />{" "}
    //           </div>{" "}
    //           <div>
    //             {" "}
    //             <p className="text-sm text-gray-500"> Email </p>{" "}
    //             <p className="mt-1 break-all font-medium text-gray-900">
    //               {" "}
    //               worker@gmail.com{" "}
    //             </p>{" "}
    //           </div>{" "}
    //         </div>{" "}
    //       </div>{" "}
    //     </section>{" "}
    //   </div>{" "}
    // </main>
  );
};
export default MyProfile;
