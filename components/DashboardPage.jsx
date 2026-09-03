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
  Pause,
  Plus,
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
import Error from "./Error";
import { clearJobsError } from "@/lib/features/jobs/jobSlice";
import { clearAppliedJobsError } from "@/lib/features/workerJobs/appliedjobs/appliedJobSlice";
import { clearSavedJobsError } from "@/lib/features/workerJobs/savedjobs/savedJobSlice";
import { fetchUserToken } from "@/lib/fetchUserToken";

const DashboardPage = ({ role }) => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [activeSearch, setSearchActive] = useState(false);
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

  const searchAndFilterJobs = useSelector((state) => state.searchJobs.jobs); // console.log(empJobs, "EMP JOBS");
  const jobs =
    role === "worker"
      ? activeSearch
        ? searchAndFilterJobs
        : workJobs
      : empJobs;

  const jobsError = useSelector((state) => state.jobs.error);
  const appliedError = useSelector((state) => state.applied.error);
  const savedError = useSelector((state) => state.saved.error);

  console.log(jobsError, appliedError, savedError, "JOBS ERROR DATA");

  const error = jobsError || appliedError || savedError;

  console.log(error, "MY DEAR SELF");
  // console.log(jobs?.length, role, jobs, "LENGTH OF THE JOBS");
  const totalCountJobs = useSelector((state) => state.jobs.totalCount);
  const searchTotalCount = useSelector((state) => state.searchJobs.totalCount);

  const totalCount = activeSearch ? searchTotalCount : totalCountJobs;

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
    await dispatch(applyToJob(jobId)).unwrap();
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
          <SearchAndFilter
            page={page}
            onClick={() => setSearchActive((prev) => !prev)}
          />
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
                            <div className="group relative inline-block cursor-pointer">
                              <Link
                                href={`/employerDashboard/recommendedprofiles?jobId=${job._id}&type=recommendation`}
                              >
                                <button className="flex items-center gap-1 py-2">
                                  <BotMessageSquare className="h-5 w-5" />
                                  {job.aiMatchesCount}
                                </button>

                                <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  AI Matched Profiles
                                </span>
                              </Link>
                            </div>
                            <div className="group relative inline-block cursor-pointer">
                              <Link
                                href={`/employerDashboard/appliedworkers?jobId=${job._id}&type=applications`}
                              >
                                <button className="flex items-center gap-1 py-2">
                                  <FileUser className="h-5 w-5" />
                                  {job.applicantsCount}
                                </button>

                                <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  Applications
                                </span>
                              </Link>
                            </div>
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
      {error && (
        <Error
          error={error}
          onClick={() => {
            (dispatch(clearJobsError()),
              dispatch(clearAppliedJobsError()),
              dispatch(clearSavedJobsError()));
          }}
        />
      )}
    </main>
  );
};

export default DashboardPage;
