//Myjobs.jsx
"use client";
import {
  getJoiningPeriodType,
  getPostedText,
  getShiftTypes,
  getStatusColor,
} from "@/components/commonFunctions";
import Error from "@/components/Error";
import FilterButtons from "@/components/FilterButtons";
import useControls from "@/components/hooks/useControls";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import MyJobsSkeleton from "@/components/skeltons/MyJobsSkeleton";
import {
  APPLIED_JOB_STATUS,
  appliedSortingOptions,
  savedSortingOptions,
} from "@/constants/constant";
import { clearAppliedJobsError } from "@/lib/features/workerJobs/appliedjobs/appliedJobSlice";
import {
  applyToJob,
  cancelAppliedJobs,
  fetchAppliedJobs,
} from "@/lib/features/workerJobs/appliedjobs/appliedJobThunk";
import {
  fetchJobInvitations,
  updateJobInvitationStatus,
} from "@/lib/features/workerJobs/jobinvitations/jobinvitationThunk";
import { clearSavedJobsError } from "@/lib/features/workerJobs/savedjobs/savedJobSlice";
import {
  fetchSavedJobs,
  toggleSavedJobs,
} from "@/lib/features/workerJobs/savedjobs/savedJobThunk";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const page = () => {
  const [jobType, setJobType] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [status, setStatus] = useState("applied");
  const [sort, setSort] = useState("newest");
  // const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  // const dispatch = useDispatch();

  const {
    page,
    setPage,
    router,
    dispatch,
    runWithPending,
    isPending,
    initialLoading,
    setInitialLoading,
  } = useControls();

  const pageSize = 12;
  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setInitialLoading(false);
  }, []);

  const savedJobs = useSelector((state) => state.saved.savedJobs);
  const savedTotalCount = useSelector((state) => state.saved.totalCount);
  const savedLoadingStatus = useSelector((state) => state.saved.status);

  const appliedJobs = useSelector((state) => state.applied.appliedJobs);
  const appliedTotalCount = useSelector((state) => state.applied.totalCount);
  const appliedLoadingStatus = useSelector((state) => state.applied.status);

  const jobInvitations = useSelector(
    (state) => state.jobinvitations.jobInvitations,
  );
  const jobInvitationTotalCount = useSelector(
    (state) => state.jobinvitations.totalCount,
  );
  const jobInvitationLoadingStatus = useSelector(
    (state) => state.jobinvitations.status,
  );

  // console.log(savedJobs.length, appliedJobs?.length, "ALL SAVED JOBS");
  const jobs =
    jobType === "saved"
      ? savedJobs
      : jobType === "applied"
        ? appliedJobs
        : jobInvitations;

  const totalCount =
    jobType === "saved"
      ? savedTotalCount
      : jobType === "applied"
        ? appliedTotalCount
        : jobInvitationTotalCount;

  const savedError = useSelector((state) => state.saved.error);
  const appliedError = useSelector((state) => state.applied.error);
  const error = savedError || appliedError;

  const loadingStatus =
    jobType === "saved"
      ? savedLoadingStatus
      : jobType === "applied"
        ? appliedLoadingStatus
        : jobInvitationLoadingStatus;

  const totalPages = Math.ceil(totalCount / pageSize);

  const defaultLabel = jobType === "saved" ? "Newest Saved" : "Newest Applied";
  const sortOptions =
    jobType === "saved" ? savedSortingOptions : appliedSortingOptions;

  // const savedStatus = useSelector((state) => state.saved.status);
  // const appliedStatus = useSelector((state) => state.applied.status);

  // const statusLoading = jobType === "saved" ? savedStatus : appliedStatus;

  const handleJobStatus = (jobStatus) => {
    console.log("CLICKED", jobStatus);
    if (jobStatus === "saved") {
      setJobType("saved");
    } else if (jobStatus === "applied") {
      setJobType("applied");
    } else if (jobStatus === "jobInvitation") {
      setJobType("jobInvitation");
    } else {
      setJobType("accepted");
    }
  };

  console.log(jobType, "JOB TYPE DATA");

  const handleToggleSavedJob = (jobId) => {
    const isSavedValue = savedJobs.some((savedJob) => savedJob._id === jobId);
    dispatch(
      toggleSavedJobs({
        jobId,
        toggle: isSavedValue,
      }),
    );
  };

  const handleAppliedJobs = async (jobId) => {
    console.log(jobId, "JOBID DATA");
    await dispatch(applyToJob(jobId)).unwrap();
    setPage(1);
    if (jobType === "saved") {
      console.log("ANUGRAHA 1", jobType);
      await dispatch(fetchSavedJobs({ sort, page })).unwrap();
    } else {
      await dispatch(
        fetchAppliedJobs({
          sort,
          status,
          page: 1,
        }),
      ).unwrap();
    }
  };

  const handleCancelAppliedJob = async (jobId) => {
    await dispatch(cancelAppliedJobs(jobId)).unwrap();
    setPage(1);
    console.log("ANUGRAHA 5", jobType);
    await dispatch(
      fetchAppliedJobs({
        sort,
        status,
        page: 1,
      }),
    ).unwrap();
  };

  const handleJobInvitationStatus = ({ status, jobId, employerId }) => {
    console.log(status, jobId, employerId, "JOB_INVITATION FUNCTION");
    dispatch(updateJobInvitationStatus({ status, jobId, employerId }));
  };

  useEffect(() => {
    if (jobType === "saved") {
      dispatch(fetchSavedJobs({ sort, page }));
    } else if (jobType === "applied") {
      dispatch(fetchAppliedJobs({ sort, status, page }));
    } else if (jobType === "jobInvitation") {
      dispatch(fetchJobInvitations({ status: "sent", page }));
    } else {
      dispatch(fetchJobInvitations({ status: "accepted", page }));
    }
  }, [jobType, sort, status, page]);

  const uniqueJobs = Array.from(
    new Map(jobs.map((job) => [job._id, job])).values(),
  );

  // console.log(uniqueJobs, "UNIQUE UNIQUE");
  return (
    <div className="p-6 m-6 bg-gray-100">
      {/* {statusLoading === "pending" || initialLoading ? (
        <MyJobsSkeleton />
      ) : jobs.length === 0 ? (
        <p>No Jobs Available</p>
      ) : (
        <>
          <div className="flex">
            <button
              onClick={() => {
                handleJobStatus("saved");
              }}
              className={`px-3 py-1 rounded-lg m-2 hover:bg-blue-500 text-white ${jobType === "saved" ? "bg-blue-500" : "bg-gray-400"}`}
            >
              Saved
            </button>
            <button
              onClick={() => {
                handleJobStatus("applied");
              }}
              className={`px-3 py-1 rounded-lg m-2 hover:bg-blue-500 text-white ${jobType === "applied" ? "bg-blue-500" : "bg-gray-400"}`}
            >
              Applied
            </button>

            <button
              // onClick={handleJobInvitations}
              onClick={() => {
                handleJobStatus("jobInvitation");
              }}
              className={`px-3 py-1 rounded-lg m-2 hover:bg-blue-500 text-white ${jobType === "applied" ? "bg-blue-500" : "bg-gray-400"}`}
            >
              Invitations
            </button>
            <button
              // onClick={handleJobInvitations}
              onClick={() => {
                handleJobStatus("accepted");
              }}
              className={`px-3 py-1 rounded-lg m-2 hover:bg-blue-500 text-white ${jobType === "applied" ? "bg-blue-500" : "bg-gray-400"}`}
            >
              Accepted
            </button>
          </div>
          {jobType !== "jobInvitation" && (
            <div className="relative inline-block">
              <div className="flex items-center gap-2 mt-3">
                {jobType === "applied" && (
                  <FilterButtons
                    title="Status"
                    setDropdownStatus={setShowStatusDropdown}
                    dropDown={showStatusDropdown}
                    setValue={setStatus}
                    defaultLabel="Applied"
                    value={status}
                    options={APPLIED_JOB_STATUS}
                    onClick={() => {
                      console.log("ANUGRAHA 7", jobType);
                      dispatch(fetchAppliedJobs({ sort, status, page }));
                    }}
                  />
                )}

                <FilterButtons
                  title="Sort"
                  setDropdownStatus={setShowSortDropdown}
                  dropDown={showSortDropdown}
                  setValue={setSort}
                  value={sort}
                  defaultLabel={defaultLabel}
                  onClick={() => {
                    if (jobType === "applied") {
                      console.log("ANUGRAHA 8", jobType);
                      dispatch(fetchAppliedJobs({ sort, status, page }));
                    } else {
                      console.log("ANUGRAHA 3", jobType);
                      dispatch(fetchSavedJobs({ sort, page }));
                    }
                  }}
                  options={sortOptions}
                />
              </div>
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
            {loadingStatus === "pending" ? (
              <div className="flex justify-center py-10">
                <Loading />
              </div>
            ) : uniqueJobs.length > 0 ? (
              uniqueJobs.map((job) => {
                console.log(job?.applicationStatus, "APPLICATION STATUS");
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

                        {jobType === "saved" && (
                          <button
                            className="p-2 rounded-full hover:bg-gray-100"
                            onClick={() => {
                              handleToggleSavedJob(job._id);
                            }}
                          >
                            <Bookmark
                              fill={
                                jobs.some(
                                  (savedJob) => savedJob._id === job._id,
                                )
                                  ? "gray"
                                  : "none"
                              }
                              className="h-6 w-6 cursor-pointer text-gray-700 stroke-[2]"
                            />
                          </button>
                        )}
                      </div>

                      <Link
                        href={`/${role}Dashboard/jobs/${job._id}?type=${jobType}`}
                      >
                        <div className="grid gap-1 text-sm text-gray-500 border-t pt-4">
                          <p>
                            📍 {job.city}, {job.state}
                          </p>
                          <p>🕘 {getShiftTypes(job.jobShift)}</p>
                          <p>📅 {getJoiningPeriodType(job.availability)}</p>
                          <p>
                            💰 ₹{job.minSalary} - ₹{job.maxSalary}
                          </p>
                          <p>👥 Openings: {job.numberOfOpenings}</p>
                        </div>

                        {jobType !== "jobInvitation" && (
                          <div className="space-y-2 md:min-w-[170px] md:text-right mt-4 flex flex-row justify-between">
                            <div className="flex items-center gap-2 md:justify-end">
                              {jobType === ("saved" || "applied") && (
                                <>
                                  <span
                                    className={`h-3 w-3 rounded-full px-1 py-1 ${getStatusColor(jobType === "saved" ? job.status : job.applicationStatus).dot}`}
                                  ></span>
                                  <p
                                    className={`text-sm font-medium ${getStatusColor(jobType === "saved" ? job.status : job.applicationStatus).text}`}
                                  >
                                    {jobType === "saved"
                                      ? job.status
                                      : job.applicationStatus}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </Link>
                    </div>
                 
                    {jobType !== "jobInvitation" ? (
                      <div
                        className={`flex justify-between border-t pt-4 flex-row items-center`}
                      >
                       
                        {jobType === ("saved" || "applied") && (
                          <p className="text-sm text-gray-500">
                            {" "}
                            {getPostedText({
                              createdAt:
                                jobType === "saved"
                                  ? job.createdAt
                                  : job.appliedAt,
                              jobType,
                            })}
                          </p>
                        )}

                        {(jobType === "saved" || "applied") && (
                          <div className="flex gap-2 md:gap-3 md:mt-0">
                            {jobType === "saved" ? (
                              <button
                                className="rounded bg-blue-600 cursor-pointer px-1 py-1 text-sm md:px-3 md:py-2 text-white"
                                onClick={() => {
                                  handleAppliedJobs({ jobId: job._id });
                                }}
                              >
                                Apply Now
                              </button>
                            ) : (
                              <button
                                className="rounded bg-blue-600 cursor-pointer px-1 py-1 text-sm md:px-3 md:py-2 text-white"
                                onClick={() =>
                                  handleCancelAppliedJob({ jobId: job._id })
                                }
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // jobInviteType === "sent" && (
                      <div className="flex justify-between mt-3">
                        <button
                          className="bg-blue-600 text-white p-2 rounded-sm cursor-pointer"
                          onClick={() => {
                            handleJobInvitationStatus({
                              status: "rejected",
                              jobId: job._id,
                              employerId: job.employerId,
                            });
                          }}
                        >
                          Reject
                        </button>

                        <button
                          className="bg-blue-600 text-white p-2 rounded-sm cursor-pointer"
                          onClick={() => {
                            handleJobInvitationStatus({
                              status: "accepted",
                              jobId: job._id,
                              employerId: job.employerId,
                            });
                          }}
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
             
              <div className="flex min-h-[70vh] md:col-span-3 w-full items-center justify-center px-4">
                <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                  {/* <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                📋
              </div> 

                  <h2 className="text-2xl font-semibold text-gray-900">
                    No Jobs Available
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    You haven't created any jobs yet. Create your first job to
                    start receiving applications from workers.
                  </p>
                  <Link href="/employerDashboard/dashboard">
                    <button className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
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
        </>
      )} */}

      {loadingStatus === "pending" || initialLoading ? (
        <MyJobsSkeleton />
      ) : (
        <>
          {/* Job Type Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Saved", value: "saved" },
              { label: "Applied", value: "applied" },
              { label: "Invitations", value: "jobInvitation" },
              { label: "Accepted", value: "accepted" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleJobStatus(tab.value)}
                aria-pressed={jobType === tab.value}
                className={`m-1 rounded-lg px-3 py-2 text-white transition ${
                  jobType === tab.value
                    ? "bg-blue-600"
                    : "bg-gray-400 hover:bg-blue-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          {jobType !== "jobInvitation" && (
            <div className="relative inline-block">
              <div className="mt-3 flex items-center gap-2">
                {jobType === "applied" && (
                  <FilterButtons
                    title="Status"
                    setDropdownStatus={setShowStatusDropdown}
                    dropDown={showStatusDropdown}
                    setValue={setStatus}
                    defaultLabel="Applied"
                    value={status}
                    options={APPLIED_JOB_STATUS}
                    onClick={() => {
                      dispatch(fetchAppliedJobs({ sort, status, page }));
                    }}
                  />
                )}

                {(jobType === "saved" || jobType === "applied") && (
                  <FilterButtons
                    title="Sort"
                    setDropdownStatus={setShowSortDropdown}
                    dropDown={showSortDropdown}
                    setValue={setSort}
                    value={sort}
                    defaultLabel={defaultLabel}
                    options={sortOptions}
                    onClick={() => {
                      if (jobType === "applied") {
                        dispatch(fetchAppliedJobs({ sort, status, page }));
                      } else if (jobType === "saved") {
                        dispatch(fetchSavedJobs({ sort, page }));
                      }
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Job List */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {uniqueJobs.length > 0 ? (
              uniqueJobs.map((job) => {
                const isSaved = jobType === "saved";
                const isApplied = jobType === "applied";
                const isInvitation = jobType === "jobInvitation";
                const isAccepted = jobType === "accepted";

                const statusValue = isSaved
                  ? job.status
                  : isAccepted
                    ? "Accepted"
                    : job.applicationStatus;

                const statusColors = getStatusColor(statusValue) ?? {
                  dot: "bg-gray-400",
                  text: "text-gray-600",
                };

                return (
                  <article
                    key={job._id}
                    className="mt-7 rounded-lg bg-white p-4 shadow"
                  >
                    {/* Job Header */}
                    <div className="flex flex-col gap-4">
                      <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col">
                          <h3 className="text-lg font-semibold md:text-xl">
                            {job.jobName}
                          </h3>

                          <h4 className="text-gray-600">{job.jobCategory}</h4>
                        </div>

                        {isSaved && (
                          <button
                            type="button"
                            aria-label="Remove saved job"
                            className="rounded-full p-2 hover:bg-gray-100"
                            onClick={() => handleToggleSavedJob(job._id)}
                          >
                            <Bookmark
                              fill="gray"
                              className="h-6 w-6 cursor-pointer text-gray-700"
                              strokeWidth={2}
                            />
                          </button>
                        )}
                      </div>

                      {/* Job Details */}
                      <Link
                        href={`/${role}Dashboard/jobs/${job._id}?type=${jobType}`}
                        className="block border-t pt-4"
                      >
                        <div className="grid gap-2 text-sm text-gray-500">
                          <p>
                            📍 {job.city}, {job.state}
                          </p>

                          <p>🕘 {getShiftTypes(job.jobShift)}</p>

                          <p>📅 {getJoiningPeriodType(job.availability)}</p>

                          <p>
                            💰 ₹{job.minSalary} - ₹{job.maxSalary}
                          </p>

                          <p>👥 Openings: {job.numberOfOpenings}</p>
                        </div>

                        {/* Status */}
                        {!isInvitation && (
                          <div className="mt-4 flex items-center gap-2">
                            <span
                              className={`h-3 w-3 shrink-0 rounded-full ${statusColors.dot}`}
                            />

                            <span
                              className={`text-sm font-medium ${statusColors.text}`}
                            >
                              {statusValue ?? "Pending"}
                            </span>
                          </div>
                        )}
                      </Link>
                    </div>

                    {/* Job Footer */}
                    {isInvitation ? (
                      <div className="mt-4 flex justify-between gap-3 border-t pt-4">
                        <button
                          type="button"
                          className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
                          onClick={() =>
                            handleJobInvitationStatus({
                              status: "rejected",
                              jobId: job._id,
                              employerId: job.employerId,
                            })
                          }
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
                          onClick={() =>
                            handleJobInvitationStatus({
                              status: "accepted",
                              jobId: job._id,
                              employerId: job.employerId,
                            })
                          }
                        >
                          Accept
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                        {/* Posted / Applied Date */}
                        {(isSaved || isApplied) && (
                          <p className="text-sm text-gray-500">
                            {getPostedText({
                              createdAt: isSaved
                                ? job.createdAt
                                : job.appliedAt,
                              jobType,
                            })}
                          </p>
                        )}

                        {/* Job Actions */}
                        {(isSaved || isApplied) && (
                          <div className="flex gap-2">
                            {isSaved ? (
                              <button
                                type="button"
                                className="cursor-pointer rounded bg-blue-600 px-3 py-2 text-sm text-white transition hover:bg-blue-700"
                                onClick={() =>
                                  handleAppliedJobs({
                                    jobId: job._id,
                                  })
                                }
                              >
                                Apply Now
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="cursor-pointer rounded bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700"
                                onClick={() =>
                                  handleCancelAppliedJob({
                                    jobId: job._id,
                                  })
                                }
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              /* Empty State */
              <div className="flex min-h-[40vh] w-full items-center justify-center px-4 md:col-span-3">
                <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                    📋
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900">
                    {jobType === "saved"
                      ? "No Saved Jobs"
                      : jobType === "applied"
                        ? "No Applied Jobs"
                        : jobType === "jobInvitation"
                          ? "No Job Invitations"
                          : "No Accepted Jobs"}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {jobType === "saved"
                      ? "Jobs you save will appear here."
                      : jobType === "applied"
                        ? "Jobs you apply for will appear here."
                        : jobType === "jobInvitation"
                          ? "Invitations from employers will appear here."
                          : "Jobs accepted by employers will appear here."}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Pagination */}
          {loadingStatus !== "pending" && uniqueJobs.length > 0 && (
            <Pagination
              onClick={(p) => goToPage({ p, setPage, totalPages })}
              totalPages={totalPages}
              page={page}
              totalCount={totalCount}
            />
          )}
        </>
      )}

      {error && (
        <Error
          error={error}
          onClick={() => {
            (dispatch(clearSavedJobsError()),
              dispatch(clearAppliedJobsError()));
          }}
        />
      )}
    </div>
  );
};

export default page;
