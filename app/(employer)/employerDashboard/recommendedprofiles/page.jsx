// "use client";
// import { fetchUserToken } from "@/lib/fetchUserToken";
// import { useParams, useSearchParams } from "next/navigation";
// import React, { useEffect, useState } from "react";

// const page = () => {
//   const { id } = useParams();
//   console.log(id, "CHECK THIS");
//   const searchparams = useSearchParams();
//   const profiletype = searchparams.get("type");
//   console.log(profiletype, "CHECK THE PROFILE TYPE");
//   const [profiles, setprofiles] = useState([]);

//   const handleRecommendedJobProfiles = async (id) => {
//     try {
//       console.log(id, "JOB ID VALUE");
//       const token = await fetchUserToken();
//       const response = await fetch(
//         `/api/employer/recommendedprofiles/${id}?page=1&limit=12`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       console.log("Status:", response.status);
//       console.log("Content-Type:", response.headers.get("content-type"));

//       const result = await response.json();
//       console.log(result, "RESULT DATA FROM RECOMMENDATION");
//     } catch (error) {
//       console.log(error, "Error while fetching the recommended job profiles.");
//     }
//   };

//   useEffect(() => {
//     if (id) {
//       handleRecommendedJobProfiles(id);
//     }
//   }, [id]);

//   return <div>page</div>;
// };

// export default page;

"use client";
import ShowCandidatesProfiles from "@/components/ShowCandidatesProfiles";
import { useSearchParams } from "next/navigation";
import React from "react";

const page = () => {
  const searchParams = useSearchParams();
  const profileType = searchParams.get("type");
  const jobId = searchParams.get("jobId");
  // const rate=searchParams.get("matching");
  console.log(jobId, profileType, "==============$$$$$@@@@%%%&&&&&");

  return (
    <div>
      <ShowCandidatesProfiles jobId={jobId} type={profileType}/>
    </div>
  );
};

export default page;
