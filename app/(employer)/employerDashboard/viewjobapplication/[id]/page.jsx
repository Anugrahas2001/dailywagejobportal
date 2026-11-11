"use client";
import Loading from "@/components/Loading";
import ViewProfile from "@/components/ViewProfile";
import { useParams, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

const ViewJobApplication = () => {
  const params = useParams();
  const workerId = params.id;
  const searchParams = useSearchParams();

  const jobId = searchParams.get("jobId");
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const matchingRate = searchParams.get("matching");
  const jobInvitation = searchParams.get("jobInvitation");
  console.log(jobInvitation, "JOB INVITATION DATAA");

  return (
    <ViewProfile
      workerId={workerId}
      jobId={jobId}
      type={type}
      status={status}
      matchingRate={matchingRate}
      jobInvitation={jobInvitation}
    />
  );
};

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ViewJobApplication />
    </Suspense>
  );
};

export default page;
