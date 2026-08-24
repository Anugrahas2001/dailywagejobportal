"use client";

import { fetchUserJobDetails } from "@/components/commonFunctions";
import Loading from "@/components/Loading";
import { fetchUserToken } from "@/lib/fetchUserToken";
import { BadgeCheck, MapPin, Wallet, Clock, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [applicants, setApplicants] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedSkills, setExpandedSkills] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  console.log(status, "==========");
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  useEffect(() => {
    if (!jobId) return;

    const handleApplicantsProfiles = async () => {
      try {
        const token = await fetchUserToken();
        setLoading(true);
        const response = await fetch(
          `/api/employer/viewjobapplications?jobId=${jobId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch applicants");
        }

        const { data, totalCount } = await response.json();

        console.log(data, totalCount, "TELL ME ABOT APPLICANTS");
        setApplicants(data);
        setTotalCount(totalCount);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch applicants:", error);
      } finally {
        setLoading(false);
      }
    };

    handleApplicantsProfiles();
  }, []);

  // const handleJobApplicationStatus = async (e, { workerId, jobId }) => {
  //   const statusVal = e.target.value;
  //   console.log(statusVal, "CURRENT STTAU VAL");
  //   setStatus(statusVal);

  //   console.log("Inside the update FUNCTION");
  //   console.log("Selected status:", status);

  //   try {
  //     console.log(jobId, "JOB ID INSIDE THE UPDATE");
  //     setLoading(true);
  //     const data = await fetchUserJobDetails({
  //       workerId,
  //       jobId,
  //       status: statusVal,
  //     });
  //     // setStatus(data?.status);
  //     // router.push(`/employerDashboard/appliedworkers?jobId=${jobId}`);
  //     setLoading(false);
  //   } catch (error) {
  //     console.log(error, "ERROR DATA");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSatusUpdates = async ({ status, workerId, jobId }) => {
    try {
      setLoading(true);
      await fetchUserJobDetails({ status, workerId, jobId });
      setLoading(false);
    } catch (error) {
      console.log(error, "ERROR DATA");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Applicants</h1>

          <p className="mt-1 text-sm text-gray-500">
            {totalCount} applicant{totalCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Applicants */}
        {applicants.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {applicants.map((profile) => {
              const isExpanded = expandedSkills === profile?._id;

              const visibleSkills = isExpanded
                ? profile?.skills
                : profile?.skills?.slice(0, 3);

              return (
                <div
                  key={profile?._id}
                  className="rounded-xl relative bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  {" "}
                  {/* Reject */}
                  <button
                    type="button"
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

                          <p className="mt-0.5 text-sm text-gray-600">
                            {profile?.jobTitle}
                          </p>

                          <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                            {profile?.jobCategory}
                          </span>
                        </div>

                        {/* Reject
                        <button
                          type="button"
                          title="Reject application"
                          className="rounded-full cursor-pointer p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <X className="h-5 w-5" />
                        </button> */}
                      </div>
                    </div>
                  </div>
                  {/* Quick Information */}
                  <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2">
                    {/* Location */}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>
                        {profile?.city}, {profile?.state}
                      </span>
                    </div>

                    {/* Salary */}
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>
                        ₹{profile?.minSalary} - ₹{profile?.maxSalary}/day
                      </span>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-gray-400" />

                      <span>
                        {profile?.joiningPeriod === "immediate"
                          ? "Available immediately"
                          : profile?.joiningPeriod}
                      </span>
                    </div>

                    {/* Shift */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-gray-400" />

                      <span>
                        {profile?.shiftType === "full_day"
                          ? "Full Day"
                          : profile?.shiftType}
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
                            className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
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
                    </div>
                  )}
                  {/* Bottom Actions */}
                  <div className="mt-5 flex items-center justify-between border-t pt-4">
                    {/* View Profile */}
                    <Link
                      href={`/employerDashboard/viewjobapplication/${profile.userId}?jobId=${jobId}`}
                    >
                      <button
                        type="button"
                        className="rounded-md border cursor-pointer border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-100"
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

                    {/* Status */}

                    {profile?.status ? (
                      <button className="bg-blue-600 text-white text-center px-2 py-1 rounded-md">
                        {profile?.status}
                      </button>
                    ) : (
                      <></>
                    )}
                    {/* <select
                      value={status}
                      onChange={(e) =>
                        handleJobApplicationStatus(e, {
                          workerId: profile?.userId,
                          jobId,
                        })
                      }
                      className={`rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 {${profile?.status || status}
      ? "border-blue-300 bg-blue-50 text-blue-700"
      : "border-gray-300 bg-white text-gray-700"}`}
                    >
                      <option value="viewed">Viewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select> */}
                  </div>
                </div>
              );
            })}
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
      <div>{loading && <Loading />}</div>
    </div>
  );
};

export default Page;
