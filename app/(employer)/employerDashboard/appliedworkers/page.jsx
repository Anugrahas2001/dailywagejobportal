"use client";
import { fetchUserToken } from "@/lib/fetchUserToken";
import { BadgeCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const page = () => {
  const [applicants, setApplicants] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showAllSkills, setShowAllSkills] = useState(false);

  const searchParams = useSearchParams();

  const jobId = searchParams.get("jobId");

  console.log(jobId);
  useEffect(() => {
    const handleAppplicantsProfiles = async () => {
      const token = await fetchUserToken();
      const resposne = await fetch(
        `/api/employer/viewjobapplications?jobId=${jobId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!resposne.ok) {
        console.log("Failed to fetch all the profiles");
      }
      const { data, totalCount } = await resposne.json();
      setApplicants(data);
      setTotalCount(totalCount);
    };
    handleAppplicantsProfiles();
  }, []);

  console.log(applicants, "ALL THE APPLICANTS PROFILES");
  console.log(totalCount, "TOTAL COUNT DATA");

  return (
    <div className="bg-gray-100">
      {applicants.length > 0 &&
        applicants.map((profile) => {
          return (
            <div
              className="bg-red-400 grid grid-cols-4 gap 2 mx-4"
              key={profile?._id}
            >
              <div className="flex flex-col rounded-md p-4">
                <div className="flex bg-amber-300 justify-center items-center">
                  <img
                    src={profile?.profileImage}
                    alt="user-profile"
                    className="w-18 h-14 rounded-full"
                  />
                </div>

                <div className="flex flex-col">
                  <h1 className="flex gap-1">
                    {profile?.name}{" "}
                    {profile?.isVerified && <BadgeCheck fill="blue" />}
                  </h1>

                  <p>{profile?.jobTitle}</p>
                  <p>{profile?.jobCategory}</p>
                </div>
                <h2>
                  {profile?.city}, {profile?.state}
                </h2>
                <p>
                  {profile?.minSalary} - {profile?.maxSalary}/day
                </p>
                <p>{profile?.joiningPeriod}</p>
                <div className="flex flex-wrap gap-2">
                  {(showAllSkills
                    ? profile?.skills
                    : profile?.skills?.slice(0, 3)).map((skill) => (
                        <button
                          key={skill._id}
                          className="rounded-full bg-gray-100 px-2 py-1 text-xs"
                        >
                          {skill.skill}
                        </button>
                      ))}

                  {profile?.skills?.length > 3 && (
                    <button
                      className="text-xs text-gray-500"
                      onClick={() => setShowAllSkills((prev) => !prev)}
                    >
                      {showAllSkills
                        ? "Show less"
                        : `+${profile.skills.length - 3} more`}
                    </button>
                  )}
                </div>

                <div className="border-t mt-3">
                  <select></select>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default page;
