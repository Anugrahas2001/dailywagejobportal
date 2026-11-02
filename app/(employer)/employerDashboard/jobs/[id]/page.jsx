//workerDashboard/jobs/id
"use client"
import JobDetailsPage from "@/components/JobShowDetails";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";

const page = () => {
    const { id } = useParams();
    const searchParams = useSearchParams();
      const type = searchParams.get("type");
      console.log(type,id, "CHECK OUT THIS VALUE");
  return <JobDetailsPage role="employer" id={id} isModal={false} type={type} />;
};

export default page;
