// "use client";
// import React, { useEffect, useState } from "react";
// import {
//   Camera,
//   MapPin,
//   Mail,
//   Phone,
//   Pencil,
//   Star,
//   Verified,
// } from "lucide-react";
// import { fetchUserToken } from "@/lib/fetchUserToken";

// const MyProfile = () => {
//   const [profile, setProfile] = useState({});
//   console.log(profile, "PROFILE DATA MY PROFILE");

//   useEffect(() => {
//     const fetchProfileDetails = async () => {
//       try {
//         const token = await fetchUserToken();
//         const response = await fetch("/api/common/profile", {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const { data } = await response.json();
//         setProfile(data);
//       } catch (error) {
//         console.log(error, "ERROR DATA");
//       }
//     };

//     fetchProfileDetails();
//   }, []);

//   return (
//     <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-5xl space-y-5">
//         {/* Profile Header */}
//         <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
//           <div className="flex flex-col items-center text-center">
//             {/* Profile Image */}
//             <div className="relative">
//               <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-4xl font-bold text-white ring-4 ring-indigo-50">
//                 {profile?.user?.profileImage ? (
//                   <img
//                     src={profile.user.profileImage}
//                     alt={
//                       profile.user.name
//                         ? `${profile.user.name}'s profile`
//                         : "Profile"
//                     }
//                   />
//                 ) : (
//                   <span>
//                     {profile?.user?.name?.charAt(0).toUpperCase() || "?"}
//                   </span>
//                 )}
//               </div>

//             </div>
//             {/* Name */}
//             <div className="mt-4 flex items-center gap-2">
//               <h1 className="text-2xl font-bold text-gray-900">Akshay Kumar</h1>
//               <Verified
//                 className="h-5 w-5 fill-blue-500 text-white"
//                 aria-label="Verified profile"
//               />
//             </div>
//             {/* Basic Information */}
//             <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-gray-500">
//               <span className="font-medium text-gray-700">
//                 {profile?.preference?.jobTitle}
//               </span>
//               <span className="hidden sm:inline">•</span>
//               <span className="flex items-center gap-1">
//                 <MapPin className="h-4 w-4" /> {profile?.user?.city},
//                 {profile?.user?.state}
//               </span>
//               <span className="hidden sm:inline">•</span>
//               <span>28 Yrs</span>
//             </div>
//             {/* Rating / Wage */}
//             <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm">
//               <span className="flex items-center gap-1 text-gray-600">
//                 <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
//                 <strong className="text-gray-900">4.8</strong>
//                 <span>(128 jobs)</span>
//               </span>
//               <span className="font-semibold text-green-600">
//                 ₹{profile?.preference?.minSalary}-₹
//                 {profile?.preference?.maxSalary}
//               </span>
//             </div>
//             {/* Change Photo */}
//             <button
//               type="button"
//               className="mt-5 flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
//             >
//               <Camera className="h-4 w-4" /> Change Photo
//             </button>
//           </div>
//         </section>
//         {/* Stats */}
//         <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//           <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
//             <p className="text-2xl font-bold text-gray-900">6 Yrs</p>
//             <p className="mt-1 text-sm text-gray-500"> Experience </p>
//           </div>
//           <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
//             <p className="text-2xl font-bold text-gray-900">128</p>
//             <p className="mt-1 text-sm text-gray-500"> Jobs Done </p>
//           </div>
//           <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
//             <p className="text-2xl font-bold text-gray-900">
//               {profile?.savedJobs}
//             </p>
//             <p className="mt-1 text-sm text-gray-500"> Saved Jobs </p>
//           </div>
//           <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
//             <p className="text-2xl font-bold text-gray-900">
//               {profile?.jobInvitations}
//             </p>
//             <p className="mt-1 text-sm text-gray-500"> Job Invitations </p>
//           </div>
//         </section>
//         {/* Profile Completeness */}
//         <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="font-semibold text-gray-900">
//                 Profile Completeness
//               </h2>
//               <p className="mt-1 text-sm text-gray-500">
//                 Complete your profile to get better job matches.
//               </p>
//             </div>
//             <span className="text-lg font-bold text-indigo-600">
//               {profile?.profileCompleteness}%
//             </span>
//           </div>
//           <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
//             <div
//               className="h-full rounded-full bg-indigo-600"
//               style={{ width: "70%" }}
//             />
//           </div>
//         </section>
//         {/* Skills */}
//         <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-xl font-bold text-gray-900"> Skills </h2>
//               <p className="mt-1 text-sm text-gray-500">
//                 Your professional skills and experience level.
//               </p>
//             </div>
//             <button
//               type="button"
//               className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
//               aria-label="Edit skills"
//             >
//               <Pencil className="h-5 w-5" />
//             </button>
//           </div>
//           <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
//             {profile?.user?.skills.map((skill) => (
//               <div
//                 key={skill.skill}
//                 className="rounded-xl border border-gray-200 bg-gray-50 p-4"
//               >
//                 <p className="font-semibold text-gray-900">{skill.skill}</p>
//                 <span className="mt-2 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
//                   {skill.experience}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </section>
//         {/* Job Preferences */}
//         <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-xl font-bold text-gray-900">
//                 Job Preferences
//               </h2>
//               <p className="mt-1 text-sm text-gray-500">
//                 Your preferred job requirements.
//               </p>
//             </div>
//             <button
//               type="button"
//               className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
//               aria-label="Edit job preferences"
//             >
//               <Pencil className="h-5 w-5" />
//             </button>
//           </div>
//           <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             {/* {profile?.preference.map((item) => {
//               const Icon = item.icon;
//               return ( */}
//             <div className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
//               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
//                 {/* <Icon className="h-4 w-4" /> */}
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500"> Prefered Job Title: </p>
//                 <p className="mt-1 font-semibold capitalize text-gray-900">
//                   {profile?.preference?.jobTitle}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   {" "}
//                   Prefered Job Category:{" "}
//                 </p>
//                 <p className="mt-1 font-semibold capitalize text-gray-900">
//                   {profile?.preference?.jobCategory}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   {" "}
//                   Prefered Location Range:{" "}
//                 </p>
//                 <p className="mt-1 font-semibold capitalize text-gray-900">
//                   {profile?.preference?.locRange}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   {" "}
//                   Prefered Job Joing period:{" "}
//                 </p>
//                 <p className="mt-1 font-semibold capitalize text-gray-900">
//                   {profile?.preference?.joiningPeriod}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   {" "}
//                   Prefered Job Joing ShiftType:{" "}
//                 </p>
//                 <p className="mt-1 font-semibold capitalize text-gray-900">
//                   {profile?.preference?.shiftType}
//                 </p>
//               </div>
//             </div>
//             {/* );
//             })} */}
//           </div>
//         </section>
//         {/* Contact Information */}
//         <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-xl font-bold text-gray-900">
//                 Contact Information
//               </h2>
//               <p className="mt-1 text-sm text-gray-500">
//                 Your registered contact details.
//               </p>
//             </div>
//             <button
//               type="button"
//               className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
//               aria-label="Edit contact information"
//             >
//               <Pencil className="h-5 w-5" />
//             </button>
//           </div>
//           <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
//             <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
//               <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
//                 <Phone className="h-5 w-5" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500"> Mobile Number </p>
//                 <p className="mt-1 font-medium text-gray-900">
//                   +91 71881 818819
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
//               <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
//                 <Mail className="h-5 w-5" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500"> Email </p>
//                 <p className="mt-1 break-all font-medium text-gray-900">
//                   worker@gmail.com
//                 </p>
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// };
// export default MyProfile;

