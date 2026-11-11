"use client";

import { fetchUserToken } from "@/lib/fetchUserToken";
import {
  BadgeCheck,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  Clock,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  formatDOB,
  calculateAge,
  getJoiningPeriodType,
  getShiftTypes,
  fetchUserJobDetails,
  salaryCreditTypes,
  getMatchStyle,
} from "./commonFunctions";
import ViewProfileSkeleton from "./skeltons/ViewProfileSkeleton";
import useControls from "./hooks/useControls";
import useLoading from "./hooks/useLoading";
import { JOB_APPLICATION_STATUS } from "@/constants/constant";
import PaymentModal from "./PaymentModal";
import Error from "./Error";
import useError from "./hooks/useError";

const ViewProfile = ({
  workerId,
  jobId,
  type,
  status,
  matchingRate,
  jobInvitation,
}) => {
  const [workerData, setWorkerData] = useState({});
  console.log(workerData, "WORKER DATA DATA WORKER");
  const [jobStatus, setJobStatus] = useState("");
  const { loading, setLoading } = useLoading();
  const [showPayment, setShowPayment] = useState(false);
  const [justPaid, setJustPaid] = useState(false);
  const { error, setError } = useError();
  const {
    router,
    dispatch,
    runWithPending,
    isPending,
    initialLoading,
    setInitialLoading,
  } = useControls();

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
        const data = await res.json().catch(() => ({})); // body may not be JSON
        const message =
          data.message ||
          `Failed to view worker profile (status ${response.status})`;
        setError(message);
        return; // stop here, don't touch job state
      }

      const { data } = await response.json();
      setWorkerData(data);
      setJobStatus(data?.status || "");
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch worker data:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
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
      setLoading(true);

      await fetchUserJobDetails({ workerId, status, jobId, type });

      router.back();
      setLoading(false);
    } catch (error) {
      console.log(error, "ERROR DATA");
    } finally {
      setLoading(false);
    }
  };

  const handleJobInvitation = ({ workerId, jobId }) => {
    runWithPending(`sentjobinvite-${workerId}`, async () => {
      try {
        const token = await fetchUserToken();
        setLoading(true);
        const response = await fetch("/api/employer/jobInvitation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ workerId, jobId }),
        });

        const { data } = await response.json();
        // router.replace("/employerDashboard");
        router.back();
        setLoading(false);
      } catch (error) {
        console.log(error, "ERROR DATA");
        setLoading(false);
      }
    });
  };

  const handleCancelJobInvitation = ({ workerId, jobId }) => {
    runWithPending(`canceljobinvite${workerId}`, async () => {
      try {
        const token = await fetchUserToken();

        setLoading(true);
        const response = await fetch("/api/employer/jobInvitation", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ workerId, jobId, isCancelled: true }),
        });

        const { data } = await response.json();
        router.back();
        setLoading(false);
      } catch (error) {
        console.log(error, "ERROR DATA");
        setLoading(false);
      }
    });
  };
  const formatRupees = (v) => `₹${Number(v).toLocaleString("en-IN")}`;
  const formatMinutes = (v) => `${v} hrs`;

  const SALARY_ROWS = [
    {
      key: "agreedRate",
      title: "Worker Salary",
      description: "Current salary of the worker",
      format: formatRupees,
    },
    {
      key: "salaryType",
      title: "Salary Credit Type",
      description: "Worker salary type",
    },
    {
      key: "totalWorkingHours",
      title: "Total working time",
      description: "Working time of the user",
      format: formatMinutes,
    },
    {
      key: "totalSalary",
      title: "Total salary",
      description: "Working salary of the worker",
      format: formatRupees,
    },
  ];

  const handlePaymentClose = () => {
    setShowPayment(false);
    if (justPaid) fetchUserData(); // refresh after the modal closes
  };

  // Inside your component
  const {
    jobWorkingStatus,
    workerCurrentStatus,
    workerPics = [],
    status: workerStatus,
    userId,
  } = workerData ?? {};

  const showSalary =
    workerCurrentStatus === "Start Tomorrow" ||
    jobWorkingStatus === "Completed" ||
    jobWorkingStatus === "InProgress";

  const canPay = showSalary && Number(workerData?.totalSalary) > 0 && !justPaid;

  const BADGE_CLASS =
    "inline-flex items-center gap-2 bg-gray-400 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium";

  const InfoRow = ({ title, description, value }) => (
    <div className="py-4 border-b flex items-center px-2 justify-between">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      {value != null && value !== "" && (
        <span className={BADGE_CLASS}>{value}</span>
      )}
    </div>
  );

  // const BADGES_CLASS =
  //   "inline-flex items-center gap-2 shrink-0 bg-gray-400 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800";

  const InfoJobCompletionRow = ({ title, description, value, format }) => {
    const hasValue = value != null && value !== "";

    return (
      <div className="grid grid-cols-2 items-center gap-3 border-b px-2 py-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>

        <span className={`${BADGE_CLASS} justify-self-end`}>
          {hasValue ? (format ? format(value) : value) : "—"}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-4 my-2 px-4 space-y-8 md:mx-auto bg-gray-100">
      {loading || initialLoading || !workerData ? (
        <div className="mt-2" role="status" aria-busy="true">
          <div className="motion-safe:animate-pulse" aria-hidden="true">
            <ViewProfileSkeleton />
          </div>
        </div>
      ) : (
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
              {/* <div className="flex items-center justify-between bg-amber-300"> */}
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
              {type !== "applications" && (
                <div className="bg-amber-100 m-2">
                  <span
                    className={`px-3 py-1 rounded-md ${getMatchStyle(matchingRate)?.className}`}
                  >
                    {matchingRate}%{""}-{getMatchStyle(matchingRate)?.text}
                  </span>
                </div>
              )}
              {/* </div> */}
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
                  <Wallet className="h-4 w-4" />
                  Salary Credit Type
                </div>

                <p className="mt-2 font-semibold text-gray-800">
                  {salaryCreditTypes(workerData?.salaryCreditType) || "-"}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  Joining
                </div>

                <p className="mt-2 font-semibold text-gray-800">
                  {getJoiningPeriodType(workerData?.joiningPeriod) || "-"}
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

          <section className="p-4 md:p-8 border-b">
            <InfoRow
              title="Job Completion Status"
              description="Current status of the job"
              value={jobWorkingStatus}
            />

            {showSalary &&
              SALARY_ROWS.map(({ key, title, description, format }) => (
                <InfoJobCompletionRow
                  key={key}
                  title={title}
                  description={description}
                  value={workerData?.[key]}
                  format={format}
                />
              ))}
            {/* {showSalary &&
              Number(workerData?.totalSalary) > 0 &&
              !justPaid && (
                <div className="flex justify-end py-4">
                  <button
                    onClick={() => setShowPayment(true)}
                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Pay Now
                  </button>
                </div>
              )} */}

            <InfoRow
              title="Worker Current Status"
              description="Current status of the worker"
              value={workerCurrentStatus}
            />

            {workerData?.workerPics?.map((img, index) => (
              <>
                <h2 className="text-lg font-semibold text-gray-900">
                  Work Site Images
                </h2>
                <div className="py-4 border-b flex items-center gap-2 px-2 overflow-x-auto">
                  <img
                    key={index}
                    src={img}
                    alt={`Work image ${index + 1}`}
                    className="h-24 w-24 rounded-md object-cover shrink-0"
                  />
                </div>
              </>
            ))}

            {canPay && (
              <div className="flex justify-center items-center py-4">
                <button
                  onClick={() => setShowPayment(true)}
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
                >
                  Pay Now
                </button>
              </div>
            )}

            {justPaid && (
              <div className="flex justify-center items-center py-4">
                <span className="rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                  ✓ Paid
                </span>
              </div>
            )}

            {type === "applications" && (
              <div className="flex flex-col border-b py-4 gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Application Status
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Update the applicant's current status.
                  </p>
                </div>

                {status === "All" ? (
                  <select
                    value={jobStatus ? jobStatus : workerData?.status}
                    onChange={(e) =>
                      handleJobApplicationStatus(e, {
                        workerId: userId,
                        jobId,
                      })
                    }
                    className={`rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                      workerData?.status || jobStatus
                        ? "border-blue-300 bg-blue-50 text-blue-700"
                        : ""
                    }`}
                  >
                    <option value="">Select Status</option>
                    {Object.values(JOB_APPLICATION_STATUS).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                ) : workerData?.status ? (
                  <span
                    className={`bg-gray-400 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {workerData.status}
                  </span>
                ) : null}
              </div>
            )}
          </section>

          {/* {type === "recommendation" && !workerData?.status && (
            <section className="flex justify-center items-center">
              {jobInvitation === "send" || jobInvitation === "resend" ? (
                <button
                  disabled={isPending(`sentjobinvite-${userId}`)}
                  aria-busy={isPending(`sentjobinvite-${userId}`)}
                  title="Job Invitation"
                  className="m-3 rounded-md bg-blue-600 p-3 text-white"
                  onClick={() => {
                    handleJobInvitation({
                      workerId: userId,
                      jobId,
                    });
                  }}
                >
                  Send Job Invitation
                </button>
              ) : (
                console.log("CANCEL CANCEL DATA")
                <button
                  disabled={isPending(`canceljobinvite-${userId}`)}
                  aria-busy={isPending(`canceljobinvite-${userId}`)}
                  title="Job Invitation"
                  className="m-3 rounded-md bg-blue-600 p-3 text-white"
                  onClick={() => {
                    handleCancelJobInvitation({
                      workerId: userId,
                      jobId,
                    });
                  }}
                >
                  Cancel
                </button>
              )}
            </section>
          )} */}

          {type === "recommendation" && (
            <section className="flex justify-center items-center">
              {(jobInvitation === "send" || jobInvitation === "resend") &&
              !workerData?.status ? (
                <button
                  disabled={isPending(`sentjobinvite-${userId}`)}
                  aria-busy={isPending(`sentjobinvite-${userId}`)}
                  title="Job Invitation"
                  className="m-3 rounded-md bg-blue-600 p-3 text-white"
                  onClick={() => {
                    handleJobInvitation({ workerId: userId, jobId });
                  }}
                >
                  Send Job Invitation
                </button>
              ) : (
                <button
                  disabled={isPending(`canceljobinvite-${userId}`)}
                  aria-busy={isPending(`canceljobinvite-${userId}`)}
                  title="Job Invitation"
                  className="m-3 rounded-md bg-blue-600 p-3 text-white"
                  onClick={() => {
                    handleCancelJobInvitation({ workerId: userId, jobId });
                  }}
                >
                  Cancel
                </button>
              )}
            </section>
          )}
        </div>
      )}

      {/* Outside the loading ternary so it isn't unmounted during refetch */}
      <PaymentModal
        open={showPayment}
        onClose={handlePaymentClose}
        workerId={userId}
        workerName={workerData?.name}
        amount={Number(workerData?.totalSalary)}
        jobId={jobId}
        // employerName={employerName}
        onSuccess={() => setJustPaid(true)}
      />
      {error && <Error error={error} onClick={() => setError("")} />}
    </div>
  );
};

export default ViewProfile;
