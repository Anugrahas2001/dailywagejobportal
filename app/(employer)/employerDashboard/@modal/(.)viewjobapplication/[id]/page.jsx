"use client";
import Modal from "@/components/Modal";
import ViewProfile from "@/components/ViewProfile";
import { useParams, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

const ViewJobApplicationContent = () => {
  const params = useParams();
  const workerId = params.id;
  const searchParams = useSearchParams();

  const jobId = searchParams.get("jobId");
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const matchingRate = searchParams.get("matching");
  const role = localStorage.getItem("role");
  const jobInvitation = searchParams.get("jobInvitation");

  console.log(jobInvitation, "JOB INVITATION DATAA");

  return (
    <Modal
      workerId={workerId}
      jobId={jobId}
      status={status}
      type={type}
      matchingRate={matchingRate}
      role={role}
      jobInvitation={jobInvitation}
    >
      {/* <NavBar /> */}
      <ViewProfile
        workerId={workerId}
        jobId={jobId}
        type={type}
        status={status}
        matchingRate={matchingRate}
        jobInvitation={jobInvitation}
      />
      {/* <Footer /> */}
    </Modal>
  );
};

const page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ViewJobApplicationContent />
    </Suspense>
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
