"use client";
import ViewProfile from "@/components/ViewProfile";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";

const page = () => {
  const params = useParams();
  const workerId = params.id;
  const searchParams = useSearchParams();
  console.log("JOB ID:", searchParams.get("jobId"));

  const jobId = searchParams.get("jobId");
  const type = searchParams.get("type");
  const matchingRate = searchParams.get("matching");
  console.log(workerId, matchingRate, type, "INSIDE OF THE CODE 33333");

  return (
    <ViewProfile
      workerId={workerId}
      jobId={jobId}
      type={type}
      matchingRate={matchingRate}
    />
  );
};

export default page;
