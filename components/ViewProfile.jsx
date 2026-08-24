// "use client";
// import { fetchUserToken } from "@/lib/fetchUserToken";
// import { BadgeCheck } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import {
//   formatDOB,
//   calculateAge,
//   getJoiningType,
//   getShiftTypes,
// } from "./commonFunctions";

// const ViewProfile = ({ workerId }) => {
//   console.log(workerId, "USER WORKER ID");

//   const [workerData, setWorkerData] = useState({});
//   const [jobStatus, setJobStatus] = useState("");

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const token = await fetchUserToken();

//       const response = await fetch(
//         `/api/employer/viewjobapplications/${workerId}`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (!response.ok) {
//         console.log(response, "SOMETHING IS HAPPENED");
//       }
//       const { data } = await response.json();
//       setWorkerData(data);
//     };
//     fetchUserData();
//   }, [workerId]);

//   console.log(workerData, "WORKER DATA FETCHED");

//   return (
//     <div className="m-3 bg-gray-400">
//       <div className="flex justify-around ">
//         <img
//           src={workerData?.profileImage}
//           alt="user profile"
//           className="w-30 h-30 rounded-full"
//         />
//         <div>
//           <h1 className="flex gap1">
//             {workerData?.name}{" "}
//             {workerData?.isVerified && (
//               <BadgeCheck className="h-5 w-5 text-white" fill="blue" />
//             )}
//           </h1>
//           <h2>{workerData?.gender}</h2>
//           <h2>{formatDOB(workerData?.dob)}</h2>
//           <h2>{calculateAge(workerData?.dob)}</h2>
//           <h2>
//             {workerData?.mobileNumber?.code}-{workerData?.mobileNumber?.number}
//           </h2>
//           <h2>{workerData?.email}</h2>
//           <h2>
//             {workerData?.city},{workerData?.state}
//           </h2>
//           <h2>{workerData?.jobTitle}</h2>
//           <h3>{workerData?.jobCategory}</h3>
//         </div>
//       </div>
//       <p>Bio</p>
//       <p>{workerData?.bio}</p>
//       <p>
//         Salary: {workerData?.minSalary}-{workerData?.maxSalary}/day
//       </p>
//       <p>{getJoiningType(workerData?.joiningPeriod)}</p>
//       <p>{getShiftTypes(workerData?.shiftType)}</p>
//       {workerData?.skills.map((skill) => {
//         return (
//           <button key={skill?._id}>
//             {skill?.skill}-{skill?.experience}
//           </button>
//         );
//       })}
//       <p>Location Range:{workerData?.locRange}</p>
//       {/* <p>Shift Type: {}</p> */}

//       <select value={jobStatus} onChange={(e) => setJobStatus(e.target.value)}>
//         <option value="shortlisted">Shortlisted</option>
//         <option value="accepted">Accepted</option>
//         <option value="rejected">Rejected</option>
//       </select>
//     </div>
//   );
// };

// export default ViewProfile;

"use client";

import { fetchUserToken } from "@/lib/fetchUserToken";
import {
  BadgeCheck,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  Clock,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  formatDOB,
  calculateAge,
  getJoiningType,
  getShiftTypes,
  fetchUserJobDetails,
} from "./commonFunctions";
import { useRouter } from "next/navigation";
import Loading from "./Loading";

