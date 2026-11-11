"use client";
import Loading from "@/components/Loading";
import ShowCandidatesProfiles from "@/components/ShowCandidatesProfiles";
import { useSearchParams } from "next/navigation";
import React from "react";

const page = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const profileType = searchParams.get("type");

  return (

    <Suspense fallback={<Loading/>}>
      <ShowCandidatesProfiles jobId={jobId} type={profileType} />
    </Suspense>
  );
};

export default page;
