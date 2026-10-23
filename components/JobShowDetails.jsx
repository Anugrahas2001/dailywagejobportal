"use client";

import Loading from "@/components/Loading";
import { getJoingDate, getShiftLabel } from "./commonFunctions";
import { useWorkerJobActions } from "./hooks/useWorkerJobActions";
import { useParams, useRouter } from "next/navigation";
import { JOB_COMPLETION_STATUS } from "@/constants/constant";
import { useEffect, useState } from "react";
import { fetchUserToken } from "@/lib/fetchUserToken";
import useLoading from "./hooks/useLoading";

export default function JobDetailsPage({ role, isModal, type }) {
  console.log(role, isModal, type, "CHECK ALL THE 3 VALUES");
  const router = useRouter();
  const { id } = useParams();
  console.log(id, "ID DATAAA GYAPPPPPP");
  const { toggleSavedJob, applyToJob } = useWorkerJobActions();
  const [workStatus, setWorkStatus] = useState("");
  const [images, setImages] = useState([]); // [{ file, preview }]
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [job, setJob] = useState(null);
  const { loading, setLoading } = useLoading();
  console.log(workStatus, "USER WORKING STATUS");

  // ✅ ALL hooks first
  useEffect(() => {
    if (!id) return;

    const loadJob = async () => {
      try {
        setLoading(true);
        const token = await fetchUserToken();
        const response = await fetch(`/api/worker/jobs/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch job details.");
        const { result } = await response.json();
        console.log(result, "RESULT RESULT RESULT DATA");
        setJob(result);
        setWorkStatus(result.jobCompletionStatus ?? "");
        setUploadedImages(result.workPics ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadJob();
    }
  }, [id]);

  // handlers (handleJobApplication, handleSavedJobs, etc.) go here

  // ✅ early return LAST, right before the JSX
  if (loading || !job) return <Loading />;

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

  const handleJobWorkingStatus = async ({ e, jobId }) => {
    console.log(e.target.value, jobId, "CHECK THIS VALUE");
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

      const result = await response.json();
      console.log(result, "RESULT DATA");
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

  // const handleUploadImages = async (jobId) => {
  //   if (images.length === 0) return;

  //   const formData = new FormData();
  //   formData.append("jobId", jobId);
  //   images.forEach(({ file }) => formData.append("images", file));

  //   try {
  //     setUploading(true);
  //     setUploadError("");
  //     const token = await fetchUserToken();
  //     const response = await fetch("/api/worker/jobs/images", {
  //       method: "PUT",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: formData, // no Content-Type header; the browser adds the boundary
  //     });
  //     const { urls } = await response.json();
  //     setImages(urls);

  //     if (!response.ok) {
  //       setUploadError(result.error || "Upload failed");
  //       return;
  //     }

  //     images.forEach(({ preview }) => URL.revokeObjectURL(preview));
  //     setImages([]);
  //     console.log(urls, "UPLOADED URLS");
  //   } catch (error) {
  //     console.log(error, "UPLOAD ERROR");
  //     setUploadError("Something went wrong. Please try again.");
  //   } finally {
  //     setUploading(false);
  //   }
  // };

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

      const result = await response.json();

      if (!response.ok) {
        setUploadError(result.error || "Upload failed");
        return;
      }

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

      {role === "worker" ? (
        isModal && (
          // (
          //   <button
          //     className="rounded-lg cursor-pointer bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          //     // onClick={() => router.push(`/workerDashboard/jobs/${job._id}`)}
          //     onClick={() =>
          //       window.location.assign(
          //         `/workerDashboard/jobs/${job._id}?type=${type}`,
          //       )
          //     }
          //   >
          //     View Full Details
          //   </button>
          // ):

          <div className="flex w-full flex-col gap-3 sm:gap-7 sm:flex-row sm:justify-center items-center">
            {type === "saved" ? (
              <button
                disabled={loading}
                className="rounded-lg cursor-pointer bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                onClick={() => handleJobApplication(job._id)}
              >
                Apply Now
              </button>
            ) : type === "accepted" ? (
              <div className="w-full bg-gray-300">
                <div className="flex justify-between items-center m-2">
                  <p className="font-medium">Worker Job Status: </p>
                  <select
                    className="rounded-lg border border-gray-300 px-4 py-2"
                    value={workStatus}
                    onChange={(e) =>
                      handleJobWorkingStatus({ e, jobId: job._id })
                    }
                  >
                    {Object.values(JOB_COMPLETION_STATUS).slice(0,4).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="m-2 space-y-3">
                  <label className="block font-medium">
                    Upload work photos (max 5, 5MB each)
                  </label>
                  {uploadedImages.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium">
                        Uploaded photos ({uploadedImages.length})
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {uploadedImages.map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={url}
                              alt="Uploaded work photo"
                              loading="lazy"
                              className="h-24 w-full rounded-lg object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="block w-full text-sm"
                  />

                  {images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {images.map(({ preview }, index) => (
                        <div key={preview} className="relative">
                          <img
                            src={preview}
                            alt={`Selected ${index + 1}`}
                            className="h-24 w-full rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                            aria-label="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-sm text-red-600">{uploadError}</p>
                  )}
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => handleUploadImages(job._id)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    {uploading
                      ? "Uploading..."
                      : `Upload ${images.length || ""} image(s)`}
                  </button>
                </div>
              </div>
            ) : type === "applied" || type === "jobInvitation" ? null : (
              <>
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
              </>
            )}
          </div>
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
