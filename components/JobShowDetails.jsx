"use client";

import { getJoiningPeriodType, getShiftTypes } from "./commonFunctions";
import { useWorkerJobActions } from "./hooks/useWorkerJobActions";
import { JOB_COMPLETION_STATUS } from "@/constants/constant";
import { useEffect, useState } from "react";
import { fetchUserToken } from "@/lib/fetchUserToken";
import JobDetailsSkeleton from "./skeltons/JobDetailsSkeleton";
import { fetchSavedJobs } from "@/lib/features/workerJobs/savedjobs/savedJobThunk";
import useControls from "./hooks/useControls";
import { useJobActions } from "./hooks/useUserJobAction";
import useError from "./hooks/useError";

export default function JobDetailsPage({ id, role, isModal, type }) {
  const { applyToJob } = useWorkerJobActions();
  const [workStatus, setWorkStatus] = useState("");
  const [images, setImages] = useState([]); // [{ file, preview }]
  const [uploading, setUploading] = useState(false);
  const {error, setError}=useError();
  const [uploadError, setUploadError] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [job, setJob] = useState(null);
  const errorData = error || uploadError;
  const { handleCancelAppliedJob, handleJobInvitationStatus } = useJobActions();

  const {
    page,
    setPage,
    router,
    dispatch,
    runWithPending,
    isPending, ///============= Do this
    initialLoading,
    setInitialLoading,
  } = useControls();

  // ✅ ALL hooks first
  // useEffect(() => {
  //   if (!id) return;

  //   const loadJob = async () => {
  //     try {
  //       setLoading(true);
  //       const token = await fetchUserToken();
  //       const response = await fetch(`/api/${role}/jobs/${id}`, {
  //         method: "GET",
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       if (!response.ok) throw new Error("Failed to fetch job details.");
  //       const { result } = await response.json();
  //       console.log(result, "RESULT RESULT RESULT DATA");
  //       setJob(result);
  //       setWorkStatus(result.jobCompletionStatus ?? "");
  //       setUploadedImages(result.workPics ?? []);
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (id && role) {
  //     loadJob();
  //   }
  // }, [id, role]);

  useEffect(() => {
    if (!id || !role) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        const token = await fetchUserToken();
        const res = await fetch(`/api/${role}/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctrl.signal,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({})); // body may not be JSON
          const message =
            res.status === 401
              ? "Please log in again."
              : data.message || `Failed to load job (status ${res.status})`;
          setError(message);
          return; // stop here, don't touch job state
        }
        const { result } = await res.json();
        setJob(result);
        setWorkStatus(result.jobCompletionStatus ?? "");
        setUploadedImages(result.workPics ?? []);
        setInitialLoading(false);
      } catch (e) {
        if (e.name !== "AbortError") setError("Couldn't load this job.");
      }
    })();
    return () => ctrl.abort();
  }, [id, role]);

  // ✅ early return LAST, right before the JSX
  if (!job) return <JobDetailsSkeleton />;

  const handleJobApplication = (jobId) => {
    runWithPending(`application-${jobId}`, async () => {
      try {
        await applyToJob(jobId); // make sure your hook returns the promise / uses .unwrap()
        router.back(); // closes the intercepted modal
        await dispatch(fetchSavedJobs({ sort: "Newest", page: 1 })).unwrap();
      } catch (err) {
        console.error("Apply failed:", err);
        setUploadError("Couldn't apply. Please try again.");
      }
    });
  };

  // const handleSavedJobs = async(jobId) => {
  //   console.log(jobId, "JOB ID");
  //   await toggleSavedJob(jobId);
  //   router.replace("/workerDashboard");
  // };

  const handleJobWorkingStatus = async ({ e, jobId }) => {
    localStorage.setItem("currentJobId", jobId);
    setWorkStatus(e.target.value);
    let action;
    switch (e.target.value) {
      case "Started":
        action = "START";
        break;
      case "InProgress":
        action = "IN_PROGRESS";
        break;
      case "Completed":
        action = "COMPLETED";
        break;
      default:
        action = "Default";
        break;
    }

    try {
      const token = await fetchUserToken();
      const response = await fetch("/api/worker/jobs", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, action }),
      });

      if (!response.ok) {
        const data = await res.json().catch(() => ({})); // body may not be JSON
        const message =
          data.message || `Failed to load job (status ${response.status})`;
        setError(message);
        return; // stop here, don't touch job state
      }
      const result = await response.json();
    } catch (error) {
      console.log(error, "ERROR DATA");
    }
  };

  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files);

    const valid = selected.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024,
    );

    if (valid.length !== selected.length) {
      setUploadError("Some files were skipped (images only, max 5MB each).");
    } else {
      setUploadError("");
    }

    const newImages = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => {
      const combined = [...prev, ...newImages];
      // revoke previews for images dropped by the 5-image limit
      combined.slice(5).forEach(({ preview }) => URL.revokeObjectURL(preview));
      return combined.slice(0, 5);
    });

    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUploadImages = async (jobId) => {
    if (images.length === 0) return;

    const formData = new FormData();
    formData.append("jobId", jobId);
    images.forEach(({ file }) => formData.append("images", file));

    try {
      setUploading(true);
      setUploadError("");

      const token = await fetchUserToken();
      const response = await fetch("/api/worker/jobs/images", {
        method: "PUT", // matches the route's POST export
        headers: { Authorization: `Bearer ${token}` },
        body: formData, // no Content-Type; the browser adds the boundary
      });

      if (!response.ok) {
        // setUploadError(result.error || "Upload failed");
        const data = await res.json().catch(() => ({})); // body may not be JSON
        const message =
          data.message || `Failed to update job (status ${res.status})`;
        setError(message);
        return; // stop here, don't touch job state
      }

      const result = await response.json();

      // clear the local previews
      images.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setImages([]);

      // show the full saved list (the route returns workPics)
      setUploadedImages(result.workPics ?? result.urls ?? []);
    } catch (error) {
      console.log(error, "UPLOAD ERROR");
      setUploadError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl bg-gray-100 mx-auto px-6 py-8 space-y-8">
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
          <p>{getShiftTypes(job.jobShift)}</p>
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
          <p>{getJoiningPeriodType(job.availability)}</p>
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

      {role === "worker" && isModal && (
        <div className="flex w-full flex-col gap-3 sm:gap-7 sm:flex-row sm:justify-center items-center">
          {type === "Saved" ? (
            <button
              disabled={isPending(`application-${job._id}`)}
              aria-busy={isPending(`application-${job._id}`)}
              className="rounded-lg cursor-pointer bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              onClick={() => handleJobApplication(job._id)}
            >
              Apply Now
            </button>
          ) : type === "Accepted" ? (
            // <div className="w-full bg-gray-300">
            //   <div className="flex justify-between items-center m-2">
            //     <p className="font-medium">Worker Job Status: </p>
            //     <select
            //       className="rounded-lg border border-gray-300 px-4 py-2"
            //       value={workStatus}
            //       onChange={(e) =>
            //         handleJobWorkingStatus({ e, jobId: job._id })
            //       }
            //     >
            //       {Object.values(JOB_COMPLETION_STATUS)
            //         .slice(0, 4)
            //         .map((status) => (
            //           <option key={status} value={status}>
            //             {status}
            //           </option>
            //         ))}
            //     </select>
            //   </div>
            //   <div className="m-2 space-y-3">
            //     <label className="block font-medium">
            //       Upload work photos (max 5, 5MB each)
            //     </label>
            //     {uploadedImages.length > 0 && (
            //       <div className="space-y-2">
            //         <p className="font-medium">
            //           Uploaded photos ({uploadedImages.length})
            //         </p>
            //         <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            //           {uploadedImages.map((url) => (
            //             <a
            //               key={url}
            //               href={url}
            //               target="_blank"
            //               rel="noopener noreferrer"
            //             >
            //               <img
            //                 src={url}
            //                 alt="Uploaded work photo"
            //                 loading="lazy"
            //                 className="h-24 w-full rounded-lg object-cover"
            //               />
            //             </a>
            //           ))}
            //         </div>
            //       </div>
            //     )}

            //     <input
            //       type="file"
            //       accept="image/*"
            //       multiple
            //       onChange={handleImageChange}
            //       className="block w-full text-sm"
            //     />

            //     {images.length > 0 && (
            //       <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            //         {images.map(({ preview }, index) => (
            //           <div key={preview} className="relative">
            //             <img
            //               src={preview}
            //               alt={`Selected ${index + 1}`}
            //               className="h-24 w-full rounded-lg object-cover"
            //             />
            //             <button
            //               type="button"
            //               onClick={() => removeImage(index)}
            //               className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white"
            //               aria-label="Remove image"
            //             >
            //               ✕
            //             </button>
            //           </div>
            //         ))}
            //       </div>
            //     )}

            //     {uploadError && (
            //       <p className="text-sm text-red-600">{uploadError}</p>
            //     )}
            //     <button
            //       type="button"
            //       disabled={uploading}
            //       onClick={() => handleUploadImages(job._id)}
            //       className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            //     >
            //       {uploading
            //         ? "Uploading..."
            //         : `Upload ${images.length || ""} image(s)`}
            //     </button>
            //   </div>
            // </div>

            <section className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              {/* Status */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor={`status-${job._id}`}
                  className="text-sm font-semibold text-gray-800"
                >
                  Worker job status
                </label>
                <select
                  id={`status-${job._id}`}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-56"
                  value={workStatus}
                  onChange={(e) =>
                    handleJobWorkingStatus({ e, jobId: job._id })
                  }
                >
                  {Object.values(JOB_COMPLETION_STATUS)
                    .slice(0, 4)
                    .map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                </select>
              </div>

              <hr className="my-4 border-gray-200" />

              {/* Photos */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Work photos
                  </h3>
                  <p className="text-xs text-gray-500">
                    Max 5 images, 5MB each
                  </p>
                </div>

                {/* Already uploaded */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Uploaded ({uploadedImages.length})
                    </p>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {uploadedImages.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden rounded-lg border border-gray-200"
                        >
                          <img
                            src={url}
                            alt="Uploaded work photo"
                            loading="lazy"
                            className="aspect-square w-full object-cover transition hover:scale-105"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drop zone / picker */}
                <label
                  htmlFor={`photos-${job._id}`}
                  className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <span className="text-sm font-medium text-gray-700">
                    Click to choose photos
                  </span>
                  <span className="text-xs text-gray-500">PNG, JPG, WEBP</span>
                  <input
                    id={`photos-${job._id}`}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>

                {/* Selected previews */}
                {images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Ready to upload ({images.length}/5)
                    </p>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {images.map(({ preview }, index) => (
                        <div key={preview} className="relative">
                          <img
                            src={preview}
                            alt={`Selected ${index + 1}`}
                            className="aspect-square w-full rounded-lg border border-gray-200 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    {uploadError}
                  </p>
                )}

                <button
                  type="button"
                  disabled={uploading || images.length === 0}
                  onClick={() => handleUploadImages(job._id)}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {uploading
                    ? "Uploading..."
                    : images.length > 0
                      ? `Upload ${images.length} image${images.length > 1 ? "s" : ""}`
                      : "Upload images"}
                </button>
              </div>
            </section>
          ) : type === "Saved" ? (
            <button
              disabled={isPending(`application-${job._id}`)}
              aria-busy={isPending(`application-${job._id}`)}
              className="rounded-lg cursor-pointer bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              onClick={() => handleJobApplication(job._id)}
            >
              Apply Now
            </button>
          ) : type === "Applied" ? (
            <button
              className="rounded bg-blue-600 cursor-pointer px-1 py-1 text-sm md:px-3 md:py-2 text-white"
              onClick={() =>
                handleCancelAppliedJob({ jobId: job._id, sort: "Newest" })
              }
            >
              Cancel
            </button>
          ) : type === "JobInvitation" ? (
            <div className="mt-3 w-full mx-4">
              <div className="flex justify-between mx-4 p-2">
                <button
                  className="bg-blue-600 text-white p-2 rounded-sm cursor-pointer"
                  onClick={() => {
                    handleJobInvitationStatus({
                      status: "Rejected",
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
                      status: "Accepted",
                      jobId: job._id,
                      employerId: job.employerId,
                    });
                  }}
                >
                  Accept
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
      {errorData && (
        <Error
          error={errorData}
          onClick={() => {
            setUploadError("");
            setError("");
          }}
        />
      )}
    </div>
  );
}

// type === "JobInvitation" || type === "Accepted" || type === "Applied" ? null : (
//   <button
//     disabled={isPending(`application-${job._id}`)}
//     aria-busy={isPending(`application-${job._id}`)}
//     className="rounded-lg cursor-pointer bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
//     onClick={() => handleJobApplication(job._id)}
//   >
//     Apply Now
//   </button>
// );
