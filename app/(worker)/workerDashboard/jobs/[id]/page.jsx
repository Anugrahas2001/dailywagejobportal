"use client";
import JobDetailsPage from "@/components/JobShowDetails";
import Loading from "@/components/Loading";
import { useParams, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

const page = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const params = useParams();
  const id = params?.id;

  return (
    <Suspense fallback={<Loading/>}>
      <JobDetailsPage role="worker" id={id} isModal={true} type={type} />;
    </Suspense>
  );
};

export default page;
