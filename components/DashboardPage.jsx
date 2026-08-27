//Dashbord.jsx
"use client";
import {
  getJoingDate,
  getPostedText,
  getShiftLabel,
  getStatusColor,
} from "@/components/commonFunctions";
import {
  Bookmark,
  BotMessageSquare,
  FileUser,
  Filter,
  Pause,
  Plus,
  Search,
  SquarePen,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import AnalyticsCard from "./AnalyticsCard";
import Pagination from "./Pagination";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteJob,
  fetchActiveJobs,
  fetchAvilableJobs,
  fetchJobsBasedOnStatus,
  viewJob,
} from "@/lib/features/jobs/jobThunk";
import {
  selectAllJobsForEmployer,
  selectAllJobsForWorker,
} from "@/lib/features/jobs/jobsSelectors";
import { applyToJob } from "@/lib/features/workerJobs/appliedjobs/appliedJobThunk";
import { toggleSavedJobs } from "@/lib/features/workerJobs/savedjobs/savedJobThunk";
import Loading from "./Loading";
import SearchAndFilter from "./SearchAndFilter";

const DashboardPage = ({ role }) => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  // const savedJobs = useSelector((state) => state.saved.savedJobs);
  // console.log(savedJobs, "FROM DAHBOARD");
  const loadingStatus = useSelector((state) => state.jobs.status);

  const pageSize = 12;

  const workJobs = useSelector(selectAllJobsForWorker);
  // console.log(workJobs, "WORKER JOBS");
  const empJobs = useSelector(selectAllJobsForEmployer);
  // console.log(empJobs, "EMP JOBS");
  const jobs = role === "worker" ? workJobs : empJobs;
  // console.log(jobs?.length, role, jobs, "LENGTH OF THE JOBS");
  const totalCount = useSelector((state) => state.jobs.totalCount);
  const count = useSelector((state) => state.jobs.statusCounts);

  const totalPages = Math.ceil(totalCount / pageSize) || 0;
  // console.log(totalCount, totalPages, "COUNT AND PAGES");

  const savedJobs = useSelector((state) => state.saved.savedJobs);

  useEffect(() => {
    if (role === "employer") {
      if (status) {
        // Employer selected a specific status
        dispatch(
          fetchJobsBasedOnStatus({
            page,
            status,
          }),
        );
      } else {
        // Employer wants all jobs
        dispatch(
          fetchAvilableJobs({
            page,
          }),
        );
      }
    }

    if (role === "worker") {
      // Worker should initially fetch Active jobs
      dispatch(
        fetchActiveJobs({
          page,
        }),
      );
    }
  }, [page, status, role, dispatch]);

  const goToPage = (p) => {
    console.log(p, "ANUGRAHA ANUGRAHA");
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const handleToggleSavedJob = async (jobId) => {
    const isSavedValue = savedJobs.some((savedJob) => savedJob._id === jobId);
    console.log(jobId, isSavedValue, "FROM THE SAVED TOGGLE BUTTON");
    await dispatch(
      toggleSavedJobs({
        jobId,
        toggle: isSavedValue,
      }),
    ).unwrap();
    setPage(1);
    await dispatch(fetchActiveJobs({ page: 1 })).unwrap();
  };

  const handleAppliedJob = async (jobId) => {
    console.log(jobId, "JOB ID DATA");
    await dispatch(
      applyToJob({
        jobId,
      }),
    ).unwrap();
    setPage(1);
    await dispatch(fetchActiveJobs({ page: 1 })).unwrap();
  };

  const handleJobEdit = (id) => {
    router.push(`/employerDashboard/dashboard/${id}`);
  };

  const handleJobViews = async (jobId) => {
    if (role === "employer") return;
    dispatch(viewJob({ jobId }));
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:py-6 md:px-16">
      {/* Analytics */}
      {role === "worker" && (
        <section className="w-full m-3">
          {/* <div className="flex items-center bg-white">
            <div
              className="m-1 md:m-2 flex flex-1 px-2 items-center rounded-lg border border-gray-300  focus-within:border-blue-500
                focus-within:ring-2
                focus-within:ring-blue-200"
            >
              <input
                placeholder="Enter here..."
                className="md:px-3 w-full rounded-lg py-2 outline-none"
              />
              <Search className="h-6 w-7 flex justify-end" />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-2 md:px-4 py-2 hover:bg-gray-100">
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
          <div className="flex justify-center items-center gap-2 m-2 md:gap-2">
            <button className="px-1 md:px-3 py-1 rounded-sm text-sm bg-blue-600 text-white">
              Nearby
            </button>
            <button className="px-1 md:px-3 py-1 rounded-sm text-sm bg-blue-600 text-white">
              Avilability
            </button>
            <button className="px-1 md:px-3 py-1 rounded-sm text-sm bg-blue-600 text-white">
              Shift
            </button>
            <button className="px-1 md:px-3 py-1 rounded-sm text-sm bg-blue-600 text-white">
              Salary
            </button>
            <button className="px-1 md:px-3 py-1 rounded-sm text-sm bg-blue-600 text-white">
              Date
            </button>
          </div> */}
          <SearchAndFilter page={page} />
        </section>
      )}

      {role === "employer" && (
        <>
          <section className="rounded-lg bg-white p-3 md:p-6 shadow">
            <div className="flex justify-between items-center">
              {/* <section className="my-6"> */}
              <h1 className="mb-4 text-2xl font-bold">Analytics</h1>
              <Link href="/employerDashboard/dashboard">
                <button className="rounded-md bg-blue-600 outline-none cursor-pointer px-2 py-2 md:px-3 md:py-3 text-sm md:font-medium text-white hover:bg-blue-700">
                  <span className="flex items-center font-semibold gap-2">
                    <Plus className="text-white h-5 w-5" />
                    Create New Job
                  </span>{" "}
                </button>
              </Link>
              {/* </section> */}
            </div>
            <div className="grid grid-cols-1 gap-4 mt-3 sm:grid-cols-5">
              <AnalyticsCard
                dot={getStatusColor("All").dot}
                text={getStatusColor("All").text}
                title="All jobs"
                count={count?.All}
                onClick={() => {
                  setStatus("All");
                  setPage(1);
                }}
              />

              <AnalyticsCard
                dot={getStatusColor("Active").dot}
                text={getStatusColor("Active").text}
                title="Active Jobs"
                count={count?.Active}
                onClick={() => {
                  setStatus("Active");
                  setPage(1);
                }}
              />

              <AnalyticsCard
                dot={getStatusColor("Paused").dot}
                text={getStatusColor("Paused").text}
                title="Paused Jobs"
                count={count?.Paused}
                onClick={() => {
                  setStatus("Paused");
                  setPage(1);
                }}
              />

              <AnalyticsCard
                dot={getStatusColor("Completed").dot}
                text={getStatusColor("Completed").text}
                title="Completed Jobs"
                count={count?.Completed}
                onClick={() => {
                  setStatus("Completed");
                  setPage(1);
                }}
              />

              <div className="rounded-md bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg p-2 md:p-4">
                <p className="text-sm text-gray-500">Average Rating</p>
                <h2 className="text-sm md:text-xl font-bold">4.5 ★</h2>
              </div>
            </div>
          </section>
          {/* Create Job */}
        </>
      )}

      {/* Available Jobs */}
      <h2 className="mt-8 text-2xl font-bold">Available Jobs</h2>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        {loadingStatus === "pending" ? (
          <div className="flex justify-center py-10">
            <Loading />
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => {
            return (
              <article
                className="rounded-lg bg-white p-4 shadow mt-7"
                key={job._id}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row w-full items-center justify-between">
                    <div className="flex flex-col">
                      <h3 className="text-lg md:text-xl font-semibold">
                        {job.jobName}
                      </h3>
                      <h4 className=" text-gray-600">{job.jobCategory}</h4>
                    </div>

                    {role === "worker" && (
                      <button
                        // disabled={loading}
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() => handleToggleSavedJob(job._id)}
                      >
                        <Bookmark
                          fill={
                            savedJobs.some((j) => j._id === job._id)
                              ? "gray"
                              : "none"
                          }
                          className="h-6 w-6 cursor-pointer text-gray-700 stroke-[2]"
                        />
                      </button>
                    )}
                  </div>

                  <div onClick={() => handleJobViews(job._id)}>
                    <Link href={`/${role}Dashboard/jobs/${job._id}`}>
                      <div className="grid gap-1 text-sm text-gray-500 border-t pt-4">
                        <p>
                          📍 {job.city}, {job.state}
                        </p>
                        <p>🕘 {getShiftLabel(job.jobShift)}</p>
                        <p>📅 {getJoingDate(job.availability)}</p>
                        <p>
                          💰 ₹{job.minSalary} - ₹{job.maxSalary}
                        </p>
                        <p>👥 Openings: {job.numberOfOpenings}</p>
                      </div>
                    </Link>
                    <div className="space-y-2 md:min-w-[170px] md:text-right mt-4 flex flex-row justify-between">
                      <div className="flex items-center gap-2 md:justify-end">
                        <span
                          className={`h-3 w-3 rounded-full px-1 py-1 ${getStatusColor(job.status).dot}`}
                        ></span>
                        <p
                          className={`text-sm font-medium ${getStatusColor(job.status).text}`}
                        >
                          {job.status}
                        </p>
                      </div>
                      {role === "employer" ? (
                        <>
                          <div className="flex gap-3">
                            {" "}
                            {/* <span className="flex">
                              <Eye className="h-5 w-5" />
                              {job.viewsCount}
                            </span> */}
                            <div className="group relative inline-block">
                              <button className="flex items-center gap-1 py-2">
                                <BotMessageSquare className="h-5 w-5" />
                                {job.viewsCount}
                              </button>

                              <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                Views
                              </span>
                            </div>
                            <div className="group relative inline-block">
                              <button className="flex items-center gap-1 py-2">
                                <BotMessageSquare className="h-5 w-5" />
                                {job.aiMatchesCount}
                              </button>

                              <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                AI Matched Profiles
                              </span>
                            </div>
                            <Link
                              href={`/employerDashboard/appliedworkers?jobId=${job._id}`}
                            >
                              <div className="group relative inline-block">
                                <button className="flex items-center gap-1 py-2">
                                  <FileUser className="h-5 w-5" />
                                  {job.applicantsCount}
                                </button>

                                <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  Applications
                                </span>
                              </div>
                            </Link>
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className={`flex justify-between border-t pt-4 flex-${role === "worker" ? "row items-center" : "col"}`}
                >
                  {/* md:flex-row */}
                  <p className="text-sm text-gray-500">
                    {" "}
                    {getPostedText({ createdAt: job.createdAt })}
                  </p>

                  <div className="flex gap-2 md:gap-3 md:mt-0">
                    {role === "employer" ? (
                      <>
                        <div className="flex w-full justify-between items-center m-1">
                          <button className="rounded bg-blue-600 cursor-pointer px-1 py-1 text-sm md:px-3 md:py-2 text-white">
                            View Applications
                          </button>
                          <div className="flex gap-2">
                            <div className="group relative inline-block">
                              <button className="flex items-center gap-1 py-2">
                                <SquarePen
                                  className="h-5 w-5 cursor-pointer"
                                  onClick={() => handleJobEdit(job._id)}
                                />
                              </button>

                              <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                Edit
                              </span>
                            </div>

                            <div className="group relative inline-block">
                              <button
                                // disabled={loading}
                                className="flex items-center gap-1 py-2"
                              >
                                <Trash2
                                  className="h-5 w-5 cursor-pointer"
                                  onClick={async () => {
                                    // dispatch(deleteJob({ id: job._id }));
                                    // dispatch(fetchAvilableJobs({ page: 1 }));
                                    try {
                                      await dispatch(
                                        deleteJob({ id: job._id }),
                                      ).unwrap();

                                      await dispatch(
                                        fetchAvilableJobs({ page: 1 }),
                                      ).unwrap();
                                    } catch (error) {
                                      console.log(error);
                                    }
                                  }}
                                />
                              </button>

                              <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                Delete
                              </span>
                            </div>

                            <div className="group relative inline-block">
                              <button className="flex items-center gap-1 py-2">
                                <Pause className="h-5 w-5 cursor-pointer" />
                              </button>

                              <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                Pause
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <button
                        className="rounded bg-blue-600 cursor-pointer px-1 py-1 text-sm md:px-3 md:py-2 text-white"
                        // disabled={loading}
                        onClick={() => {
                          handleAppliedJob({ jobId: job._id });
                        }}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="flex min-h-[70vh] md:col-span-3 w-full items-center justify-center px-4">
            <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              {/* <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                📋
              </div> */}

              <h2 className="text-2xl font-semibold text-gray-900">
                No Jobs Available
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                You haven't created any jobs yet. Create your first job to start
                receiving applications from workers.
              </p>
              <Link href="/employerDashboard/dashboard">
                <button
                  // disabled={loading}
                  className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Create Job
                </button>
              </Link>
            </div>
          </div>
        )}
      </section>

      <Pagination
        onClick={goToPage}
        totalPages={totalPages}
        page={page}
        totalCount={totalCount}
      />
    </main>
  );
};

export default DashboardPage;

// "use client";
// import {
//   fetchAvailableJobs,
//   getJoingDate,
//   getShiftLabel,
// } from "@/components/commonFunctions";
// import useLoading from "@/components/hooks/useLoading";
// import Loading from "@/components/Loading";
// import { fetchUserToken } from "@/lib/fetchUserToken";
// import {
//   Bookmark,
//   BotMessageSquare,
//   Eye,
//   FileUser,
//   Filter,
//   Pause,
//   Plus,
//   Search,
//   SquarePen,
//   Trash2,
// } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import AnalyticsCard from "./AnalyticsCard";

// const DashboardPage = ({ role }) => {
//   const [jobs, setJobs] = useState([]);
//   const { loading, setLoading } = useLoading();
//   const [count, setCount] = useState({});
//   const router = useRouter();

//   console.log(role, "USER ROLE");

//   useEffect(() => {
//     const fetch = async () => {
//       try {
//         setLoading(true);
//         const { data, counts } = await fetchAvailableJobs(role);
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

//   function getStatusColor(status) {
//     switch (status) {
//       case "All":
//         return {
//           dot: "bg-blue-500",
//           text: "text-blue-700",
//         };
//       case "Active":
//         return {
//           dot: "bg-green-500",
//           text: "text-green-700",
//         };

//       case "Paused":
//         return {
//           dot: "bg-yellow-500",
//           text: "text-yellow-700",
//         };

//       case "Completed":
//         return {
//           dot: "bg-gray-500",
//           text: "text-gray-700",
//         };

//       case "Closed":
//         return {
//           dot: "bg-red-500",
//           text: "text-red-700",
//         };

//       default:
//         return {
//           dot: "bg-gray-500",
//           text: "text-gray-700",
//         };
//     }
//   }

//   const handleJobsBasedOnStatus = async (status) => {
//     try {
//       const token = await fetchUserToken();
//       const response = await fetch(`/api/employer/job/count?status=${status}`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const { data } = await response.json();
//       if (!response.ok) {
//         console.log("Failed to fetch the data.");
//       }
//       setJobs(data);
//     } catch (error) {
//       console.log(error, "ERROR DATA");
//     }
//   };

//   const handleJobApplication = async (jobId) => {
//     try {
//       console.log(jobId, "PPLIED JOB ID");
//       const token = await fetchUserToken();
//       setLoading(true);
//       const response = await fetch("/api/worker/jobs", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ jobId }),
//       });
//       console.log(response, "RESPONSE DATAAA");
//       if (!response.ok) {
//         console.log("Failed to fetch the data.");
//       }

//       const result = await response.json();
//       setJobs((prev) => prev.filter((job) => job._id !== jobId));
//     } catch (error) {
//       console.log(error, "ERROR DATA OF JOB APPLICATION");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-gray-100 p-4 md:py-6 md:px-16">
//       {/* Analytics */}
//       {role === "worker" && (
//         <section className="w-full m-3">
//           <div className="flex items-center bg-white">
//             <div
//               className="m-1 md:m-2 flex flex-1 px-2 items-center rounded-lg border border-gray-300  focus-within:border-blue-500
//                 focus-within:ring-2
//                 focus-within:ring-blue-200"
//             >
//               <input
//                 placeholder="Enter here..."
//                 className="md:px-3 w-full rounded-lg py-2 outline-none"
//               />
//               <Search className="h-6 w-7 flex justify-end" />
//             </div>
//             <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-2 md:px-4 py-2 hover:bg-gray-100">
//               <Filter className="h-5 w-5" />
//               <span className="hidden sm:inline">Filter</span>
//             </button>
//           </div>
//           <div className="flex justify-center items-center gap-2 m-2 md:gap-2">
//             <button className="px-1 md:px-3 py-1 rounded-sm text-sm bg-blue-600 text-white">
//               Nearby
//             </button>
//             <button className="px-1 md:px-3 py-1 rounded-sm text-sm bg-blue-600 text-white">
//               1000
//             </button>
//             <button className="px-1 md:px-3 py-1 rounded-sm text-sm bg-blue-600 text-white">
//               Shift
//             </button>
//             <button className="px-1 md:px-3 py-1 rounded-sm text-sm bg-blue-600 text-white">
//               Salary
//             </button>
//             <button className="px-1 md:px-3 py-1 rounded-sm text-sm bg-blue-600 text-white">
//               Date
//             </button>
//           </div>
//         </section>
//       )}

//       {role === "employer" && (
//         <>
//           <section className="rounded-lg bg-white p-3 md:p-6 shadow">
//             <div className="flex justify-between items-center">
//               {/* <section className="my-6"> */}
//               <h1 className="mb-4 text-2xl font-bold">Analytics</h1>
//               <Link href="/employerDashboard/dashboard">
//                 <button className="rounded-md bg-blue-600 outline-none cursor-pointer px-2 py-2 md:px-3 md:py-3 text-sm md:font-medium text-white hover:bg-blue-700">
//                   <span className="flex items-center font-semibold gap-2">
//                     <Plus className="text-white h-5 w-5" />
//                     Create New Job
//                   </span>{" "}
//                 </button>
//               </Link>
//               {/* </section> */}
//             </div>
//             <div className="grid grid-cols-1 gap-4 mt-3 sm:grid-cols-5">
//               <AnalyticsCard
//                 dot={getStatusColor("All").dot}
//                 text={getStatusColor("All").text}
//                 title="All jobs"
//                 count={count?.All}
//                 onClick={() => handleJobsBasedOnStatus("All")}
//               />

//               <AnalyticsCard
//                 dot={getStatusColor("Active").dot}
//                 text={getStatusColor("Active").text}
//                 title="Active Jobs"
//                 count={count?.Active}
//                 onClick={() => handleJobsBasedOnStatus("Active")}
//               />

//               <AnalyticsCard
//                 dot={getStatusColor("Paused").dot}
//                 text={getStatusColor("Paused").text}
//                 title="Paused Jobs"
//                 count={count?.Paused}
//                 onClick={() => handleJobsBasedOnStatus("Paused")}
//               />

//               <AnalyticsCard
//                 dot={getStatusColor("Completed").dot}
//                 text={getStatusColor("Completed").text}
//                 title="Completed Jobs"
//                 count={count?.Completed}
//                 onClick={() => handleJobsBasedOnStatus("Completed")}
//               />

//               <div className="rounded-md bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg p-2 md:p-4">
//                 <p className="text-sm text-gray-500">Average Rating</p>
//                 <h2 className="text-sm md:text-xl font-bold">4.5 ★</h2>
//               </div>
//             </div>
//           </section>
//           {/* Create Job */}
//         </>
//       )}

//       {/* Available Jobs */}
//       <h2 className="mt-8 text-2xl font-bold">Available Jobs</h2>
//       <section className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
//         {jobs.length > 0 ? (
//           jobs.map((job) => {
//             return (
//               <article
//                 className="rounded-lg bg-white p-6 shadow mt-7"
//                 key={job._id}
//               >
//                 <Link href={`/employerDashboard/jobs/${job._id}`}>
//                   <div className="flex flex-col gap-6">
//                     <div className="flex-1">
//                       <h3 className="text-lg md:text-xl font-semibold">
//                         {job.jobName}
//                       </h3>

//                       <h4 className="mt-1 md:mt-2 text-gray-600">
//                         {job.jobCategory}
//                       </h4>

//                       {/* <p className="mt-1 md:mt-2 text-sm break-words text-gray-600">
//                     {job.jobDescription}
//                   </p> */}

//                       <div className="mt-4 grid gap-1 text-sm text-gray-500 border-t pt-4">
//                         <p>
//                           📍 {job.city}, {job.state}
//                         </p>
//                         <p>🕘 {getShiftLabel(job.jobShift)}</p>
//                         <p>📅 {getJoingDate(job.availability)}</p>
//                         <p>
//                           💰 ₹{job.minSalary} - ₹{job.maxSalary}
//                         </p>
//                         <p>👥 Openings: {job.numberOfOpenings}</p>
//                       </div>
//                     </div>
//                     <div className="space-y-2 md:min-w-[170px] md:text-right flex flex-row justify-between">
//                       <div className="flex items-center gap-2 md:justify-end">
//                         <span
//                           className={`h-3 w-3 rounded-full ${getStatusColor(job.status).dot}`}
//                         ></span>
//                         <p
//                           className={`text-sm font-medium ${getStatusColor(job.status).text}`}
//                         >
//                           {job.status}
//                         </p>
//                       </div>
//                       {role === "employer" ? (
//                         <>
//                           <div className="flex gap-3">
//                             {" "}
//                             <span className="flex">
//                               <Eye className="h-5 w-5" />
//                               {job.viewsCount}{" "}
//                             </span>
//                             <span className="flex">
//                               <BotMessageSquare className="h-5 w-5" />
//                               {job.aiMatchesCount}{" "}
//                             </span>
//                             <span className="flex">
//                               <FileUser className="h-5 w-5" />{" "}
//                               {job.applicantsCount}{" "}
//                             </span>
//                           </div>{" "}
//                         </>
//                       ) : (
//                         <button className="p-2 rounded-full hover:bg-gray-100">
//                           <Bookmark className="h-6 w-6 text-gray-700 stroke-[2]" />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </Link>
//                 {/* Footer */}
//                 <div
//                   className={`flex justify-between border-t pt-4 flex-${role === "worker" ? "row items-center" : "col"}`}
//                 >
//                   {/* md:flex-row */}
//                   <p className="text-sm text-gray-500">
//                     {" "}
//                     {getPostedText(job.createdAt)}
//                   </p>

//                   <div className="flex gap-2 md:gap-3 mt-2 md:mt-0">
//                     {role === "employer" ? (
//                       <>
//                         <div className="flex w-full justify-between items-center m-1">
//                           <button className="rounded bg-blue-600 cursor-pointer px-1 py-1 text-sm md:px-3 md:py-2 text-white">
//                             View Applications
//                           </button>
//                           <div className="flex gap-2">
//                             <SquarePen
//                               className="cursor-pointer"
//                               onClick={() => handleJobEdit(job._id)}
//                             />
//                             <Trash2
//                               className="cursor-pointer"
//                               onClick={() => {
//                                 handleJobDelete(job._id);
//                               }}
//                             />
//                             <Pause className="cursor-pointer" />
//                           </div>
//                         </div>

//                         {/* <button
//                         className="rounded bg-yellow-500 cursor-pointer px-2 py-1 text-sm md:px-3 md:py-2 text-white"
//                         onClick={() => handleJobEdit(job._id)}
//                       >
//                         Edit
//                       </button> */}

//                         {/* <button
//                         className="rounded bg-red-500 cursor-pointer px-2 py-1 text-sm md:px-3 md:py-2 text-white"
//                         onClick={() => {
//                           handleJobDelete(job._id);
//                         }}
//                       >
//                         Delete
//                       </button> */}

//                         {/* <button className="rounded bg-gray-700 cursor-pointer px-2 py-1 text-sm md:px-3 md:py-2 text-white">
//                         Pause
//                       </button>{" "} */}
//                       </>
//                     ) : (
//                       <button
//                         className="rounded bg-blue-600 cursor-pointer px-1 py-1 text-sm md:px-3 md:py-2 text-white"
//                         onClick={() => handleJobApplication(job._id)}
//                       >
//                         Apply Now
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </article>
//             );
//           })
//         ) : (
//           <div className="flex min-h-[70vh] md:col-span-3 w-full items-center justify-center px-4">
//             <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
//               {/* <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
//                 📋
//               </div> */}

//               <h2 className="text-2xl font-semibold text-gray-900">
//                 No Jobs Available
//               </h2>

//               <p className="mt-2 text-sm text-gray-500">
//                 You haven't created any jobs yet. Create your first job to start
//                 receiving applications from workers.
//               </p>
//               <Link href="/employerDashboard/dashboard">
//                 <button className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
//                   Create Job
//                 </button>
//               </Link>
//             </div>
//           </div>
//         )}
//       </section>

//       {loading && <Loading />}
//     </main>
//   );
// };

// export default DashboardPage;

//   const handleSavedJobDisplay=(jobId)=>{
//  setClicked(!isClicked);
//  if(isClicked){
//   setJobs((prev) => prev.filter((j) => j._id !== job._id))
//  }
//  setJobs((prev) => prev.filter((j) => j._id !== job._id))

//   }

// const handleJobApplication = async (jobId) => {
//   try {
//     console.log(jobId, "PPLIED JOB ID");
//     const token = await fetchUserToken();
//     setLoading(true);
//     const response = await fetch("/api/worker/jobs", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ jobId }),
//     });
//     console.log(response, "RESPONSE DATAAA");
//     if (!response.ok) {
//       console.log("Failed to fetch the data.");
//     }

//     const result = await response.json();
//     setJobs((prev) => prev.filter((job) => job._id !== jobId)|| []);
//   } catch (error) {
//     console.log(error, "ERROR DATA OF JOB APPLICATION");
//   } finally {
//     setLoading(false);
//   }
// };

// const savedJobs = async (jobId) => {
//   try {
//     const token = await fetchUserToken();
//     setLoading(true);
//     const isSaved = savedJobs.includes(jobId);
//     console.log(isSaved, "IS SAVED DATA");
//     const response = await fetch("/api/worker/savedjobs", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ jobId, isDeleted: !isSaved }),
//     });
//     console.log(response, "RESPONSE DATA");
//     if (!response.ok) {
//       console.log("Failed to create savd data");
//     }
//     setSavedJobs((prev) =>
//       isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId],
//     );
//   } catch (error) {
//     console.log(error, "ERROR DATA");
//   } finally {
//     setLoading(false);
//   }
// };
