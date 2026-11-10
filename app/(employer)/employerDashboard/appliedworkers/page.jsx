"use client";
import ShowCandidatesProfiles from "@/components/ShowCandidatesProfiles";
import { useSearchParams } from "next/navigation";
import React from "react";

const page = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const profileType = searchParams.get("type");

  return (
    <>
      <ShowCandidatesProfiles jobId={jobId} type={profileType} />
    </>
  );
};

export default page;
