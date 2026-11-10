"use client";
import DashboardPage from "@/components/DashboardPage";
import React from "react";

const page = () => {
  const role = "worker";
  return (
    <>
      <DashboardPage role={role} />
    </>
  );
};

export default page;
