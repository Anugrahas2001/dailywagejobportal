"use client";
import jobFetchUseEffcetHook from "@/components/hooks/jobFetchUseEffcetHook";
import JobForm from "@/components/JobForm";
import Loading from "@/components/Loading";
import React from "react";

const page = () => {
  const {loading,job}=jobFetchUseEffcetHook();

  return (
    <>
      <JobForm mode="Edit" initialData={job} />
      {loading && <Loading />}
    </>
  );
};

export default page;
