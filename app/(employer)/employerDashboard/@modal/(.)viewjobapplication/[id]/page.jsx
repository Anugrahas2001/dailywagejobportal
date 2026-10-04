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
  console.log("JOB ID:", searchParams.get("jobId"));

  const jobId = searchParams.get("jobId");
  const type = searchParams.get("type");
  const matchingRate = searchParams.get("matching");
  const role = localStorage.getItem("role");
  const jobInvitation = searchParams.get("jobInvitation");

  console.log(
    jobId,
    workerId,
    type,
    matchingRate,
    jobInvitation,
    "FROM THE MODAL DATA",
  );

  return (
    <Modal
      workerId={workerId}
      jobId={jobId}
      type={type}
      matchingRate={matchingRate}
      role={role}
    >
      <NavBar />
      <ViewProfile
        workerId={workerId}
        jobId={jobId}
        type={type}
        matchingRate={matchingRate}
        jobInvitation={jobInvitation}
      />
      <Footer />
    </Modal>
  );
};

export default page;



// "use client";
// import Modal from "@/components/Modal";
// import NavBar from "@/components/NavBar";
// import ViewProfile from "@/components/ViewProfile";
// import Footer from "@/components/Footer"; // see note 2
// import { useParams, useSearchParams } from "next/navigation";
// import React, { useEffect, useState } from "react";

// const Page = () => {
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const [role, setRole] = useState(null);

//   const workerId = params.id;
//   const jobId = searchParams.get("jobId");
//   const type = searchParams.get("type");
//   const matchingRate = searchParams.get("matching");
//   const jobInvitation = searchParams.get("jobInvitation");

//   useEffect(() => {
//     setRole(localStorage.getItem("role")); // see note 1
//   }, []);

//   const content = (
//     <>
//       <NavBar />
//       <ViewProfile
//         workerId={workerId}
//         jobId={jobId}
//         type={type}
//         matchingRate={matchingRate}
//         jobInvitation={jobInvitation}
//       />
//       <Footer />
//     </>
//   );

//   if (type === "recommendation") {
//     return (
//       <Modal
//         workerId={workerId}
//         jobId={jobId}
//         type={type}
//         matchingRate={matchingRate}
//         role={role}
//       >
//         {content}
//       </Modal>
//     );
//   }

//   return content;
// };

// export default Page;