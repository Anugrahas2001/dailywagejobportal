// "use client";
// import {
//   fetchAvailableJobs,
//   getJoingDate,
//   getShiftLabel,
// } from "@/components/commonFunctions";
// import useLoading from "@/components/hooks/useLoading";
// import Loading from "@/components/Loading";
// import { fetchUserToken } from "@/lib/fetchUserToken";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";

// const Page = () => {
//   const [jobs, setJobs] = useState([]);
//   const { loading, setLoading } = useLoading();
//   const [count, setCount] = useState({});
//   const router = useRouter();

//   useEffect(() => {
//     const fetch = async () => {
//       try {
//         setLoading(true);
//         const { data, counts } = await fetchAvailableJobs();
//         setJobs(data);
//         setCount(counts);
//         console.log(data, "AVAILABLE JOBS INSIDE HOOK");
//       } catch (error) {
//         console.log(error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetch();
//   }, []);

//   const handleJobDelete = async (id) => {
//     console.log(id, "check the jobId");
//     const token = await fetchUserToken();
//     const response = await fetch(`/api/employer/job/${id}`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     const { jobId } = await response.json();
//     console.log(jobId, "RESULT DATA");

//     setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
//   };

//   const handleJobEdit = (id) => {
//     router.push(`/employerDashboard/dashboard/${id}`);
//   };

//   console.log(jobs, "JOB DATA");
//   const getPostedText = (createdAt) => {
//     const createdDate = new Date(createdAt);
//     const today = new Date();

//     const diffInMs = today - createdDate;
//     const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

//     if (diffInDays === 0) {
//       return "Posted today";
//     }

//     if (diffInDays === 1) {
//       return "Posted 1 day ago";
//     }

//     return `Posted ${diffInDays} days ago`;
//   };
//   console.log(jobs, count, "ALL THE JOBS");

//   return (
//     <main className="min-h-screen bg-gray-100 p-4 md:py-6 md:px-16">
//       {/* Analytics */}
//       <section className="rounded-lg bg-white p-3 md:p-6 shadow">
//         <h1 className="mb-4 text-2xl font-bold">Analytics</h1>

//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
//           <div className="rounded-md bg-gray-100 p-2 md:p-4">
//             <p className="text-sm md:text-lg text-gray-500">Active Jobs</p>
//             <h2 className="text-sm md:text-2xl font-bold">{count?.Active}</h2>
//           </div>

//           <div className="rounded-md bg-gray-100 p-2 md:p-4">
//             <p className="text-sm md:text-lg text-gray-500">Paused Jobs</p>
//             <h2 className="text-sm md:text-2xl font-bold">{count?.Paused}</h2>
//           </div>

//           <div className="rounded-md bg-gray-100 p-2 md:p-4">
//             <p className="text-sm md:text-lg text-gray-500">Completed Jobs</p>
//             <h2 className="text-sm md:text-2xl font-bold">
//               {count?.Completed}
//             </h2>
//           </div>

//           <div className="rounded-md bg-gray-100 p-2 md:p-4">
//             <p className="text-sm md:text-lg text-gray-500">Average Rating</p>
//             <h2 className="text-sm md:text-2xl font-bold">4.5 ★</h2>
//           </div>
//         </div>
//       </section>

//       {/* Create Job */}
//       <section className="my-6">
//         <Link href="/employerDashboard/dashboard">
//           <button className="rounded-md bg-blue-600 cursor-pointer px-2 py-2 md:px-5 md:py-3 md:font-medium text-white hover:bg-blue-700">
//             Create New Job
//           </button>
//         </Link>
//       </section>

//       {/* Available Jobs */}
//       <h2 className="mb-4 text-2xl font-bold">Available Jobs</h2>
//       <section className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
//         {jobs.map((job) => {
//           return (
//             <article
//               className="rounded-lg bg-white p-6 shadow mt-7"
//               key={job._id}
//             >
//               <Link href={`/employerDashboard/jobs/${job._id}`}>
//                 <div className="flex flex-col gap-6">
//                   <div className="flex-1">
//                     <h3 className="text-lg md:text-xl font-semibold">
//                       {job.jobName}
//                     </h3>

//                     <h4 className="mt-1 md:mt-2 text-gray-600">
//                       {job.jobCategory}
//                     </h4>

//                     {/* <p className="mt-1 md:mt-2 text-sm break-words text-gray-600">
//                     {job.jobDescription}
//                   </p> */}

//                     <div className="mt-4 grid gap-1 text-sm text-gray-500">
//                       <p>
//                         📍 {job.city}, {job.state}
//                       </p>
//                       <p>🕘 {getShiftLabel(job.jobShift)}</p>
//                       <p>📅 {getJoingDate(job.availability)}</p>
//                       <p>
//                         💰 ₹{job.minSalary} - ₹{job.maxSalary}
//                       </p>
//                       <p>👥 Openings: {job.numberOfOpenings}</p>
//                     </div>
//                   </div>
//                   <div className="space-y-2 md:min-w-[170px] md:text-right flex flex-row gap-4">
//                     <div className="flex items-center gap-2 md:justify-end">
//                       <span className="h-3 w-3 rounded-full bg-green-500"></span>
//                       <p className="text-sm font-medium text-green-700">
//                         {job.status}
//                       </p>
//                     </div>

//                     <p className="text-sm">
//                       👁️ {job.viewsCount}{" "}
//                       <span className="hidden md:inline">Views</span>
//                     </p>
//                     <p className="text-sm">
//                       🤖 {job.aiMatchesCount}{" "}
//                       <span className="hidden md:inline">AI Matches</span>
//                     </p>
//                     <p className="text-sm">
//                       📄 {job.applicantsCount}{" "}
//                       <span className="hidden md:inline">Applications</span>
//                     </p>
//                   </div>
//                 </div>
//               </Link>
//               {/* Footer */}
//               <div className="mt-6 flex flex-col justify-between border-t pt-4 md:flex-row">
//                 <p className="text-sm text-gray-500">
//                   {" "}
//                   {getPostedText(job.createdAt)}
//                 </p>

//                 <div className="flex gap-2 md:gap-3 mt-2 md:mt-0">
//                   <button className="rounded bg-blue-600 cursor-pointer px-1 py-1 text-sm md:px-3 md:py-2 text-white">
//                     View Applications
//                   </button>

//                   <button
//                     className="rounded bg-yellow-500 cursor-pointer px-2 py-1 text-sm md:px-3 md:py-2 text-white"
//                     onClick={() => handleJobEdit(job._id)}
//                   >
//                     Edit
//                   </button>

//                   <button
//                     className="rounded bg-red-500 cursor-pointer px-2 py-1 text-sm md:px-3 md:py-2 text-white"
//                     onClick={() => {
//                       handleJobDelete(job._id);
//                     }}
//                   >
//                     Delete
//                   </button>

//                   {/* <button className="rounded bg-gray-700 cursor-pointer px-2 py-1 text-sm md:px-3 md:py-2 text-white">
//                     Pause
//                   </button> */}
//                 </div>
//               </div>
//             </article>
//           );
//         })}
//       </section>

//       {loading && <Loading />}
//     </main>
//   );
// };

// export default Page;


import DashboardPage from '@/components/DashboardPage'
import React from 'react'

const page = () => {
  const role="employer";
  return (
     <div>
          <DashboardPage role={role} />
        </div>
  )
}

export default page