"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  Camera,
  Clock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  SquarePen,
  Star,
  Tag,
  Wallet,
} from "lucide-react";
import { fetchUserToken } from "@/lib/fetchUserToken";

/* ---------- helpers ---------- */

const getAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return age >= 0 ? age : null;
};

const formatINR = (n) =>
  typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : null;

const formatSalary = (min, max) => {
  const a = formatINR(Number(min));
  const b = formatINR(Number(max));
  if (a && b) return `${a} – ${b}`;
  return a || b || null;
};

const progressColor = (pct) =>
  pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-indigo-600" : "bg-amber-500";

/* ---------- small building blocks ---------- */

const Card = ({ children, className = "" }) => (
  <section
    className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
  >
    {children}
  </section>
);

const SectionHeader = ({ title, subtitle, onEdit, editLabel }) => (
  <div className="flex items-start justify-between gap-3">
    <div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
    </div>
    <button
      type="button"
      onClick={onEdit}
      aria-label={editLabel}
      className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
    >
      <Pencil className="h-5 w-5" />
    </button>
  </div>
);

const InfoRow = ({ icon: Icon, label, value, breakAll = false }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`mt-0.5 font-medium text-gray-900 ${breakAll ? "break-all" : ""}`}
      >
        {value || <span className="text-gray-400">Not added</span>}
      </p>
    </div>
  </div>
);

const Stat = ({ value, label }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
    <p className="text-2xl font-bold text-gray-900">{value ?? "–"}</p>
    <p className="mt-1 text-sm text-gray-500">{label}</p>
  </div>
);

const Skeleton = () => (
  <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-5xl animate-pulse space-y-5">
      <div className="h-64 rounded-2xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="h-24 rounded-2xl bg-gray-200" />
      <div className="h-40 rounded-2xl bg-gray-200" />
    </div>
  </main>
);

