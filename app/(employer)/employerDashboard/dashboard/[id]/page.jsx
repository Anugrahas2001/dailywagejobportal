"use client";
import jobFetchUseEffcetHook from "@/components/hooks/jobFetchUseEffcetHook";
import JobForm from "@/components/JobForm";
import Loading from "@/components/Loading";
import { useParams } from "next/navigation";
import React from "react";

const page = () => {
  const { id } = useParams();
  const { res } = jobFetchUseEffcetHook(id); // ✅ top level

  if (!res) return <Loading/>;
  console.log(res, "DASHBOARD DASHBOARD employer");

  return (
    <>
      <JobForm mode="Edit" initialData={res} />
      {/* {loading && <Loading />} */}
    </>
  );
};

export default page;
