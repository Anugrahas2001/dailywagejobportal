"use client";
import Modal from "@/components/Modal";
import NavBar from "@/components/NavBar";
import ViewProfile from "@/components/ViewProfile";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";
import { Footer } from "react-day-picker";

const page = () => {
  const params = useParams();
  const workerId = params.id;
  const searchParams = useSearchParams();

  // console.log("FULL URL:", window.location.href);
  // console.log("SEARCH PARAMS:", searchParams.toString());
  console.log("JOB ID:", searchParams.get("jobId"));

  const jobId = searchParams.get("jobId");
  console.log(workerId, "INSIDE OF THE CODE");
  const role = localStorage.getItem("role");

  return (
    <Modal workerId={workerId} jobId={jobId} role={role}>
      <NavBar />
      <ViewProfile workerId={workerId} jobId={jobId} />
      <Footer />
    </Modal>
  );
};

export default page;