/* ---------- page ---------- */

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const load = useCallback(async (signal) => {
    setStatus("loading");
    try {
      const token = await fetchUserToken();
      const res = await fetch("/api/common/profile", {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const { data } = await res.json();
      setProfile(data);
      setStatus("ready");
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Profile load failed:", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const user = profile?.user;
  const pref = profile?.preference;

  const preferenceItems = useMemo(
    () => [
      { icon: Briefcase, label: "Job title", value: pref?.jobTitle },
      { icon: Tag, label: "Job category", value: pref?.jobCategory },
      { icon: MapPin, label: "Location range", value: pref?.locRange },
      { icon: Clock, label: "Joining period", value: pref?.joiningPeriod },
      { icon: Clock, label: "Shift type", value: pref?.shiftType },
      {
        icon: Wallet,
        label: "Expected salary",
        value: formatSalary(pref?.minSalary, pref?.maxSalary),
      },
    ],
    [pref],
  );

  if (status === "loading" && !profile) return <Skeleton />;

  if (status === "error" && !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="font-semibold text-gray-900">
            We couldn't load your profile
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => load()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        </div>
      </main>
    );
  }

  const age = getAge(user?.dob);
  const bio = user?.bio;
  const location = [user?.city, user?.state].filter(Boolean).join(", ");
  const salary = formatSalary(pref?.minSalary, pref?.maxSalary);
  const completeness = profile?.profileCompleteness ?? 0;
  const phone = user?.mobileNumber
    ? `${user.mobileNumber.code ?? ""} ${user.mobileNumber.number ?? ""}`.trim()
    : null;
  const skills = user?.skills ?? [];
  const rating = profile?.stats?.rating; // optional – see API notes
  const ratingCount = profile?.stats?.ratingCount;
  const jobsDone = profile?.stats?.jobsDone;
  const missing = profile?.missingFields ?? []; // optional – see API notes

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-4xl font-bold text-white ring-4 ring-indigo-50">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={
                    user.name ? `${user.name}'s profile photo` : "Profile photo"
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <span aria-hidden="true">
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.name || "Your name"}
              </h1>
              {user?.isVerified && (
                <BadgeCheck
                  className="h-6 w-6 fill-blue-500 text-white"
                  aria-label="Verified profile"
                />
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-gray-500">
              {pref?.jobTitle && (
                <span className="font-medium capitalize text-gray-700">
                  {pref.jobTitle}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {location}
                </span>
              )}
              {age !== null && <span>{age} yrs old</span>}
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm">
              {typeof rating === "number" && (
                <span className="flex items-center gap-1 text-gray-600">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <strong className="text-gray-900">{rating.toFixed(1)}</strong>
                  {ratingCount != null && <span>({ratingCount} reviews)</span>}
                </span>
              )}
              {salary && (
                <span className="font-semibold text-green-600">{salary}</span>
              )}
            </div>

            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <Camera className="h-4 w-4" /> Change photo
            </button>
          </div>
        </Card>
        <Card>
          <div className="flex justify-center flex-col gap-4">
            <div className="flex justify-between">
              <h2 className="font-semibold text-gray-900">Bio </h2>
              <SquarePen className="w-5 h-5" />
            </div>
            <span className="">{bio}</span>
          </div>
        </Card>

        {/* Stats */}
        <section
          aria-label="Profile statistics"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <Stat
            value={
              typeof user?.yearsOfExperience === "number"
                ? `${user.yearsOfExperience} yrs`
                : null
            }
            label="Experience"
          />
          <Stat value={jobsDone} label="Jobs done" />
          <Stat value={profile?.savedJobs ?? 0} label="Saved jobs" />
          <Stat value={profile?.jobInvitations ?? 0} label="Job invitations" />
        </section>

        {/* Completeness */}
        {completeness < 100 && (
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Profile completeness
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Complete your profile to get better job matches.
                </p>
              </div>
              <span className="text-lg font-bold text-indigo-600">
                {completeness}%
              </span>
            </div>
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-valuenow={completeness}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completeness"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor(completeness)}`}
                style={{ width: `${completeness}%` }}
              />
            </div>
            {missing.length > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                Still missing:{" "}
                <span className="font-medium">{missing.join(", ")}</span>
              </p>
            )}
          </Card>
        )}

        {/* Skills */}
        <Card>
          <SectionHeader
            title="Skills"
            subtitle="Your professional skills and experience level."
            editLabel="Edit skills"
          />
          {skills.length > 0 ? (
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {skills.map((s) => (
                <li
                  key={s.skill}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="font-semibold text-gray-900">{s.skill}</p>
                  {s.experience && (
                    <span className="mt-2 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                      {s.experience}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              No skills added yet. Add your skills so employers can find you.
            </p>
          )}
        </Card>

        {/* Job preferences */}
        <Card>
          <SectionHeader
            title="Job preferences"
            subtitle="The work you're looking for."
            editLabel="Edit job preferences"
          />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preferenceItems.map((item) => (
              <InfoRow
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </Card>

        {/* Contact */}
        <Card>
          <SectionHeader
            title="Contact information"
            subtitle="Your registered contact details."
            editLabel="Edit contact information"
          />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow icon={Phone} label="Mobile number" value={phone} />
            <InfoRow icon={Mail} label="Email" value={user?.email} breakAll />
          </div>
        </Card>
      </div>
    </main>
  );
};

export default MyProfile;
