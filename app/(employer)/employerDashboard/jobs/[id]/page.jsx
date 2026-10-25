//workerDashboard/jobs/id
"use client"
import JobDetailsPage from "@/components/JobShowDetails";
import { useParams } from "next/navigation";
import React from "react";

const page = () => {
    const { id } = useParams();
  return <JobDetailsPage role="employer" id={id} isModal={false}/>;
};

export default page;
