"use client";
import Loading from "@/components/Loading";
import ShowCandidatesProfiles from "@/components/ShowCandidatesProfiles";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

const page = () => {
  const searchParams = useSearchParams();
  const profileType = searchParams.get("type");
  const jobId = searchParams.get("jobId");


  return (
    <Suspense fallback={<Loading/>}>
      <ShowCandidatesProfiles jobId={jobId} type={profileType} />
    </Suspense>
  );
};

export default page;
