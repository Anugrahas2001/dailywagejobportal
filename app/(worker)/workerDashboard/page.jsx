"use client"
import DashboardPage from "@/components/DashboardPage";
import React from "react";

const page = () => {

  const role="worker";
  return (
    <div>
      <DashboardPage role={role} />
    </div>
  );
};

export default page;
