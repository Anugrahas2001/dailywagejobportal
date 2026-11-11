"use client";
import Loading from "@/components/Loading";
import ShowCandidatesProfiles from "@/components/ShowCandidatesProfiles";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function AppliedWorkersContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const profileType = searchParams.get("type");

  return <ShowCandidatesProfiles jobId={jobId} type={profileType} />;
}

const page = () => {

  return (
    <Suspense fallback={<Loading />}>
      <AppliedWorkersContent/>
    </Suspense>
  );
};

export default page;
