"use client";
import ViewProfile from "@/components/ViewProfile";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";

const page = () => {
  const params = useParams();
  const workerId = params.id;
  const searchParams = useSearchParams();

  // console.log("FULL URL:", window.location.href);
  // console.log("SEARCH PARAMS:", searchParams.toString());
  console.log("JOB ID:", searchParams.get("jobId"));

const jobId = searchParams.get("jobId");
  console.log(workerId, "INSIDE OF THE CODE");

  return <ViewProfile workerId={workerId} jobId={jobId} />;
};

export default page;
