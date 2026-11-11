"use client";
import Loading from "@/components/Loading";
import ShowCandidatesProfiles from "@/components/ShowCandidatesProfiles";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

const RecommendedJobProfiles = () => {
  const searchParams = useSearchParams();
  const profileType = searchParams.get("type");
  const jobId = searchParams.get("jobId");

  return <ShowCandidatesProfiles jobId={jobId} type={profileType} />;
};

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <RecommendedJobProfiles />
    </Suspense>
  );
};

export default page;
