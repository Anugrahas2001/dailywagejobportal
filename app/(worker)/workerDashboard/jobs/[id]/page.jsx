"use client";
import JobDetailsPage from "@/components/JobShowDetails";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";

const page = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const params = useParams();
  const id = params?.id;

  return <JobDetailsPage role="worker" id={id} isModal={true} type={type} />;
};

export default page;
