"use client";
import JobDetailsPage from "@/components/JobShowDetails";
import { useSearchParams } from "next/navigation";
import React from "react";

const page = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  console.log(type, "CHECK OUT THIS VALUE");
  return <JobDetailsPage role="worker" isModal={true} type={type} />;
};

export default page;
