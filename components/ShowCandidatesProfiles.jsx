"use client";
import { fetchUserJobDetails } from "@/components/commonFunctions";
import Loading from "@/components/Loading";
import {
  getMatchStyle,
  JOINING_TYPES,
  SHIFT_TYPES,
} from "@/constants/constant";
import { fetchUserToken } from "@/lib/fetchUserToken";
import {
  BadgeCheck,
  MapPin,
  Wallet,
  Clock,
  X,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import Pagination from "./Pagination";
import Slider from "./Slider";

const ShowCandidatesProfiles = ({ jobId, type }) => {
  const [applicants, setApplicants] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedSkills, setExpandedSkills] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [val, setVal] = useState(20);
  const pageSize = 12;
  const totalPages = Math.ceil(totalCount / pageSize) || 0;

  console.log(applicants, "ALL THE AVALIABLE APPLICANTS");

  // useEffect(() => {
  //   console.log(jobId, "JOB ID CHANGED");
  //   if (!jobId || !type) return;
  //   const url =
  //     type === "applications"
  //       ? `/api/employer/viewjobapplications?jobId=${jobId}&page=1&limit=12`
  //       : `/api/employer/recommendedprofiles?jobId=${jobId}&matching=${val}&page=1&limit=12`;

  //   console.log(url, "URL DATA FOR FETCH WORKERS PROFILES");

  //   const handleApplicantsProfiles = async () => {
  //     try {
  //       const token = await fetchUserToken();
  //       setLoading(true);
  //       const response = await fetch(url, {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       console.log(response, "RESPONSE DATA");
  //       const { data, totalCount, message } = await response.json();

  //       if (!response.ok) {
  //         throw new Error("Failed to fetch applicants");
  //       }

  //       console.log(data, totalCount, message, "TELL ME ABOT APPLICANTS");
  //       setApplicants(data);
  //       setTotalCount(totalCount);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Failed to fetch applicants:", error);
  //     } finally {
  //       setLoading(false);
  //       console.log("USEEFFECT CALLED");
  //     }
  //   };

  //   handleApplicantsProfiles();
  // }, [jobId, val]);

  const fetchApplicants = useCallback(async () => {
    if (!jobId || !type) return;

    const url =
      type === "applications"
        ? `/api/employer/viewjobapplications?jobId=${jobId}&page=${page}&limit=12`
        : `/api/employer/recommendedprofiles?jobId=${jobId}&matching=${val}&page=${page}&limit=12`;

    try {
      const token = await fetchUserToken();
      setLoading(true);
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const { data, totalCount } = await response.json();
      if (!response.ok) throw new Error("Failed to fetch applicants");

      setApplicants(data);
      setTotalCount(totalCount);
    } catch (error) {
      console.error("Failed to fetch applicants:", error);
    } finally {
      setLoading(false);
    }
  }, [jobId, type, val, page]);

  // Normal fetch when params change
  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // Refetch when user comes back to this page
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchApplicants();
    };
    const onPageShow = (e) => {
      if (e.persisted) fetchApplicants(); // restored from bfcache
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [fetchApplicants]);

  const goToPage = (p) => {
    console.log(p, "ANUGRAHA ANUGRAHA");
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const handleSatusUpdates = async ({ status, workerId, jobId }) => {
    try {
      console.log(status, workerId, "CHECK THESE 2 VALUES");
      setLoading(true);
      const { workerId: updatedWorkerId } = await fetchUserJobDetails({
        status,
        workerId,
        jobId,
        type,
      });
      console.log(updatedWorkerId, "STATUS UPDATED");
      setApplicants((prev) =>
        prev.filter((applicant) => applicant.userId !== updatedWorkerId),
      );
      setLoading(false);
    } catch (error) {
      console.log(error, "ERROR DATA");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Applicants</h1>

          <p className="mt-1 text-sm text-gray-500">
            {totalCount} applicant{totalCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="mt-4">
          <Slider value={val} onChange={setVal} />
        </div>

        {/* Applicants */}
        {applicants.length > 0 ? (
          <div className="mt-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {applicants.map((profile) => {
                const isExpanded = expandedSkills === profile?._id;

                const visibleSkills = isExpanded
                  ? profile?.skills
                  : profile?.skills?.slice(0, 3);

                return (
                  <div
                    key={profile?._id}
                    className="rounded-xl relative bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    {" "}
                    {/* Reject */}
                    <button
                      type="button"
                      title="Reject application"
                      className="rounded-full cursor-pointer absolute top-2 right-2 p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      onClick={() =>
                        handleSatusUpdates({
                          status: "rejected",
                          workerId: profile.userId,
                          jobId,
                        })
                      }
                    >
                      <X className="h-5 w-5" />
                    </button>
                    {/* Top Section */}
                    <div className="flex gap-4">
                      {/* Profile Image */}
                      <img
                        src={profile?.profileImage}
                        alt={`${profile?.name}'s profile`}
                        className="h-16 w-16 shrink-0 rounded-full object-cover"
                      />

                      {/* Name + Job */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {/* <div className="flex justify-between"> */}
                            <div className="flex items-center gap-1.5">
                              <h2 className="text-lg font-semibold text-gray-900">
                                {profile?.name}
                              </h2>

                              {profile?.isVerified && (
                                <BadgeCheck
                                  className="h-5 w-5 text-white"
                                  fill="blue"
                                />
                              )}
                            </div>
                            {/* </div> */}
                            <div className="flex">
                              <Mail className="h-4 w-4 mt-1 mx-1 shrink-0 text-gray-400" />
                              <p className="mt-0.5 text-sm text-gray-600">
                                {profile?.email}
                              </p>
                            </div>

                            <div className="flex">
                              <Phone className="h-4 w-4 mt-1 mx-1 shrink-0 text-gray-400" />
                              <p className="mt-0.5 text-sm text-gray-600">
                                {profile?.mobileNumber?.code}-
                                {profile?.mobileNumber?.number}{" "}
                              </p>
                            </div>

                            {/* <p className="mt-0.5 text-sm text-gray-600">
                            {profile?.jobTitle}
                          </p>

                          <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                            {profile?.jobCategory}
                          </span> */}
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                              <p className="mt-0.5 text-sm text-gray-600">
                                {profile?.city}, {profile?.state}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Quick Information */}
                    <div className="mt-3">
                      <p className="mt-0.5 text-sm text-gray-600">
                        {profile?.jobTitle}
                      </p>

                      <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                        {profile?.jobCategory}
                      </span>
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-4">
                      {/* Location */}

                      {/* Salary */}
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 shrink-0 text-gray-400" />
                        <span>
                          ₹{profile?.minSalary} - ₹{profile?.maxSalary}/day
                        </span>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-gray-400" />

                        <span>
                          {
                            JOINING_TYPES.find(
                              (obj) => obj.value === profile?.joiningPeriod,
                            )?.label
                          }
                          {/* {profile?.joiningPeriod === "immediate"
                          ? "Available immediately"
                          : profile?.joiningPeriod} */}
                        </span>
                      </div>

                      {/* Shift */}
                      <div className="flex items-center gap-2 col-span-2 mt-2">
                        <Clock className="h-4 w-4 shrink-0 text-gray-400" />

                        <span>
                          {
                            SHIFT_TYPES.find(
                              (obj) => obj.value === profile?.shiftType,
                            )?.label
                          }
                          {/* {profile?.shiftType === "full_day"
                          ? "Full Day"
                          : profile?.shiftType} */}
                        </span>
                      </div>
                    </div>
                    {/* Skills */}
                    {profile?.skills?.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-2 text-xs font-medium text-gray-500">
                          Skills
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {visibleSkills?.map((skill) => (
                            <span
                              key={skill?._id}
                              className="rounded-full bg-gray-100 px-3 py-2 text-xs text-gray-700"
                            >
                              {skill?.skill}
                            </span>
                          ))}

                          {profile.skills.length > 3 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedSkills(
                                  isExpanded ? null : profile?._id,
                                )
                              }
                              className="rounded-full px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                            >
                              {isExpanded
                                ? "Show less"
                                : `+${profile.skills.length - 3} more`}
                            </button>
                          )}
                        </div>
                        {/* Matching Rate */}

                        <div className="mt-4">
                          {profile?.matchPercentage !== undefined && (
                            <div className="mb-4 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">
                                Profile Match
                              </span>

                              <div
                                className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                                  getMatchStyle(profile.matchPercentage)
                                    .className
                                }`}
                              >
                                {profile.matchPercentage}%{" "}
                                <span className="font-medium">
                                  {getMatchStyle(profile.matchPercentage).text}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Bottom Actions */}
                    {/* <div className="mt-5 flex items-center justify-between border-t pt-4">
                    {profile?.applicationAvailable && (
                      <span>Job Invitation Sent.</span>
                    )}
                    <Link
                      href={`/employerDashboard/viewjobapplication/${profile.userId}?jobId=${jobId}&type=${type}&matching=${profile.matchPercentage}`}
                    >
                      <button
                        type="button"
                        className="rounded-md border flex justify-end cursor-pointer border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-100"
                        onClick={() => {
                          if (!profile?.status) {
                            handleSatusUpdates({
                              status: "viewed",
                              workerId: profile?.userId,
                              jobId,
                            });
                          }
                        }}
                      >
                        View Profile
                      </button>
                    </Link>

                    {profile?.status ? (
                      <button className="bg-blue-600 text-white text-center px-2 py-1 rounded-md">
                        {profile?.status}
                      </button>
                    ) : (
                      <></>
                    )}
                  </div> */}
                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                      {/* View Profile */}
                      {/* <Link
                        href={`/employerDashboard/viewjobapplication/${profile.userId}?jobId=${jobId}&type=${type}&matching=${profile.matchPercentage}&jobInvitation=${profile?.applicationAvailable}`}
                      > */}
                      <Link
                        href={`/employerDashboard/viewjobapplication/${profile.userId}?jobId=${jobId}&type=${type}${
                          type === "recommendation"
                            ? `&matching=${profile.matchPercentage}&jobInvitation=${profile?.applicationAvailable}`
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="rounded-md bg-blue-400 text-white border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-blue-700 cursor-pointer"
                          onClick={() => {
                            if (!profile?.status) {
                              handleSatusUpdates({
                                status: "viewed",
                                workerId: profile?.userId,
                                jobId,
                              });
                            }
                          }}
                        >
                          View Profile
                        </button>
                      </Link>
                      {/* Job Invitation Status */}
                      {profile?.applicationAvailable && (
                        <span className="bg-blue-50 text-blue-700 border-blue-700">
                          Job Invitation Sent.
                        </span>
                      )}

                      {/* Status */}
                      {profile?.status && (
                        <button className="rounded-md bg-blue-600 px-2 py-1 text-center text-white">
                          {profile.status}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-medium text-gray-800">
              No Applications Available
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              There are currently no applicants for this job.
            </p>
          </div>
        )}
      </div>
      <Pagination
        onClick={goToPage}
        totalPages={totalPages}
        page={page}
        totalCount={totalCount}
      />
      <div>{loading && <Loading />}</div>
    </div>
  );
};

export default ShowCandidatesProfiles;

// "use client";
// import { fetchUserJobDetails } from "@/components/commonFunctions";
// import Loading from "@/components/Loading";
// import {
//   getMatchStyle,
//   JOINING_TYPES,
//   SHIFT_TYPES,
// } from "@/constants/constant";
// import { fetchUserToken } from "@/lib/fetchUserToken";
// import { BadgeCheck, MapPin, Wallet, Clock, X, Calendar } from "lucide-react";
// import Link from "next/link";
// import React, { useEffect, useState } from "react";

// const ShowCandidatesProfiles = ({ jobId, type,rate }) => {
//   console.log(jobId, type, "CHECK BOTH");
//   const [applicants, setApplicants] = useState([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [expandedSkills, setExpandedSkills] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);

//   useEffect(() => {
//     if (!jobId || !type) return;
//     console.log(jobId, "CHECK THIS JOBiD");

//     const url =
//       type === "applications"
//         ? `/api/employer/viewjobapplications?jobId=${jobId}&page=1&limit=12`
//         : `/api/employer/recommendedprofiles?jobId=${jobId}&page=1&limit=12`;

//     console.log(url, "URL DATA");

//     const handleApplicantsProfiles = async () => {
//       try {
//         const token = await fetchUserToken();
//         setLoading(true);
//         const response = await fetch(url, {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const { data, totalCount, message } = await response.json();

//         if (!response.ok) {
//           throw new Error("Failed to fetch applicants");
//         }

//         setApplicants(data);
//         setTotalCount(totalCount);
//         setLoading(false);
//       } catch (error) {
//         console.error("Failed to fetch applicants:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     handleApplicantsProfiles();
//   }, [jobId]);

//   const handleSatusUpdates = async ({ status, workerId, jobId }) => {
//     try {
//       setLoading(true);
//       await fetchUserJobDetails({ status, workerId, jobId });
//       setLoading(false);
//     } catch (error) {
//       console.log(error, "ERROR DATA");
//       setLoading(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 md:p-6">
//       <div className="mx-auto max-w-6xl">
//         <div className="mb-6">
//           <h1 className="text-2xl font-semibold text-gray-900">Applicants</h1>
//           <p className="mt-1 text-sm text-gray-500">
//             {totalCount} applicant{totalCount !== 1 ? "s" : ""}
//           </p>
//         </div>

//         {applicants.length > 0 ? (
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//             {applicants.map((profile) => {
//               const isExpanded = expandedSkills === profile?._id;

//               const visibleSkills = isExpanded
//                 ? profile?.skills
//                 : profile?.skills?.slice(0, 3);

//               const hasMatch =
//                 profile?.matchPercentage !== undefined &&
//                 profile?.matchPercentage !== null;

//               // TEMP DIAGNOSTIC — remove once confirmed
//               console.log(
//                 "profile:",
//                 profile?.name,
//                 "matchPercentage:",
//                 profile?.matchPercentage,
//                 "type:",
//                 typeof profile?.matchPercentage,
//               );

//               const viewProfileHref = `/employerDashboard/viewjobapplication/${profile._id}?jobId=${jobId}&type=${type}${
//                 hasMatch ? `&matching=${profile.matchPercentage}` : ""
//               }`;

//               return (
//                 <div
//                   key={profile?._id}
//                   className="rounded-xl relative bg-white p-5 shadow-sm transition hover:shadow-md"
//                 >
//                   {/* Reject */}
//                   <button
//                     type="button"
//                     title="Reject application"
//                     className="rounded-full cursor-pointer absolute top-2 right-2 p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
//                     onClick={() =>
//                       handleSatusUpdates({
//                         status: "rejected",
//                         workerId: profile.userId,
//                         jobId,
//                       })
//                     }
//                   >
//                     <X className="h-5 w-5" />
//                   </button>

//                   {/* Top Section */}
//                   <div className="flex gap-4">
//                     <img
//                       src={profile?.profileImage}
//                       alt={`${profile?.name}'s profile`}
//                       className="h-16 w-16 shrink-0 rounded-full object-cover"
//                     />

//                     <div className="min-w-0 flex-1">
//                       <div className="flex items-start justify-between gap-2">
//                         <div>
//                           <div className="flex items-center gap-1.5">
//                             <h2 className="text-lg font-semibold text-gray-900">
//                               {profile?.name}
//                             </h2>

//                             {profile?.isVerified && (
//                               <BadgeCheck
//                                 className="h-5 w-5 text-white"
//                                 fill="blue"
//                               />
//                             )}
//                           </div>

//                           <p className="mt-0.5 text-sm text-gray-600">
//                             {profile?.jobTitle}
//                           </p>

//                           <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
//                             {profile?.jobCategory}
//                           </span>
//                           <div className="flex items-center gap-2">
//                             <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
//                             <span className="text-gray-400 text-sm">
//                               {profile?.city}, {profile?.state}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Quick Information */}
//                   <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-4">
//                     <div className="flex items-center gap-2">
//                       <Wallet className="h-4 w-4 shrink-0 text-gray-400" />
//                       <span>
//                         ₹{profile?.minSalary} - ₹{profile?.maxSalary}/day
//                       </span>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
//                       <span>
//                         {
//                           JOINING_TYPES.find(
//                             (obj) => obj.value === profile?.joiningPeriod,
//                           )?.label
//                         }
//                       </span>
//                     </div>

//                     <div className="flex items-center gap-2 col-span-2 mt-2">
//                       <Clock className="h-4 w-4 shrink-0 text-gray-400" />
//                       <span>
//                         {
//                           SHIFT_TYPES.find(
//                             (obj) => obj.value === profile?.shiftType,
//                           )?.label
//                         }
//                       </span>
//                     </div>
//                   </div>

//                   {/* Skills */}
//                   {profile?.skills?.length > 0 && (
//                     <div className="mt-5">
//                       <p className="mb-2 text-xs font-medium text-gray-500">
//                         Skills
//                       </p>

//                       <div className="flex flex-wrap gap-2">
//                         {visibleSkills?.map((skill) => (
//                           <span
//                             key={skill?._id}
//                             className="rounded-full bg-gray-100 px-3 py-2 text-xs text-gray-700"
//                           >
//                             {skill?.skill}
//                           </span>
//                         ))}

//                         {profile.skills.length > 3 && (
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setExpandedSkills(
//                                 isExpanded ? null : profile?._id,
//                               )
//                             }
//                             className="rounded-full px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
//                           >
//                             {isExpanded
//                               ? "Show less"
//                               : `+${profile.skills.length - 3} more`}
//                           </button>
//                         )}
//                       </div>

//                       {/* Matching Rate */}
//                       <div className="mt-4">
//                         {hasMatch && (
//                           <div className="mb-4 flex items-center justify-between">
//                             <span className="text-sm font-medium text-gray-600">
//                               Profile Match
//                             </span>

//                             <div
//                               className={`rounded-full border px-3 py-1 text-sm font-semibold ${
//                                 getMatchStyle(profile.matchPercentage).className
//                               }`}
//                             >
//                               {profile.matchPercentage}%{" "}
//                               <span className="font-medium">
//                                 {getMatchStyle(profile.matchPercentage).text}
//                               </span>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}

//                   {/* Bottom Actions */}
//                   <div className="mt-5 flex items-center justify-between border-t pt-4">
//                     <Link href={viewProfileHref}>
//                       <button
//                         type="button"
//                         className="rounded-md border cursor-pointer border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-100"
//                         onClick={() => {
//                           if (!profile?.status) {
//                             handleSatusUpdates({
//                               status: "viewed",
//                               workerId: profile?.userId,
//                               jobId,
//                             });
//                           }
//                         }}
//                       >
//                         View Profile
//                       </button>
//                     </Link>

//                     {profile?.status ? (
//                       <button className="bg-blue-600 text-white text-center px-2 py-1 rounded-md">
//                         {profile?.status}
//                       </button>
//                     ) : (
//                       <></>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <div className="rounded-xl bg-white p-10 text-center shadow-sm">
//             <h2 className="text-lg font-medium text-gray-800">
//               No Applications Available
//             </h2>
//             <p className="mt-1 text-sm text-gray-500">
//               There are currently no applicants for this job.
//             </p>
//           </div>
//         )}
//       </div>
//       <div>{loading && <Loading />}</div>
//     </div>
//   );
// };

// export default ShowCandidatesProfiles;
