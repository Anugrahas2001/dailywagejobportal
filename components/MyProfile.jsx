"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  Camera,
  Clock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  Star,
  Tag,
  Wallet,
  X,
} from "lucide-react";
import { fetchUserToken } from "@/lib/fetchUserToken";
import {
  EXPERIENCE_LEVELS,
  JOB_SKILLS,
  JOINING_TYPE_VALUES,
  SALARY_CREDIT_TYPES,
  SHIFT_TYPE_VALUES,
} from "@/constants/constant";

/* ---------- helpers ---------- */

const getAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return age >= 0 ? age : null;
};

const formatINR = (n) =>
  typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : null;

const formatSalary = (min, max) => {
  const a = formatINR(Number(min));
  const b = formatINR(Number(max));
  if (a && b) return `${a} – ${b}`;
  return a || b || null;
};

const progressColor = (pct) =>
  pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-indigo-600" : "bg-amber-500";

/* ---------- small building blocks ---------- */

const Card = ({ children, className = "" }) => (
  <section
    className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
  >
    {children}
  </section>
);

const SectionHeader = ({ title, subtitle, onEdit, editLabel }) => (
  <div className="flex items-start justify-between gap-3">
    <div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
    </div>
    <button
      type="button"
      onClick={onEdit}
      aria-label={editLabel}
      className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
    >
      <Pencil className="h-5 w-5" />
    </button>
  </div>
);

// const InfoRow = ({ icon: Icon, label, value, breakAll = false }) => (
//   <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
//     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
//       <Icon className="h-5 w-5" />
//     </div>
//     <div className="min-w-0">
//       <p className="text-sm text-gray-500">{label}</p>
//       <p
//         className={`mt-0.5 font-medium text-gray-900 ${breakAll ? "break-all" : ""}`}
//       >
//         {value || <span className="text-gray-400">Not added</span>}
//       </p>
//     </div>
//   </div>
// );

const Stat = ({ value, label }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
    <p className="text-2xl font-bold text-gray-900">{value ?? "–"}</p>
    <p className="mt-1 text-sm text-gray-500">{label}</p>
  </div>
);

const Skeleton = () => (
  <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-5xl animate-pulse space-y-5">
      <div className="h-64 rounded-2xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="h-24 rounded-2xl bg-gray-200" />
      <div className="h-40 rounded-2xl bg-gray-200" />
    </div>
  </main>
);

