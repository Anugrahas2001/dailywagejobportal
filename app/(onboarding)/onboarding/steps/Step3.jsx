"use client";

import Button from "@/components/Button";
import ErrorMessage from "@/components/Error";
import useControls from "@/components/hooks/useControls";
import Step3Skeleton from "@/components/skeltons/Step3Skeleton";
import { EXPERIENCE_LEVELS, JOB_SKILLS } from "@/constants/constant";
import { clearOnboardingError } from "@/lib/features/profiles/userSlice";
import { step3Onboarding } from "@/lib/features/profiles/userThunk";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useSelector } from "react-redux";

const MIN_SKILLS = 3;
const MAX_SKILLS = 8;
const MAX_BIO_LENGTH = 500; // matches maxlength in the Mongoose schema

const Step3 = () => {
  const [skills, setSkills] = useState([]);
  const [skill, setSkill] = useState("");
  const [experience, setExperience] = useState(EXPERIENCE_LEVELS.BEGINNER);
  const [bio, setBio] = useState("");
  const [formError, setFormError] = useState("");
  const searchParams = useSearchParams();
  const jobCategory = searchParams.get("category");
  const status = useSelector((state) => state.user.status);
  const error = useSelector((state) => state.user.error);

  const { router, dispatch } = useControls();

  const skillsRequired = JOB_SKILLS[jobCategory] || [];

  const handleSkillCreation = () => {
    const name = skill.trim();
    setFormError("");

    if (!name) {
      setFormError("Select or enter a skill first.");
      return;
    }

    if (skills.length >= MAX_SKILLS) {
      setFormError(`You can add up to ${MAX_SKILLS} skills.`);
      return;
    }

    const alreadyAdded = skills.some(
      (s) => s.skill.toLowerCase() === name.toLowerCase(),
    );
    if (alreadyAdded) {
      setFormError(`"${name}" is already in your list.`);
      return;
    }

    setSkills((prev) => [...prev, { skill: name, experience }]);
    setSkill("");
    setExperience(EXPERIENCE_LEVELS.BEGINNER);
  };

  const handleDelete = (index) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // Moves the skill back into the inputs so the user can change it and re-add it
  const handleEdit = (index) => {
    const item = skills[index];
    setSkill(item.skill);
    setExperience(item.experience);
    handleDelete(index);
  };

  const handleSubmission = async () => {
    setFormError("");

    if (skills.length < MIN_SKILLS) {
      setFormError(
        `Please add at least ${MIN_SKILLS} skills before continuing.`,
      );
      return;
    }

    if (skills.length > MAX_SKILLS) {
      setFormError(`You can select only ${MAX_SKILLS} skills.`);
      return;
    }

    try {
      const { result } = await dispatch(
        step3Onboarding({ body: { bio, skills } }),
      ).unwrap();

      router.push(`/onboarding/${result.onboardPage}`);
    } catch (err) {
      // The error is already stored in redux (state.user.error) and shown
      // by <ErrorMessage />, so this just prevents an unhandled rejection.
      console.error("Step 3 onboarding failed:", err);
    }
  };

  if (status === "pending") {
    return <Step3Skeleton />;
  }

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
        <label htmlFor="bio" className="font-semibold">
          Bio
        </label>
        <textarea
          id="bio"
          placeholder="Tell employers about yourself..."
          className="w-full rounded-lg border px-2 py-3 resize-none"
          rows={4}
          maxLength={MAX_BIO_LENGTH}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <p className="text-right text-xs text-gray-400">
          {bio.length}/{MAX_BIO_LENGTH}
        </p>
      </div>

      {/* Skills */}
      <div className="space-y-4 px-4">
        <label className="font-semibold">Add Skill</label>

        {skillsRequired.length > 0 && (
          <div className="md:col-span-2 mt-4">
            <p className="mb-2 block text-sm font-medium">Required Skills</p>

            <div className="flex flex-wrap gap-2 w-full mt-4">
              {skillsRequired.map((item) => (
                <button
                  key={item}
                  onClick={() => setSkill(item)}
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm transition cursor-pointer ${
                    skill === item
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lets the user add a skill that isn't in the suggested list */}
        <input
          type="text"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="Or type your own skill"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />

        <div className="px-4">
          <p className="mb-3 font-medium">Experience Level</p>

          <div className="flex flex-wrap gap-5">
            {/* EXPERIENCE_LEVELS is an object, so iterate over its entries.
                key = BEGINNER, value = "Beginner" (the value is what the DB stores) */}
            {Object.entries(EXPERIENCE_LEVELS).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="experience"
                  value={value}
                  checked={experience === value}
                  onChange={(e) => setExperience(e.target.value)}
                />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          onClick={handleSkillCreation}
        >
          + Add Skill
        </button>

        {formError && <p className="text-sm text-red-500">{formError}</p>}
      </div>

      {/* Cards */}
      {skills.length > 0 && (
        <div className="rounded-lg m-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {skills.map((item, index) => (
            <div key={item.skill} className="rounded-lg border">
              <div className="flex justify-center pt-3">
                <h2>Skill:</h2>
                <h2 className="mx-2">{item.skill}</h2>
              </div>
              <div className="flex justify-center">
                <h2>Experience:</h2>
                <h2 className="mx-2">{item.experience}</h2>
              </div>
              <div className="flex justify-center gap-2 m-3">
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-gray-500">
        {skills.length}/{MAX_SKILLS} skills added (minimum {MIN_SKILLS})
      </p>

      <div className="flex justify-center w-full">
        <Button
          loadingText="Submitting..."
          loading={status === "pending"}
          onClick={handleSubmission}
        >
          Submit
        </Button>
      </div>

      {error && (
        <ErrorMessage
          error={error}
          onClick={() => dispatch(clearOnboardingError())}
        />
      )}
    </div>
  );
};

export default Step3;
