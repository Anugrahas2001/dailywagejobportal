// "use client";
// import {
//   EMPLOYER_ONBOARD_STEPS,
//   WORKER_ONBOARD_STEPS,
// } from "@/constants/constant";
// import { useParams } from "next/navigation";
// import React from "react";

// const page = () => {
//   const { role, id } = useParams();
//   console.log(role, id, "CHECK THE ONBOARDING PAGE");

//   const flow =
//     role === "worker" ? WORKER_ONBOARD_STEPS : EMPLOYER_ONBOARD_STEPS;

//   console.log(Number(id) - 1, id,"  WHAT IS THIS VALUE");
//   const StepComponent = flow[Number(id)];
//   console.log(StepComponent, "CHECK THIS");
//   if (!StepComponent) {
//     throw new Error("Invalid onbaording page");
//   }

//   return (
//     <div>
//       <StepComponent />
//     </div>
//   );
// };

// export default page;

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
  console.log(role, "USER ROLE DATA");

  const flow =
    role === "worker" ? WORKER_ONBOARD_STEPS : EMPLOYER_ONBOARD_STEPS;

  // Access the step using the object key
  const StepComponent = flow[Number(id)];

  if (!StepComponent) {
    return <div>Invalid onboarding page</div>;
    // or use notFound() if appropriate
  }

  return (
    <div>
      <StepComponent />
    </div>
  );
};

export default Page;