const ViewProfile = ({ workerId, jobId }) => {
  const [workerData, setWorkerData] = useState({});
  const [jobStatus, setJobStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  console.log(workerData,jobStatus, "WORKER DATA AVILABLE");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await fetchUserToken();
        setLoading(true);
        const response = await fetch(
          `/api/employer/viewjobapplications/${workerId}?jobId=${jobId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          console.log(response, "SOMETHING HAPPENED");
          return;
        }

        const { data } = await response.json();

        setWorkerData(data);
        setJobStatus(data?.status || "");
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch worker data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (workerId) {
      fetchUserData();
    }
  }, [workerId]);

  const handleJobApplicationStatus = async (e, { workerId, jobId }) => {
    const status = e.target.value;

    setJobStatus(status);

    console.log("Inside the update FUNCTION");
    console.log("Selected status:", status);

    try {
      console.log(jobId, "JOB ID INSIDE THE UPDATE");
      setLoading(true);
      // const response = await fetch(
      //   `/api/employer/viewjobapplications/${workerData?.userId}`,
      //   {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },
      //     body: JSON.stringify({
      //       status,
      //       jobId,
      //     }),
      //   },
      // );

      // if (!response.ok) {
      //   console.log("Failed to update the status");
      //   return;
      // }

      // const { data } = await response.json();

      // console.log(data, "JOB DATA");

      await fetchUserJobDetails({ workerId, status, jobId });

      router.push(`/employerDashboard/appliedworkers?jobId=${jobId}`);
      setLoading(false);
    } catch (error) {
      console.log(error, "ERROR DATA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* Profile Header */}
        <div className="border-b bg-white p-6 md:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {/* Profile Image */}
            <img
              src={workerData?.profileImage}
              alt="User profile"
              className="h-28 w-28 rounded-full border-4 border-gray-100 object-cover"
            />

            {/* Basic Information */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h1 className="text-2xl font-bold text-gray-900">
                  {workerData?.name}
                </h1>

                {workerData?.isVerified && (
                  <BadgeCheck className="h-5 w-5 text-white" fill="blue" />
                )}
              </div>

              <p className="mt-1 text-lg font-medium text-gray-600">
                {workerData?.jobTitle}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {workerData?.jobCategory}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <section className="border-b p-6 md:p-8">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="mt-1 font-medium text-gray-800">
                {workerData?.gender || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="mt-1 font-medium text-gray-800">
                {formatDOB(workerData?.dob) || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="mt-1 font-medium text-gray-800">
                {calculateAge(workerData?.dob) || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Location</p>
              <div className="mt-1 flex items-center gap-2 font-medium text-gray-800">
                <MapPin className="h-4 w-4 text-gray-500" />
                {workerData?.city}, {workerData?.state}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="border-b p-6 md:p-8">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Contact Information
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              <Phone className="h-5 w-5 text-gray-500" />

              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium text-gray-800">
                  {workerData?.mobileNumber?.code}{" "}
                  {workerData?.mobileNumber?.number}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              <Mail className="h-5 w-5 text-gray-500" />

              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="break-all font-medium text-gray-800">
                  {workerData?.email || "-"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bio */}
        <section className="border-b p-6 md:p-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">About</h2>

          <p className="leading-7 text-gray-600">
            {workerData?.bio || "No bio available."}
          </p>
        </section>

        {/* Job Preferences */}
        <section className="border-b p-6 md:p-8">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Job Preferences
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Briefcase className="h-4 w-4" />
                Salary
              </div>

              <p className="mt-2 font-semibold text-gray-800">
                ₹{workerData?.minSalary} - ₹{workerData?.maxSalary} / day
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                Joining
              </div>

              <p className="mt-2 font-semibold text-gray-800">
                {getJoiningType(workerData?.joiningPeriod) || "-"}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Shift Type</p>

              <p className="mt-2 font-semibold text-gray-800">
                {getShiftTypes(workerData?.shiftType) || "-"}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Location Range</p>

              <p className="mt-2 font-semibold text-gray-800">
                {workerData?.locRange || "-"} km
              </p>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="border-b p-6 md:p-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Skills</h2>

          <div className="flex flex-wrap gap-3">
            {workerData?.skills?.length > 0 ? (
              workerData.skills.map((skill) => (
                <div
                  key={skill?._id}
                  className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm"
                >
                  <span className="font-medium text-gray-800">
                    {skill?.skill}
                  </span>

                  <span className="ml-2 text-gray-500">
                    {skill?.experience}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No skills added.</p>
            )}
          </div>
        </section>

        {/* Application Status */}
        <section className="p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Application Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update the applicant's current status.
              </p>
            </div>

            <select
              value={jobStatus ? jobStatus : workerData?.status}
              onChange={(e) =>
                handleJobApplicationStatus(e, {
                  workerId: workerData?.userId,
                  jobId,
                })
              }
              className={`rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                workerData?.status || jobStatus
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700"
              }`}
            >
              {/* <option>Viewed</option> */}
              <option value="">Select Status</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </section>
      </div>
      <div>{loading && <Loading />}</div>
    </div>
  );
};

export default ViewProfile;
