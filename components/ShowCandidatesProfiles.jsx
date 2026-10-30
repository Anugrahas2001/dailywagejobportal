"use client";
import {
  fetchUserJobDetails,
  getJoiningPeriodType,
  getMatchStyle,
  getShiftTypes,
  goToPage,
} from "@/components/commonFunctions";
import { fetchUserToken } from "@/lib/fetchUserToken";
import {
  BadgeCheck,
  MapPin,
  Wallet,
  Clock,
  X,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import Pagination from "./Pagination";
import Slider from "./Slider";
import CandidateCardSkeleton from "./skeltons/CandidateCardSkeleton";
import useControls from "./hooks/useControls";
import useLoading from "./hooks/useLoading";

const ShowCandidatesProfiles = ({ jobId, type }) => {
  const [applicants, setApplicants] = useState([]);
  const [status, setStatus] = useState("all");
  const [totalCount, setTotalCount] = useState(0);
  const [expandedSkills, setExpandedSkills] = useState(null);
  const { loading, setLoading } = useLoading();
  const [val, setVal] = useState(20);
  const pageSize = 12;
  const totalPages = Math.ceil(totalCount / pageSize) || 0;

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

  console.log(applicants, status, "ALL THE AVALIABLE APPLICANTS");

  const fetchApplicants = useCallback(async () => {
    if (!jobId || !type) return;

    const url =
      type === "applications"
        ? `/api/employer/viewjobapplications?jobId=${jobId}&status=${status}&page=${page}&limit=12`
        : `/api/employer/recommendedprofiles?jobId=${jobId}&matching=${val}&page=${page}&limit=12`;

    try {
      const token = await fetchUserToken();
      setLoading(true);
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const { data, totalCount } = await response.json();
      if (!response.ok) throw new Error("Failed to fetch applicants");

      setApplicants(data);
      setTotalCount(totalCount);
    } catch (error) {
      console.error("Failed to fetch applicants:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [jobId, type, val, status, page]);

  // Normal fetch when params change
  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // Refetch when user comes back to this page
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchApplicants();
    };
    const onPageShow = (e) => {
      if (e.persisted) fetchApplicants(); // restored from bfcache
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [fetchApplicants]);

  const handleSatusUpdates = async ({ status, workerId, jobId }) => {
    runWithPending(`updatecandidateInvitestatus-${workerId}`, async () => {
      try {
        console.log(status, workerId, "CHECK THESE 2 VALUES");
        setLoading(true);
        const { workerId: updatedWorkerId } = await fetchUserJobDetails({
          status,
          workerId,
          jobId,
          type,
        });
        console.log(updatedWorkerId, "STATUS UPDATED");
        setApplicants((prev) =>
          prev.filter((applicant) => applicant.userId !== updatedWorkerId),
        );
        setLoading(false);
      } catch (error) {
        console.log(error, "ERROR DATA");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    });
  };

  const getButtonClass = (value) => {
    console.log(value, status, "CHECK THIS VALUE");
    return status === value ? "bg-amber-400" : "bg-gray-500";
  };

  const tabs = [
    { value: "all", label: "All Applications" },
    { value: "accepted", label: "Accepted Applications" },
  ];

  const jobName = applicants[0]?.jobTitle;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* {(loading || applicants.length ===0) && <CandidateCardSkeleton />} */}
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {type === "applications" ? "Applicants":"Recommended Profiles" }
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {totalCount} applicant{totalCount !== 1 ? "s" : ""}
          </p>
        </div>

        {type === "recommendation" && (
          <div className="mt-4">
            <Slider value={val} onChange={setVal} />
          </div>
        )}

        {/* {type === "applications" && (
          <div className="flex gap-2">
            <button
              className={`inline-flex items-center justify-center gap-2 rounded cursor-pointer bg-gray-500 px-3 py-2 text-sm text-white
        disabled:cursor-not-allowed disabled:opacity-50 ${getButtonClass("all")}`}
              onClick={() => {
                setStatus("all");
                setPage(1);
              }}
            >
              All Applications
            </button>
            <button
              className={`inline-flex items-center justify-center gap-2 rounded cursor-pointer bg-gray-500 px-3 py-2 text-sm text-white
        disabled:cursor-not-allowed disabled:opacity-50 ${getButtonClass("accepted")}`}
              onClick={() => {
                setStatus("accepted");
                setPage(1);
              }}
            >
              Accepted Applications
            </button>
          </div>
        )} */}

        {type === "applications" && (
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-pressed={status === tab.value}
                className={`inline-flex items-center justify-center gap-2 rounded cursor-pointer px-3 py-2 text-sm text-white
          disabled:cursor-not-allowed disabled:opacity-50 ${getButtonClass(tab.value)}`}
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {loading || initialLoading ? (
          <div className="mt-2" role="status" aria-busy="true">
            <span className="sr-only">Loading candidates…</span>
            <div className="motion-safe:animate-pulse" aria-hidden="true">
              <CandidateCardSkeleton cards={6} className="md:grid-cols-2" />
            </div>
          </div>
        ) : applicants.length > 0 ? (
          <div className="mt-2">
            <div className="flex mb-5">
              <span className="text-lg font-semibold md:text-xl text-gray-500">
                Job Name:
              </span>
              <h3 className="text-lg font-semibold text-gray-900 md:text-xl">
                {jobName}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {applicants.map((profile) => {
                const isExpanded = expandedSkills === profile?._id;
                const visibleSkills = isExpanded
                  ? profile?.skills
                  : profile?.skills?.slice(0, 3);
                return (
                  // <>

                  <div
                    key={profile?._id}
                    className="rounded-xl relative bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    {" "}
                    {/* Reject */}
                    <button
                      type="button"
                      disabled={isPending(
                        `updatecandidateInvitestatus-${profile.userId}`,
                      )}
                      aria-busy={isPending(
                        `updatecandidateInvitestatus-${profile.userId}`,
                      )}
                      title="Reject application"
                      className="rounded-full cursor-pointer absolute top-2 right-2 p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      onClick={() =>
                        handleSatusUpdates({
                          status: "rejected",
                          workerId: profile.userId,
                          jobId,
                        })
                      }
                    >
                      <X className="h-5 w-5" />
                    </button>
                    {/* Top Section */}
                    <div className="flex gap-4">
                      {/* Profile Image */}
                      <img
                        src={profile?.profileImage}
                        alt={`${profile?.name}'s profile`}
                        className="h-16 w-16 shrink-0 rounded-full object-cover"
                      />

                      {/* Name + Job */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {/* <div className="flex justify-between"> */}
                            <div className="flex items-center gap-1.5">
                              <h2 className="text-lg font-semibold text-gray-900">
                                {profile?.name}
                              </h2>

                              {profile?.isVerified && (
                                <BadgeCheck
                                  className="h-5 w-5 text-white"
                                  fill="blue"
                                />
                              )}
                            </div>
                            {/* </div> */}
                            <div className="flex">
                              <Mail className="h-4 w-4 mt-1 mx-1 shrink-0 text-gray-400" />
                              <p className="mt-0.5 text-sm text-gray-600">
                                {profile?.email}
                              </p>
                            </div>

                            {profile?.mobileNumber?.number && (
                              <div className="flex">
                                <Phone className="h-4 w-4 mt-1 mx-1 shrink-0 text-gray-400" />
                                <p className="mt-0.5 text-sm text-gray-600">
                                  {profile?.mobileNumber?.code}-
                                  {profile?.mobileNumber?.number}{" "}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                              <p className="mt-0.5 text-sm text-gray-600">
                                {profile?.city}, {profile?.state}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Quick Information */}
                    <div className="mt-3">
                      <p className="mt-0.5 text-sm text-gray-600">
                        {profile?.jobTitle}
                      </p>

                      <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                        {profile?.jobCategory}
                      </span>
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-4">
                      {/* Location */}

                      {/* Salary */}
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 shrink-0 text-gray-400" />
                        <span>
                          ₹{profile?.minSalary} - ₹{profile?.maxSalary}/day
                        </span>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-gray-400" />

                        <span>
                          {getJoiningPeriodType(profile?.joiningPeriod)}
                        </span>
                      </div>

                      {/* Shift */}
                      <div className="flex items-center gap-2 col-span-2 mt-2">
                        <Clock className="h-4 w-4 shrink-0 text-gray-400" />

                        <span>
                          {getShiftTypes(profile?.shiftType)}
                          {/* {profile?.shiftType === "full_day"
                          ? "Full Day"
                          : profile?.shiftType} */}
                        </span>
                      </div>
                    </div>
                    {/* Skills */}
                    {profile?.skills?.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-2 text-xs font-medium text-gray-500">
                          Skills
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {visibleSkills?.map((skill) => (
                            <span
                              key={skill?._id}
                              className="rounded-full bg-gray-100 px-3 py-2 text-xs text-gray-700"
                            >
                              {skill?.skill}
                            </span>
                          ))}

                          {profile.skills.length > 3 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedSkills(
                                  isExpanded ? null : profile?._id,
                                )
                              }
                              className="rounded-full px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                            >
                              {isExpanded
                                ? "Show less"
                                : `+${profile.skills.length - 3} more`}
                            </button>
                          )}
                        </div>
                        {/* Matching Rate */}

                        <div className="mt-4">
                          {profile?.matchPercentage !== undefined && (
                            <div className="mb-4 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">
                                Profile Match
                              </span>

                              <div
                                className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                                  getMatchStyle(profile.matchPercentage)
                                    .className
                                }`}
                              >
                                {profile.matchPercentage}%{" "}
                                <span className="font-medium">
                                  {getMatchStyle(profile.matchPercentage).text}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Bottom Actions */}
                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                      {/* Job Invitation Status */}
                      {profile?.applicationAvailable && (
                        <span className="bg-blue-50 text-blue-700 border-blue-700">
                          Job Invitation Sent.
                        </span>
                      )}

                      {/* Status */}
                      {profile?.status && (
                        <button className="rounded-md bg-blue-600 px-2 py-1 text-center text-white">
                          {profile.status}
                        </button>
                      )}

                      <Link
                        className="ml-auto"
                        href={`/employerDashboard/viewjobapplication/${profile.userId}?jobId=${jobId}&type=${type}${
                          type === "recommendation"
                            ? `&matching=${profile.matchPercentage}&jobInvitation=${profile?.applicationAvailable}`
                            : `&status=${status}`
                        }`}
                      >
                        <button
                          type="button"
                          disabled={isPending(
                            `updatecandidateInvitestatus-${profile.userId}`,
                          )}
                          aria-busy={isPending(
                            `updatecandidateInvitestatus-${profile.userId}`,
                          )}
                          title="View application"
                          className="inline-flex items-center justify-center gap-2 cursor-pointer rounded bg-blue-600 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => {
                            if (!profile?.status) {
                              handleSatusUpdates({
                                status: "viewed",
                                workerId: profile?.userId,
                                jobId,
                              });
                            }
                          }}
                        >
                          View Profile
                        </button>
                      </Link>
                    </div>
                  </div>

                  // </>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-medium text-gray-800">
              No Applications Available
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              There are currently no applicants for this job.
            </p>
          </div>
        )}
      </div>
      <Pagination
        onClick={goToPage}
        totalPages={totalPages}
        page={page}
        totalCount={totalCount}
      />
      {/* <div>{loading && <Loading />}</div> */}
    </div>
  );
};

export default ShowCandidatesProfiles;
