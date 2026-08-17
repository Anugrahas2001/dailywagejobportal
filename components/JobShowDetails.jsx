"use client";

import Loading from "@/components/Loading";
import jobFetchUseEffcetHook from "@/components/hooks/jobFetchUseEffcetHook";
import { getJoingDate, getShiftLabel } from "./commonFunctions";
import { useWorkerJobActions } from "./hooks/useWorkerJobActions";
import { useRouter } from "next/navigation";

export default function JobDetailsPage({ role, isModal }) {
  const router = useRouter();
  const { loading, job } = jobFetchUseEffcetHook();
  const { toggleSavedJob, applyToJob } = useWorkerJobActions();
  useWorkerJobActions();
  if (loading) return <Loading />;

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Job not found.</p>
      </div>
    );
  }

  const handleJobApplication = (jobId) => {
    console.log(jobId, "JOB ID");
    applyToJob(jobId);
    router.replace("/workerDashboard");
  };

  const handleSavedJobs = (jobId) => {
    console.log(jobId, "JOB ID");
    toggleSavedJob(jobId);
    router.replace("/workerDashboard");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{job.jobName}</h1>
        <p className="text-gray-600 mt-1">{job.jobCategory}</p>
      </div>

      {/* Basic Details */}
      <div className="grid md:grid-cols-2 gap-4 rounded-lg border p-5">
        <div>
          <h3 className="font-semibold">Location</h3>
          <p>
            {job.city}, {job.state}, {job.country}
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Shift</h3>
          <p>{getShiftLabel(job.jobShift)}</p>
        </div>

        <div>
          <h3 className="font-semibold">Salary</h3>
          <p>
            ₹{job.minSalary} - ₹{job.maxSalary} ({job.salaryType})
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Openings</h3>
          <p>{job.numberOfOpenings}</p>
        </div>

        <div>
          <h3 className="font-semibold">Joining</h3>
          <p>{getJoingDate(job.availability)}</p>
        </div>

        <div>
          <h3 className="font-semibold">Gender Preference</h3>
          <p>{job.genderPreference}</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Full Job Description</h2>
        <p className="text-gray-700 leading-7">{job.jobDescription}</p>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Skills Required</h2>

        <div className="flex flex-wrap gap-3">
          {job.skillsRequired?.map((skill, index) => (
            <span
              key={index}
              className="rounded-full bg-blue-100 text-blue-700 px-4 py-2 text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Responsibilities */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Responsibilities</h2>

        <ul className="list-disc list-inside space-y-2">
          {job.responsibilities?.map((item, index) => (
            <li key={index} className="text-gray-700">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* {role && role === "worker" && !isModal ? (
        <div className="flex flex-col gap-3 sm:gap-7 sm:flex-row sm:justify-center">
          <button
            className="rounded-lg border cursor-pointer border-blue-600 bg-white px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-50"
            onClick={() => {
              toggleSavedJob(job._id);
            }}
          >
            Save for Later
          </button>
          <button
            className="rounded-lg cursor-pointer bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            onClick={() => handleJobApplication(job._id)}
          >
            Apply Now
          </button>
        </div>
      ) : (
        <button
          className="rounded-lg cursor-pointer bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          onClick={() => router.push(`workerDashboard/jobs/${job._id}`)}
        >
          View Full Details
        </button>
      )} */}

      {role === "worker" ? (
        !isModal ? (
          <div className="flex flex-col gap-3 sm:gap-7 sm:flex-row sm:justify-center items-center">
            <button
              disabled={loading}
              className="rounded-lg border cursor-pointer border-blue-600 bg-white px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-50"
              onClick={() => handleSavedJobs(job._id)}
            >
              Save for Later
            </button>

            <button
              disabled={loading}
              className="rounded-lg cursor-pointer bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              onClick={() => handleJobApplication(job._id)}
            >
              Apply Now
            </button>
          </div>
        ) : (
          // <Link href={``}>
          <button
            className="rounded-lg cursor-pointer bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            onClick={() =>
              window.location.assign(`/workerDashboard/jobs/${job._id}`)
            }
          >
            View Full Details
          </button>
          // </Link>
        )
      ) : (
        <button
          className="rounded-lg cursor-pointer bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          onClick={() => router.push(`/employerDashboard/jobs/${job._id}`)}
        >
          View Full Details
        </button>
      )}
    </div>
  );
}
