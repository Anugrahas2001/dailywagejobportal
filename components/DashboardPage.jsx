//Dashbord.jsx
"use client";
import {
  getJoingDate,
  getPostedText,
  getShiftLabel,
  getStatusColor,
  goToPage,
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
import React, { useEffect, useState } from "react";
import AnalyticsCard from "./AnalyticsCard";
import Pagination from "./Pagination";
import { useSelector } from "react-redux";
import {
  deleteJob,
  fetchActiveJobs,
  fetchAvilableJobs,
  fetchJobsBasedOnStatus,
  updateJob,
  viewJob,
} from "@/lib/features/jobs/jobThunk";
import {
  selectAllJobsForEmployer,
  selectAllJobsForWorker,
} from "@/lib/features/jobs/jobsSelectors";
import { applyToJob } from "@/lib/features/workerJobs/appliedjobs/appliedJobThunk";
import { toggleSavedJobs } from "@/lib/features/workerJobs/savedjobs/savedJobThunk";
import SearchAndFilter from "./SearchAndFilter";
import Error from "./Error";
import { clearJobsError, removeJobById } from "@/lib/features/jobs/jobSlice";
import { clearAppliedJobsError } from "@/lib/features/workerJobs/appliedjobs/appliedJobSlice";
import { clearSavedJobsError } from "@/lib/features/workerJobs/savedjobs/savedJobSlice";
import Slider from "./Slider";
import FcmTokenRegistrar from "./FcmTokenRegistrar";
import JobCardSkeleton from "./skeltons/JobCardSkeleton";
import useControls from "./hooks/useControls";

const DashboardPage = ({ role }) => {
  const [status, setStatus] = useState("");
  const [activeSearch, setSearchActive] = useState(false);
  const [val, setVal] = useState(20);
  const { page, setPage, router, dispatch, runWithPending, isPending } =
    useControls();
  const loadingStatus = useSelector((state) => state.jobs.status);

  const pageSize = 12;

  const workJobs = useSelector(selectAllJobsForWorker);
  const empJobs = useSelector(selectAllJobsForEmployer);

  const searchAndFilterJobs = useSelector((state) => state.searchJobs.jobs);
  const jobs =
    role === "worker"
      ? activeSearch
        ? searchAndFilterJobs
        : workJobs
      : empJobs;

  const jobsError = useSelector((state) => state.jobs.error);
  const appliedError = useSelector((state) => state.applied.error);
  const savedError = useSelector((state) => state.saved.error);

  const error = jobsError || appliedError || savedError;
  const totalCountJobs = useSelector((state) => state.jobs.totalCount);

  const searchTotalCount = useSelector((state) => state.searchJobs.totalCount);
  const totalCount = activeSearch ? searchTotalCount : totalCountJobs;

  const count = useSelector((state) => state.jobs.statusCounts);

  const totalPages = Math.ceil(totalCount / pageSize) || 0;

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
          val,
        }),
      );
    }
  }, [page, status, role, val, dispatch]);

  if (!jobs || loadingStatus === "pending")
    return <JobCardSkeleton role={role} />;

  const handleToggleSavedJob = (jobId) => {
    runWithPending(`save-${jobId}`, async () => {
      const isSavedValue = savedJobs.some((savedJob) => savedJob._id === jobId);
      const { data } = await dispatch(
        toggleSavedJobs({
          jobId,
          toggle: isSavedValue,
        }),
      ).unwrap();

      dispatch(removeJobById(data._id));
      setPage(1);
      await dispatch(fetchActiveJobs({ page: 1 })).unwrap();
    });
  };

  const handleAppliedJob = (jobId) => {
    runWithPending(`applyjob-${jobId}`, async () => {
      await dispatch(applyToJob(jobId)).unwrap();
      setPage(1);
      await dispatch(fetchActiveJobs({ page: 1 })).unwrap();
    });
  };

  const handleJobEdit = (id) => {
    console.log(id, "JOB ID FOR EDIT");
    router.push(`/employerDashboard/dashboard/${id}`);
  };

  const handleJobViews = async (jobId) => {
    if (role === "employer") return;
    dispatch(viewJob({ jobId }));
  };

  const handleDeleteJob = (jobId) => {
    runWithPending(`deletejob-${jobId}`, async (jobId) => {
      try {
        await dispatch(deleteJob({ id: jobId })).unwrap();

        await dispatch(fetchAvilableJobs({ page: 1 })).unwrap();
      } catch (error) {
        console.log(error);
      }
    });
  };

  const handleJobPause=(jobId)=>{
    runWithPending(`pausejob-${jobId}`,async()=>{
      const body={
        status:"Paused"
      }
      await dispatch(updateJob({id:jobId,body})).unwrap();
    })
  }

  return (
    <main className="bg-gray-100 p-4 md:py-6 md:px-16">
      {jobs.length > 0 && (
        <>
          <FcmTokenRegistrar />

          {role === "worker" && (
            <section className="w-full m-3">
              <SearchAndFilter
                page={page}
                onClick={() => setSearchActive((prev) => !prev)}
              />
            </section>
          )}

          {role === "employer" && (
            <section className="rounded-lg bg-white p-3 md:p-6 shadow">
              <div className="flex justify-between items-center">
                <h1 className="mb-4 text-2xl font-bold">Analytics</h1>
                <Link
                  href="/employerDashboard/dashboard"
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-2 py-2 md:px-3 md:py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                  Create New Job
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-3 sm:grid-cols-4">
                {[
                  { key: "All", title: "All jobs" },
                  { key: "Active", title: "Active Jobs" },
                  { key: "Paused", title: "Paused Jobs" },
                  { key: "Completed", title: "Completed Jobs" },
                ].map(({ key, title }) => (
                  <AnalyticsCard
                    key={key}
                    dot={getStatusColor(key).dot}
                    text={getStatusColor(key).text}
                    title={title}
                    count={count?.[key]}
                    onClick={() => {
                      setStatus(key);
                      setPage(1);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {role === "worker" && (
            <>
              <h2 className="mt-8 text-2xl font-bold">Available Jobs</h2>
              <div className="mt-4">
                <Slider value={val} onChange={setVal} />
              </div>
            </>
          )}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
            {jobs.map((job) => {
              const details = (
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
              );
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
                          disabled={isPending(`save-${job._id}`)}
                          aria-busy={isPending(`save-${job._id}`)}
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
                      {role === "worker" ? (
                        <Link href={`/${role}Dashboard/jobs/${job._id}`}>
                          {details}
                        </Link>
                      ) : (
                        details
                      )}

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
                                  <button className="flex items-center gap-1 py-2 cursor-pointer">
                                    <BotMessageSquare className="h-5 w-5" />
                                    {job.aiMatchesCount}
                                  </button>

                                  <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                    Matched Profiles
                                  </span>
                                </Link>
                              </div>
                              <div className="group relative inline-block cursor-pointer">
                                <Link
                                  href={`/employerDashboard/appliedworkers?jobId=${job._id}&type=applications`}
                                >
                                  <button className="flex items-center gap-1 py-2 cursor-pointer">
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
                            <Link href={`/${role}Dashboard/jobs/${job._id}`}>
                              <button className="rounded bg-blue-600 cursor-pointer px-1 py-1 text-sm md:px-3 md:py-2 text-white">
                                View Job
                              </button>
                            </Link>
                            <div className="flex gap-2">
                              <div className="group relative inline-block">
                                <button
                                  className="flex items-center gap-1 py-2"
                                  onClick={() => handleJobEdit(job._id)}
                                >
                                  <SquarePen className="h-5 w-5 cursor-pointer" />
                                </button>

                                <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  Edit
                                </span>
                              </div>

                              <div className="group relative inline-block">
                                <button
                                  disabled={isPending(`deletejob-${job._id}`)}
                                  aria-busy={isPending(`deletejob-${job._id}`)}
                                  className="flex items-center gap-1 py-2"
                                  onClick={() => handleDeleteJob(job._id)}
                                >
                                  <Trash2 className="h-5 w-5 cursor-pointer" />
                                </button>

                                <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  Delete
                                </span>
                              </div>

                              <div className="group relative inline-block">
                                <button className="flex items-center gap-1 py-2"
                                disabled={isPending(`pausejob-${job._id}`)}
                                  aria-busy={isPending(`pausejob-${job._id}`)}
                                 onClick={()=>handleJobPause(job._id)}>
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
                          loading={isPending(`applyjob-${job._id}`)}
                          aria-busy={isPending(`applyjob-${job._id}`)}
                          onClick={() => {
                            handleAppliedJob(job._id);
                          }}
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <Pagination
            onClick={(p) => goToPage({ p, totalPages, setPage })}
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
        </>
      )}
    </main>
  );
};

export default DashboardPage;
