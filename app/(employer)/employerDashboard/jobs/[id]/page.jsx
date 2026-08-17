// "use client"
// import React from "react";
// import Loading from "@/components/Loading";
// import jobFetchUseEffcetHook from "@/components/hooks/jobFetchUseEffcetHook";

// const JobDetailsPage = () => {
//   const {loading,job}=jobFetchUseEffcetHook();
//   if (loading) {
//     return <Loading />;
//   }

//   if (!job) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <p className="text-gray-500">Job not found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold">{job.jobName}</h1>
//         <p className="text-gray-600 mt-1">{job.jobCategory}</p>
//       </div>

//       {/* Basic Details */}
//       <div className="grid md:grid-cols-2 gap-4 rounded-lg border p-5">
//         <div>
//           <h3 className="font-semibold">Location</h3>
//           <p>
//             {job.city}, {job.state}, {job.country}
//           </p>
//         </div>

//         <div>
//           <h3 className="font-semibold">Shift</h3>
//           <p>{job.jobShift}</p>
//         </div>

//         <div>
//           <h3 className="font-semibold">Salary</h3>
//           <p>
//             ₹{job.minSalary} - ₹{job.maxSalary} ({job.salaryType})
//           </p>
//         </div>

//         <div>
//           <h3 className="font-semibold">Openings</h3>
//           <p>{job.numberOfOpenings}</p>
//         </div>

//         <div>
//           <h3 className="font-semibold">Joining</h3>
//           <p>{job.availability}</p>
//         </div>

//         <div>
//           <h3 className="font-semibold">Gender Preference</h3>
//           <p>{job.genderPreference}</p>
//         </div>
//       </div>

//       {/* Description */}
//       <div>
//         <h2 className="text-xl font-semibold mb-3">
//           Full Job Description
//         </h2>
//         <p className="text-gray-700 leading-7">
//           {job.jobDescription}
//         </p>
//       </div>

//       {/* Skills */}
//       <div>
//         <h2 className="text-xl font-semibold mb-3">
//           Skills Required
//         </h2>

//         <div className="flex flex-wrap gap-3">
//           {job.skillsRequired?.map((skill, index) => (
//             <span
//               key={index}
//               className="rounded-full bg-blue-100 text-blue-700 px-4 py-2 text-sm"
//             >
//               {skill}
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* Responsibilities */}
//       <div>
//         <h2 className="text-xl font-semibold mb-3">
//           Responsibilities
//         </h2>

//         <ul className="list-disc list-inside space-y-2">
//           {job.responsibilities?.map((item, index) => (
//             <li key={index} className="text-gray-700">
//               {item}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default JobDetailsPage;

import JobDetailsPage from "@/components/JobShowDetails";
import React from "react";

const page = () => {
  return <JobDetailsPage role="employer" />;
};

export default page;
