"use client";

import React from "react";
import {
  EMPLOYER_ONBOARD_STEPS,
  WORKER_ONBOARD_STEPS,
} from "@/constants/constant";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";

const Page = () => {
  const { id } = useParams();
  const role = useSelector((state) => state.user.role);

  const selectedRole = localStorage.getItem("role");
  console.log(selectedRole, "SELECTED ROLE OF THE USER");
  const flow =
    role === "worker" || selectedRole
      ? WORKER_ONBOARD_STEPS
      : EMPLOYER_ONBOARD_STEPS;

  // Access the step using the object key
  const StepComponent = flow[Number(id)];
  console.log(id, StepComponent, "CHECK THE STEP COMPONENT");
  if (!StepComponent) {
    return <div>Invalid onboarding page</div>;
  }

  return (
    <div>
      <StepComponent />
    </div>
  );
};

export default Page;
