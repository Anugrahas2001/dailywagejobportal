//Myjobs.jsx
"use client";
import {
  getJoiningPeriodType,
  getPostedText,
  getShiftTypes,
  getStatusColor,
  goToPage,
} from "@/components/commonFunctions";
import Error from "@/components/Error";
import FilterButtons from "@/components/FilterButtons";
import useControls from "@/components/hooks/useControls";
import { useJobActions } from "@/components/hooks/useUserJobAction";
import Pagination from "@/components/Pagination";
import MyJobsSkeleton from "@/components/skeltons/MyJobsSkeleton";
import {
  APPLIED_JOB_STATUS,
  APPLIED_SORT_OPTIONS,
  PAGE_SIZE,
  SAVED_SORTING_OPTIONS,
} from "@/constants/constant";
import { clearAppliedJobsError } from "@/lib/features/workerJobs/appliedjobs/appliedJobSlice";
import {
  applyToJob,
  fetchAppliedJobs,
} from "@/lib/features/workerJobs/appliedjobs/appliedJobThunk";
import { fetchJobInvitations } from "@/lib/features/workerJobs/jobinvitations/jobinvitationThunk";
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
  const [jobType, setJobType] = useState("Saved");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [status, setStatus] = useState("Applied");
  const [sort, setSort] = useState("Newest");
  const [role, setRole] = useState("");

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

  const { handleCancelAppliedJob, handleJobInvitationStatus } = useJobActions();

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

  const jobs =
    jobType === "Saved"
      ? savedJobs
      : jobType === "Applied"
        ? appliedJobs
        : jobInvitations;

  const totalCount =
    jobType === "Saved"
      ? savedTotalCount
      : jobType === "Applied"
        ? appliedTotalCount
        : jobInvitationTotalCount;

  const savedError = useSelector((state) => state.saved.error);
  const appliedError = useSelector((state) => state.applied.error);
  const error = savedError || appliedError;

  const loadingStatus =
    jobType === "Saved"
      ? savedLoadingStatus
      : jobType === "Applied"
        ? appliedLoadingStatus
        : jobInvitationLoadingStatus;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const defaultLabel = jobType === "Saved" ? "NEWEST_SAVED" : "NEWEST_APPLIED";
  const sortOptions =
    jobType === "Saved" ? SAVED_SORTING_OPTIONS : APPLIED_SORT_OPTIONS;

  // const savedStatus = useSelector((state) => state.saved.status);
  // const appliedStatus = useSelector((state) => state.applied.status);

  // const statusLoading = jobType === "saved" ? savedStatus : appliedStatus;

  useEffect(() => {
    if (jobType === "Saved") {
      dispatch(fetchSavedJobs({ sort, page }));
    } else if (jobType === "Applied") {
      dispatch(fetchAppliedJobs({ sort, status, page }));
    } else if (jobType === "JobInvitation") {
      dispatch(fetchJobInvitations({ status: "Sent", page }));
    } else {
      dispatch(fetchJobInvitations({ status: "Accepted", page }));
    }
  }, [jobType, sort, status, page]);

  const handleJobStatus = (jobStatus) => {
    if (jobStatus === "Saved") {
      setJobType("Saved");
    } else if (jobStatus === "Applied") {
      setJobType("Applied");
    } else if (jobStatus === "JobInvitation") {
      setJobType("JobInvitation");
    } else {
      setJobType("Accepted");
    }
  };

  const getMessage = (type) => {
    switch (type) {
      case "Saved":
        return "saved";
      case "Applied":
        return "applied to";
      case "JobInvitation":
        return "received invitations for";
      case "Accepted":
        return "accepted";
      default:
        return "received";
    }
  };

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
    await dispatch(applyToJob(jobId)).unwrap();
    setPage(1);
    if (jobType === "Saved") {
      await dispatch(fetchSavedJobs({ sort, page })).unwrap();
    } else {
      await dispatch(
        fetchAppliedJobs({
          sort,
          status,
          page,
        }),
      ).unwrap();
    }
  };

  //  const handleCancelAppliedJob = async (jobId) => {
  //     await dispatch(cancelAppliedJobs(jobId)).unwrap();
  //     setPage(1);
  //     console.log("ANUGRAHA 5", jobType);
  //     await dispatch(
  //       fetchAppliedJobs({
  //         sort,
  //         status,
  //         page: 1,
  //       }),
  //     ).unwrap();
  //     dispatch(fetchAppliedJobs({ sort, status, page }));
  //   };

  const uniqueJobs = Array.from(
    new Map(jobs.map((job) => [job._id, job])).values(),
  );

  const jobTabs = [
    { label: "Saved", value: "Saved" },
    { label: "Applied", value: "Applied" },
    { label: "Invitations", value: "JobInvitation" },
    { label: "Accepted", value: "Accepted" },
  ];

  return (
    <div className="p-6 bg-gray-100">
      {loadingStatus === "pending" || initialLoading ? (
        <MyJobsSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:flex md:justify-center md:gap-3">
            {jobTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleJobStatus(tab.value)}
                className={`px-3 py-2 md:px-6 md:py-2.5 text-sm md:text-base font-medium rounded-lg transition-colors duration-150 ${
                  jobType === tab.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {jobType !== "JobInvitation" && jobType !== "Accepted" && (
            <div className="relative inline-block">
              {/* <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center md:gap-3 md:justify-start">
                {jobType === "Applied" && (
                  <FilterButtons
                    title="Status"
                    setDropdownStatus={setShowStatusDropdown}
                    dropDown={showStatusDropdown}
                    value={status}
                    setValue={setStatus}
                    defaultLabel="APPLIED"
                    // statusVal="Applied"
                    // value="Applied"
                    options={APPLIED_JOB_STATUS}
                    onClick={() => {
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
                    if (jobType === "Applied") {
                      dispatch(fetchAppliedJobs({ sort, status, page }));
                    } else {
                      dispatch(fetchSavedJobs({ sort, page }));
                    }
                  }}
                  options={sortOptions}
                />
              </div> */}
              <div className="mt-3 grid md:grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center md:gap-3 md:justify-start">
                {jobType === "Applied" && (
                  <FilterButtons
                    title="Status"
                    setDropdownStatus={setShowStatusDropdown}
                    dropDown={showStatusDropdown}
                    value={status}
                    setValue={setStatus}
                    defaultLabel="APPLIED"
                    options={APPLIED_JOB_STATUS}
                    onClick={() => {
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
                    if (jobType === "Applied") {
                      dispatch(fetchAppliedJobs({ sort, status, page }));
                    } else {
                      dispatch(fetchSavedJobs({ sort, page }));
                    }
                  }}
                  options={sortOptions}
                />
              </div>
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
            {uniqueJobs.length > 0 ? (
              uniqueJobs.map((job) => {
                return (
                  <article
                    className="rounded-lg bg-white p-4 shadow mt-7"
                    key={`${jobType}-${job._id}`}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-row w-full items-center justify-between">
                        <div className="flex flex-col">
                          <h3 className="text-lg md:text-xl font-semibold">
                            {job.jobName}
                          </h3>
                          <h4 className=" text-gray-600">{job.jobCategory}</h4>
                        </div>

                        {jobType === "Saved" && (
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
                        href={`/${role}Dashboard/jobs/${job?._id ? String(job._id) : null}?type=${jobType}`}
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
                              {jobType === ("Saved" || "Applied") && (
                                <>
                                  <span
                                    className={`h-3 w-3 rounded-full px-1 py-1 ${getStatusColor(jobType === "Saved" ? job.status : job.applicationStatus).dot}`}
                                  ></span>
                                  <p
                                    className={`text-sm font-medium ${getStatusColor(jobType === "Saved" ? job.status : job.applicationStatus).text}`}
                                  >
                                    {jobType === "Saved"
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

                    {jobType !== "JobInvitation" ? (
                      <div
                        className={`flex justify-between border-t pt-4 flex-row items-center`}
                      >
                        {jobType === ("Saved" || "Applied") && (
                          <p className="text-sm text-gray-500">
                            {" "}
                            {getPostedText({
                              createdAt:
                                jobType === "Saved"
                                  ? job.createdAt
                                  : job.appliedAt,
                              jobType,
                            })}
                          </p>
                        )}

                        {(jobType === "Saved" || "Applied") && (
                          <div className="flex gap-2 md:gap-3 md:mt-0">
                            {jobType === "Saved" ? (
                              <button
                                className="rounded bg-blue-600 cursor-pointer px-1 py-1 text-sm md:px-3 md:py-2 text-white"
                                onClick={() => {
                                  handleAppliedJobs({
                                    jobId: job._id,
                                    status,
                                    page: 1,
                                  });
                                }}
                              >
                                Apply Now
                              </button>
                            ) : jobType === "Applied" ? (
                              <button
                                className="rounded bg-blue-600 cursor-pointer px-1 py-1 text-sm md:px-3 md:py-2 text-white"
                                onClick={() =>
                                  handleCancelAppliedJob({
                                    jobId: job._id,
                                    sort: "Newest",
                                    page: 1,
                                  })
                                }
                              >
                                Cancel
                              </button>
                            ) : (
                              <></>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // jobInviteType === "sent" && (
                      // <div className="flex justify-between mt-3">
                      //   <button
                      //     className="bg-blue-600 text-white p-2 rounded-sm cursor-pointer"
                      //     onClick={() => {
                      //       handleJobInvitationStatus({
                      //         status: "Rejected",
                      //         jobId: job._id,
                      //         employerId: job.employerId,
                      //         page: 1,
                      //       });
                      //     }}
                      //   >
                      //     Reject
                      //   </button>

                      //   <button
                      //     className="bg-blue-600 text-white p-2 rounded-sm cursor-pointer"
                      //     onClick={() => {
                      //       handleJobInvitationStatus({
                      //         status: "Accepted",
                      //         jobId: job._id,
                      //         employerId: job.employerId,
                      //         page: 1,
                      //       });
                      //     }}
                      //   >
                      //     Accept
                      //   </button>
                      // </div>
                      <div className="mt-auto flex justify-between border-t border-gray-200 pt-4">
                        <button
                          className="cursor-pointer rounded-sm bg-blue-600 p-2 text-white"
                          onClick={() => {
                            handleJobInvitationStatus({
                              status: "Rejected",
                              jobId: job._id,
                              employerId: job.employerId,
                              page: 1,
                            });
                          }}
                        >
                          Reject
                        </button>

                        <button
                          className="cursor-pointer rounded-sm bg-blue-600 p-2 text-white"
                          onClick={() => {
                            handleJobInvitationStatus({
                              status: "Accepted",
                              jobId: job._id,
                              employerId: job.employerId,
                              page: 1,
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
                  <h2 className="text-2xl font-semibold text-gray-900">
                    No Jobs Available
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {`You haven't ${getMessage(jobType)} any jobs yet.`}
                  </p>
                  {/* <Link href="/employerDashboard/dashboard">
                    <button className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
                      Create Job
                    </button>
                  </Link> */}
                </div>
              </div>
            )}
          </section>
          <Pagination
            onClick={(p) => goToPage({ p, totalPages, setPage })}
            totalPages={totalPages}
            page={page}
            totalCount={totalCount}
          />
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
