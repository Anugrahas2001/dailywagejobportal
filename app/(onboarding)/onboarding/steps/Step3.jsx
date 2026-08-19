"use client";

import Loading from "@/components/Loading";
import { EXPERIENCE_LEVELS, JOB_SKILLS } from "@/constants/constant";
import { step3Onboarding } from "@/lib/features/profiles/userThunk";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Step3 = () => {
  const [skills, setSkills] = useState([]);
  const [skill, setSkill] = useState("");
  const [experience, setExperience] = useState("Beginner");
  const [bio, setBio] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobCategory = searchParams.get("category");
  const dispatch = useDispatch();
  const status = useSelector((state) => state.user.status);

  const skillsRequired = JOB_SKILLS[jobCategory] || [];

  console.log(skillsRequired, "CHECK THE VALUES");

  const handleSkillCreation = () => {
    if (!skill.trim()) return;

    setSkills((prev) => [
      ...prev,
      {
        skill: skill.trim(),
        experience,
      },
    ]);

    setSkill("");
    setExperience("Beginner");
  };

  const handleSubmission = async () => {
    const data = {
      bio,
      skills,
    };
    const { onboardPage } = await dispatch(
      step3Onboarding({ body: data }),
    ).unwrap();
    router.push(`/onboarding/${onboardPage}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="mb-8 mt-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Tell Us About Your Skills
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-500">
          Tell us about yourself and highlight your skills to help employers
          better understand your experience and expertise.
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2 mx-5">
        <label className="font-semibold">Bio</label>
        <textarea
          placeholder="Tell employers about yourself..."
          className="w-full rounded-lg border px-2 py-3 resize-none"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      {/* Skills */}
      <div className="space-y-4 px-4">
        <label className="font-semibold">Add Skill</label>

        <div className="md:col-span-2 mt-4">
          <label className="mb-2 block text-sm font-medium">
            Required Skills
          </label>

          <div className="flex flex-wrap gap-2 w-full mt-4">
            {/* <ul> */}
            {skillsRequired.map((item) => (
              <button
                key={item}
                onClick={() => setSkill(item)}
                type="button"
                className={`rounded-full border px-4 py-2 text-sm transition cursor-pointer
    ${
      skill === item
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-gray-700 hover:bg-blue-50"
    }
  `}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4">
          <p className="mb-3 font-medium">Experience Level</p>

          <div className="flex flex-wrap gap-5">
            {EXPERIENCE_LEVELS.map((level) => (
              <label
                key={level}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="experience"
                  value={level}
                  checked={experience === level}
                  onChange={(e) => setExperience(e.target.value)}
                />
                <span>{level}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          onClick={handleSkillCreation}
        >
          + Add Skill
        </button>
      </div>
      {/* Cards */}
      {skills.length > 0 && (
        <div className="rounded-lg m-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill, index) => (
            <div key={index} className="rounded-lg border p-4 bg-amber-50">
              <div className="flex justify-center text-lg pt-3">
                <h2>Skill:</h2>
                <h2 className="mx-2">{skill.skill}</h2>
              </div>
              <div className="flex justify-center text-lg">
                <h2>Experience:</h2>
                <h2 className="mx-2">{skill.experience}</h2>
              </div>
              <div className="flex justify-center gap-2 m-3">
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">
                  Edit
                </button>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center w-full">
        <button
          disabled={status === "pending"}
          type="submit"
          onClick={handleSubmission}
          className="w-72 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {status === "pending" ? "Submitting..." : "Submit"}
        </button>
      </div>
      {status === "pending" && <Loading />}
    </div>
  );
};

export default Step3;
