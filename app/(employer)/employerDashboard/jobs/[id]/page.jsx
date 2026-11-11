//workerDashboard/jobs/id
"use client";
import JobDetailsPage from "@/components/JobShowDetails";
import Loading from "@/components/Loading";
import { useParams, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

const JobDeatailsContent = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  return <JobDetailsPage role="employer" id={id} isModal={false} type={type} />;
};

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <JobDeatailsContent />
    </Suspense>
  );
};

export default page;
