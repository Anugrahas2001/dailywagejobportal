"use client";
import ShowCandidatesProfiles from "@/components/ShowCandidatesProfiles";
import { useSearchParams } from "next/navigation";
import React from "react";

const page = () => {
  const searchParams = useSearchParams();
  const profileType = searchParams.get("type");
  const jobId = searchParams.get("jobId");

  return (
    <div>
      <ShowCandidatesProfiles jobId={jobId} type={profileType}/>
    </div>
  );
};

export default page;