/* ---------- page ---------- */

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [editedText, setEditedText] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([
    {
      skill: "",
      experience: "",
    },
  ]);
  const [skill, setSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [preferences, setPreferences] = useState({
    jobTitle: "Frontend Developer",
    jobCategory: "", // should match one of the JOB_SKILLS options
    locRange: 10, // number (type: "number")
    joiningPeriod: "", // should match one of the JOINING_TYPES options
    shiftType: "", // should match one of the SHIFT_TYPES options
    minSalary: 400, // replaces the old single `salary` field
    maxSalary: 800,
    salaryCreditType: "", // should match one of the SALARY_CREDIT_TYPES options
  });
  const [draft, setDraft] = useState(preferences);
  console.log(draft, "DRAFT VALUE OF PREFERENCES");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await fetchUserToken();
        const res = await fetch("/api/common/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const { data } = await res.json();
        setProfile(data);
        setStatus("ready");
      } catch (err) {
        console.error("Profile load failed:", err);
        setStatus("error");
      }
    };

    loadProfile();
  }, []);

  const user = profile?.user;
  const pref = profile?.preference;

  const preferenceItems = useMemo(
    () => [
      {
        icon: Briefcase,
        label: "Job title",
        value: pref?.jobTitle,
        type: "text",
        key: "jobtitle",
      },
      {
        icon: Tag,
        label: "Job category",
        value: pref?.jobCategory,
        type: "select",
        options: JOB_SKILLS[pref?.jobCategory],
        key: "jobcategory",
      },
      {
        icon: MapPin,
        label: "Location range",
        value: pref?.locRange,
        type: "number",
        key: "locRange",
      },
      {
        icon: Clock,
        label: "Joining period",
        value: pref?.joiningPeriod,
        type: "select",
        options: JOINING_TYPE_VALUES,
        key: "joiningperiod",
      },
      {
        icon: Clock,
        label: "Shift type",
        value: pref?.shiftType,
        type: "select",
        options: SHIFT_TYPE_VALUES,
        key: "shifttype",
      },
      {
        icon: Wallet,
        label: "Expected salary",
        value: formatSalary(pref?.minSalary, pref?.maxSalary),
        type: "range",
        keys: ["minSalary", "maxSalary"],
      },
      {
        icon: Star,
        label: "Salary Credit Type",
        value: pref?.salaryCreditType,
        type: "text",
        options: SALARY_CREDIT_TYPES,
      },
    ],
    [pref],
  );

  if (status === "loading" && !profile) return <Skeleton />;

  if (status === "error" && !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="font-semibold text-gray-900">
            We couldn't load your profile
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => load()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        </div>
      </main>
    );
  }

  const age = getAge(user?.dob);
  const bio = user?.bio;
  const location = [user?.city, user?.state].filter(Boolean).join(", ");
  const salary = formatSalary(pref?.minSalary, pref?.maxSalary);
  const completeness = profile?.profileCompleteness ?? 0;
  const phone = user?.mobileNumber
    ? `${user.mobileNumber.code ?? ""}-${user.mobileNumber.number ?? ""}`.trim()
    : null;
  const skills = user?.skills ?? [];
  // const rating = profile?.stats?.rating; // optional – see API notes
  // const ratingCount = profile?.stats?.ratingCount;
  // const jobsDone = profile?.stats?.jobsDone;
  const missing = profile?.missingFields ?? []; // optional – see API notes

  const handleEditBio = () => {
    setEditedText(bio);
    setIsEditing("bio");
  };

  const handleCancelBio = () => {
    setEditedText(bio);
    setIsEditing("");
  };

  const handleSaveBio = () => {
    // API CALL
    console.log(editedText, "THIS IS THE EDITED TEXT");
    setProfile((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        bio: editedText.trim(),
      },
    }));

    setIsEditing("");
  };

  const handleRemoveSkills = (skillVal) => {
    console.log(skillVal, "SKILL TO REMOVE");
    setProfile((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        skills: skills.filter((s) => s.skill !== skillVal),
      },
    }));
  };

  const handleSkillEdit = (jobCat) => {
    setEditedText("skills");
    const skillsReq = JOB_SKILLS[jobCat];
    console.log(skillsReq, jobCat, "=========================");
    setRequiredSkills(skillsReq);
  };

  const handleSkillCreation = () => {
    if (!skill.trim()) return;

    setProfile((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        skills: [
          ...(prev.user.skills || []),
          { skill: skill.trim(), experience },
        ],
      },
    }));

    setSkill("");
    setExperience("");
  };

  const handleJobPrefEdit = () => {
    setDraft(preferences); // start from the saved values
    setIsEditing("jobpref");
  };

  const handleChange = (key, val) =>
    setDraft((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setPreferences(draft); // or call your API here
    setIsEditing("");
  };

  const handleCancel = () => setIsEditing("");

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600";

  const InfoRow = ({ field, value, isEditing, onChange }) => {
    const Icon = field.icon;

    const renderEditor = () => {
      switch (field.type) {
        case "select":
          return (
            <select
              className={inputClass}
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
            >
              <option value="">Select…</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          );
        case "number":
          return (
            <input
              type="number"
              className={inputClass}
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          );
        default:
          return (
            <input
              type="text"
              className={inputClass}
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          );
      }
    };

    return (
      <div className="flex items-start gap-3">
        <Icon className="mt-1 h-5 w-5 text-gray-400" />
        <div className="min-w-0 flex-1">
          <label className="text-sm text-gray-500">{field.label}</label>
          {isEditing ? (
            renderEditor()
          ) : (
            <p className="mt-0.5 font-medium text-gray-900">{value || "—"}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-4xl font-bold text-white ring-4 ring-indigo-50">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={
                    user.name ? `${user.name}'s profile photo` : "Profile photo"
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <span aria-hidden="true">
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.name || "Your name"}
              </h1>
              {user?.isVerified && (
                <BadgeCheck
                  className="h-6 w-6 fill-blue-500 text-white"
                  aria-label="Verified profile"
                />
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-gray-500">
              {pref?.jobTitle && (
                <span className="font-medium capitalize text-gray-700">
                  {pref.jobTitle}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {location}
                </span>
              )}
              {age !== null && <span>{age} yrs old</span>}
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm">
              {/* {typeof rating === "number" && (
                <span className="flex items-center gap-1 text-gray-600">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <strong className="text-gray-900">{rating.toFixed(1)}</strong>
                  {ratingCount != null && <span>({ratingCount} reviews)</span>}
                </span>
              )} */}
              {salary && (
                <span className="font-semibold text-green-600">{salary}</span>
              )}
            </div>

            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <Camera className="h-4 w-4" /> Change photo
            </button>
          </div>
        </Card>
        <Card>
          <SectionHeader
            title="Bio"
            subtitle="Tell employers a little about yourself and your work."
            editLabel="Edit bio"
            onEdit={handleEditBio}
          />
          {isEditing === "bio" ? (
            <>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full rounded-lg border border-gray-200 p-3"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="cancel Bio"
                  onClick={handleCancelBio}
                  className="bg-gray-600 text-white p-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  aria-label="Save Bio"
                  onClick={handleSaveBio}
                  className="bg-blue-500 text-white p-2 rounded-md"
                >
                  Save
                </button>
              </div>
            </>
          ) : (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {bio || editedText}
            </p>
          )}
        </Card>

        {/* Stats */}
        <section
          aria-label="Profile statistics"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <Stat
            value={
              typeof user?.yearsOfExperience === "number"
                ? `${user.yearsOfExperience} yrs`
                : null
            }
            label="Experience"
          />
          <Stat value={""} label="Jobs done" />
          <Stat value={profile?.savedJobs ?? 0} label="Saved jobs" />
          <Stat value={profile?.jobInvitations ?? 0} label="Job invitations" />
        </section>

        {/* Completeness */}
        {completeness < 100 && (
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Profile completeness
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Complete your profile to get better job matches.
                </p>
              </div>
              <span className="text-lg font-bold text-indigo-600">
                {completeness}%
              </span>
            </div>
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-valuenow={completeness}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completeness"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor(completeness)}`}
                style={{ width: `${completeness}%` }}
              />
            </div>
            {missing.length > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                Still missing:{" "}
                <span className="font-medium">{missing.join(", ")}</span>
              </p>
            )}
          </Card>
        )}

        {/* Skills */}
        <Card>
          <SectionHeader
            title="Skills"
            subtitle="Your professional skills and experience level."
            editLabel="Edit skills"
            onEdit={() => handleSkillEdit(pref.jobCategory)}
          />
          {skills.length > 0 ? (
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {skills.map((s) => (
                <li
                  key={s.skill}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex justify-between">
                    <p className="font-semibold text-gray-900">{s.skill}</p>
                    <button
                      type="button"
                      aria-label="Delete Skill"
                      onClick={() => handleRemoveSkills(s.skill)}
                    >
                      {isEditing === "skills" && (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </button>
                  </div>
                  {s.experience && (
                    <span className="mt-2 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                      {s.experience}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              No skills added yet. Add your skills so employers can find you.
            </p>
          )}

          {isEditing === "skills" && (
            <div className="mt-4 flex w-full flex-col gap-4">
              {/* Skill Selection */}
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSkill(item)}
                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition ${
                      skill === item
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Experience Level */}
              <div>
                <p className="mb-3 font-medium">Experience Level</p>

                <div className="flex flex-wrap gap-5">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <label
                      key={level}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="experience"
                        value={level}
                        checked={experience === level}
                        onChange={(e) => setExperience(e.target.value)}
                        className="accent-blue-600"
                      />

                      <span className="text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Add Skill */}
              <div>
                <button
                  type="button"
                  onClick={handleSkillCreation}
                  disabled={!skill || !experience}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  + Add Skill
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* <Card>
          <SectionHeader
            title="Job preferences"
            subtitle="The work you're looking for."
            editLabel="Edit job preferences"
            onEdit={() => handleJobPrefEdit}
          />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preferenceItems.map((item) => (
              <InfoRow
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </Card> */}

        <Card>
          <SectionHeader
            title="Job preferences"
            subtitle="The work you're looking for."
            editLabel="Edit job preferences"
            onEdit={handleJobPrefEdit}
          />

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preferenceItems.map((field) => (
              <InfoRow
                key={field.key}
                field={field}
                value={isEditing ? draft[field.key] : preferences[field.key]}
                isEditing={isEditing}
                onChange={handleChange}
              />
            ))}
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader
            title="Contact information"
            subtitle="Your registered contact details."
            editLabel="Edit contact information"
          />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow icon={Phone} label="Mobile number" value={phone} />
            <InfoRow icon={Mail} label="Email" value={user?.email} breakAll />
          </div>
        </Card>
      </div>
    </main>
  );
};

export default MyProfile;
