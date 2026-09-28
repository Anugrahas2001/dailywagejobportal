"use client";
import ViewProfile from "@/components/ViewProfile";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";

const page = () => {
  const params = useParams();
  const workerId = params.id;
  const searchParams = useSearchParams();

  const jobId = searchParams.get("jobId");
  const type = searchParams.get("type");
  const matchingRate = searchParams.get("matching");
  const jobInvitation = searchParams.get("jobInvitation");

  return (
    <ViewProfile
      workerId={workerId}
      jobId={jobId}
      type={type}
      matchingRate={matchingRate}
      jobInvitation={jobInvitation}
    />
  );
};

export default page;
