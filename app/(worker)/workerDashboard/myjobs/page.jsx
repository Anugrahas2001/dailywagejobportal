//Myjobs.jsx
"use client";
import {
  getJoingDate,
  getPostedText,
  getShiftLabel,
  getStatusColor,
} from "@/components/commonFunctions";
import FilterButtons from "@/components/FilterButtons";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import {
  appliedjobStatus,
  appliedSortingOptions,
  savedSortingOptions,
} from "@/constants/constant";
import {
  applyToJob,
  cancelAppliedJobs,
  fetchAppliedJobs,
} from "@/lib/features/workerJobs/appliedjobs/appliedJobThunk";
import {
  fetchSavedJobs,
  toggleSavedJobs,
} from "@/lib/features/workerJobs/savedjobs/savedJobThunk";
import { Bookmark, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const page = () => {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("saved");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [status, setStatus] = useState("applied");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();

  const pageSize = 12;

  const savedJobs = useSelector((state) => state.saved.savedJobs);
  console.log(savedJobs.length, "ALL SAVED JOBS");
  const savedTotalCount = useSelector((state) => state.saved.totalCount);
  const savedLoadingStatus = useSelector((state) => state.saved.status);

  const appliedJobs = useSelector((state) => state.applied.appliedJobs);
  const appliedTotalCount = useSelector((state) => state.applied.totalCount);
  const appliedLoadingStatus = useSelector((state) => state.applied.status);

  const jobs = jobType === "saved" ? savedJobs : appliedJobs;

  const totalCount = jobType === "saved" ? savedTotalCount : appliedTotalCount;

  const loadingStatus =
    jobType === "saved" ? savedLoadingStatus : appliedLoadingStatus;

  const totalPages = Math.ceil(totalCount / pageSize);

  const defaultLabel = jobType === "saved" ? "Newest Saved" : "Newest Applied";
  const sortOptions =
    jobType === "saved" ? savedSortingOptions : appliedSortingOptions;

  const savedStatus = useSelector((state) => state.saved.status);
  const appliedStatus = useSelector((state) => state.applied.status);

  const statusLoading = savedStatus || appliedStatus;

  const handleJobStatus = (jobStatus) => {
    if (jobStatus === "saved") {
      setJobType("saved");
    } else {
      setJobType("applied");
    }
  };

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
    dispatch(
      fetchAppliedJobs({
        sort,
        status,
        page: p,
      }),
    );
  };

  const handleToggleSavedJob = (jobId) => {
    const isSavedValue = savedJobs.some((savedJob) => savedJob._id === jobId);
    console.log(jobId, isSavedValue, "FROM THE SAVED TOGGLE BUTTON ISHAAN");
    dispatch(
      toggleSavedJobs({
        jobId,
        toggle: isSavedValue,
      }),
    );
  };

  const handleAppliedJobs = async (jobId) => {
    await dispatch(applyToJob({ jobId })).unwrap();
    setPage(1);
    await dispatch(fetchSavedJobs({ sort, page })).unwrap();
  };

  const handleCancelAppliedJob = async (jobId) => {
    await dispatch(cancelAppliedJobs(jobId)).unwrap();
    setPage(1);
    await dispatch(
      fetchAppliedJobs({
        sort,
        status,
        page: 1,
      }),
    ).unwrap();
  };

  useEffect(() => {
    if (jobType === "saved") {
      // console.log("Fetch Again");
      dispatch(fetchSavedJobs({ sort, page }));
    } else {
      dispatch(fetchAppliedJobs({ sort, status, page }));
    }
  }, [jobType, sort, status, page]);

  console.log(jobs, "JOBS DATA");
  const ids = jobs.map((job) => job._id);

  console.log("IDs:", ids);
  console.log("Jobs:", jobs.length);
  console.log("Unique IDs:", new Set(ids).size);

  const uniqueJobs = Array.from(
    new Map(jobs.map((job) => [job._id, job])).values(),
  );

  return (
    <div className="p-6 m-6">
      <div className="flex">
        <button
          onClick={() => {
            handleJobStatus("saved");
          }}
          className={`px-3 py-1 rounded-lg m-2 hover:bg-blue-500 text-white ${jobType === "saved" ? "bg-blue-500" : "bg-gray-400"}`}
        >
          Saved Jobs
        </button>
        <button
          onClick={() => {
            handleJobStatus("applied");
          }}
          className={`px-3 py-1 rounded-lg m-2 hover:bg-blue-500 text-white ${jobType === "applied" ? "bg-blue-500" : "bg-gray-400"}`}
        >
          Applied Jobs
        </button>
      </div>
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
      </div>

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
              options={appliedjobStatus}
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
              if (jobType === "applied") {
                dispatch(fetchAppliedJobs({ sort, status, page }));
              } else {
                dispatch(fetchSavedJobs({ sort, page }));
              }
            }}
            options={sortOptions}
          />
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        {loadingStatus === "pending" ? (
          <div className="flex justify-center py-10">
            <Loading />
          </div>
        ) : uniqueJobs.length > 0 ? (
          uniqueJobs.map((job) => {
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
                            jobs.some((savedJob) => savedJob._id === job._id)
                              ? "gray"
                              : "none"
                          }
                          className="h-6 w-6 cursor-pointer text-gray-700 stroke-[2]"
                        />
                      </button>
                    )}
                  </div>

                  <Link href={`/employerDashboard/jobs/${job._id}`}>
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

                    <div className="space-y-2 md:min-w-[170px] md:text-right mt-4 flex flex-row justify-between">
                      <div className="flex items-center gap-2 md:justify-end">
                        <span
                          className={`h-3 w-3 rounded-full px-1 py-1 ${getStatusColor(jobType === "saved" ? job.status : job.applicationStatus.charAt(0).toUpperCase() + job.applicationStatus.slice(1)).dot}`}
                        ></span>
                        <p
                          className={`text-sm font-medium ${getStatusColor(jobType === "saved" ? job.status : job.applicationStatus.charAt(0).toUpperCase() + job.applicationStatus.slice(1)).text}`}
                        >
                          {jobType === "saved"
                            ? job.status
                            : job.applicationStatus.charAt(0).toUpperCase() +
                              job.applicationStatus.slice(1)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Footer */}
                <div
                  className={`flex justify-between border-t pt-4 flex-row items-center`}
                >
                  {/* md:flex-row */}
                  <p className="text-sm text-gray-500">
                    {" "}
                    {getPostedText({
                      createdAt:
                        jobType === "saved" ? job.createdAt : job.appliedAt,
                      jobType,
                    })}
                  </p>

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
                </div>
              </article>
            );
          })
        ) : (
          //=========

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
      {statusLoading === "pending" && <Loading />}
    </div>
  );
};

export default page;
