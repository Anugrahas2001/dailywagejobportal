import DashboardPage from "@/components/DashboardPage";
import React from "react";

const page = () => {
  const role = "employer";
  return (
    <>
      <DashboardPage role={role} />
    </>
  );
};

export default page;
