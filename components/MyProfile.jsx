"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Sun,
  Tag,
  Wallet,
  X,
} from "lucide-react";
import { fetchUserToken } from "@/lib/fetchUserToken";
import {
  EXPERIENCE_LEVELS,
  getJoiningPeriodType,
  JOB_SKILLS,
  JOINING_TYPE_VALUES,
  SALARY_CREDIT_TYPES,
  SHIFT_TYPE_VALUES,
} from "@/constants/constant";
import { getShiftTypes, validateFile } from "./commonFunctions";
import useLoading from "./hooks/useLoading";
import Loading from "./Loading";
import { supabase } from "@/lib/supabase";

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

const toNumberOrNull = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const formatINR = (n) => {
  const num = toNumberOrNull(n);
  return num === null ? null : `₹${num.toLocaleString("en-IN")}`;
};

const formatSalary = (min, max) => {
  const a = formatINR(min);
  const b = formatINR(max);
  if (a && b) return `${a} – ${b}`;
  return a || b || null;
};

const progressColor = (pct) =>
  pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-indigo-600" : "bg-amber-500";

// Accepts ["a","b"] or [{ value, label }] and always returns [{ value, label }]
const toOptions = (options) =>
  (options ?? [])
    .map((o) =>
      o !== null && typeof o === "object"
        ? { value: o.value, label: o.label ?? o.value }
        : { value: o, label: o },
    )
    .filter((o) => o.value !== "" && o.value != null);

/* ---------- static config (outside the component) ---------- */

const PREFERENCE_FIELDS = [
  { icon: Briefcase, label: "Job title", type: "text", key: "jobTitle" },
  {
    icon: Tag,
    label: "Job category",
    type: "select",
    key: "jobCategory",
    options: toOptions(Object.keys(JOB_SKILLS ?? {})), // categories, not skills
  },
  { icon: MapPin, label: "Location range", type: "number", key: "locRange" },
  {
    icon: Clock,
    label: "Joining period",
    type: "select",
    key: "joiningPeriod",
    options: toOptions(JOINING_TYPE_VALUES),
    format: (v) => getJoiningPeriodType(v), // shows the label in view mode
  },
  {
    icon: Sun,
    label: "Shift type",
    type: "select",
    key: "shiftType",
    options: toOptions(SHIFT_TYPE_VALUES),
    format: (v) => getShiftTypes(v),
  },
  {
    icon: Wallet,
    label: "Expected salary",
    type: "range",
    keys: ["minSalary", "maxSalary"],
  },
  {
    icon: Star,
    label: "Salary credit type",
    type: "select",
    key: "salaryCreditType",
    options: toOptions(SALARY_CREDIT_TYPES),
  },
];

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600";

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
    {onEdit && (
      <button
        type="button"
        onClick={onEdit}
        aria-label={editLabel}
        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        <Pencil className="h-5 w-5" />
      </button>
    )}
  </div>
);

// Editable row (job preferences).
// Defined OUTSIDE MyProfile so it isn't re-created on every render,
// which would make inputs lose focus after each keystroke.
const PreferenceRow = ({ field, source, isEditing, onChange }) => {
  const Icon = field.icon;

  const renderEditor = () => {
    switch (field.type) {
      case "select":
        return (
          <select
            className={inputClass}
            value={source[field.key] ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          >
            <option value="">Select…</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            min="0"
            className={inputClass}
            value={source[field.key] ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        );
      case "range": {
        const [minKey, maxKey] = field.keys;
        return (
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min"
              aria-label="Minimum salary"
              className={inputClass}
              value={source[minKey] ?? ""}
              onChange={(e) => onChange(minKey, e.target.value)}
            />
            <input
              type="number"
              min="0"
              placeholder="Max"
              aria-label="Maximum salary"
              className={inputClass}
              value={source[maxKey] ?? ""}
              onChange={(e) => onChange(maxKey, e.target.value)}
            />
          </div>
        );
      }
      default:
        return (
          <input
            type="text"
            className={inputClass}
            value={source[field.key] ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        );
    }
  };

  const renderValue = () => {
    if (field.type === "range") {
      return formatSalary(source[field.keys[0]], source[field.keys[1]]);
    }
    const raw = source[field.key];
    if (raw === undefined || raw === null || raw === "") return null;
    return field.format ? field.format(raw) : raw;
  };

  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-1 h-5 w-5 text-gray-400" />
      <div className="min-w-0 flex-1">
        <span className="text-sm text-gray-500">{field.label}</span>
        {isEditing ? (
          renderEditor()
        ) : (
          <p className="mt-0.5 font-medium text-gray-900">
            {renderValue() || "—"}
          </p>
        )}
      </div>
    </div>
  );
};

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

const ContactRow = ({
  icon: Icon,
  label,
  value,
  breakAll = false,
  editor = null, // pass JSX to show instead of the value
  onEdit, // pass to show a pencil button (editable rows only)
  editLabel,
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm text-gray-500">{label}</p>
      {editor ?? (
        <p
          className={`mt-0.5 font-medium text-gray-900 ${breakAll ? "break-all" : ""}`}
        >
          {value || <span className="text-gray-400">Not added</span>}
        </p>
      )}
    </div>
    {onEdit && !editor && (
      <button
        type="button"
        onClick={onEdit}
        aria-label={editLabel}
        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        <Pencil className="h-4 w-4" />
      </button>
    )}
  </div>
);

/* ---------- page ---------- */

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const { loading, setLoading } = useLoading(); // loading | ready | error
  const [isEditing, setIsEditing] = useState(""); // "" | "bio" | "skills" | "jobpref
  // bio
  const [editedText, setEditedText] = useState("");
  console.log(editedText, "BIO VALUE");
  // skills
  const [skill, setSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [skillsDraft, setSkillsDraft] = useState([]);
  // job preferences: only a temporary copy while editing.
  // The saved values live in profile.preference (single source of truth).
  const [draft, setDraft] = useState({});
  // Mobile Number.
  const [phoneDraft, setPhoneDraft] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const token = await fetchUserToken();
      const res = await fetch("/api/common/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const { data } = await res.json();
      console.log(data, "special data");
      setProfile(data);
      setLoading(false);
    } catch (err) {
      console.error("Profile load failed:", err);
      setLoading(false);
    }
  }, []);

  const saveProfile = async (type, data) => {
    setLoading(true);
    try {
      console.log(type, data, "UPDATE PROFILE DATA");
      const token = await fetchUserToken();
      const res = await fetch("/api/common/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, data }),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);

      const json = await res.json();
      setProfile(json.result); // match whatever your API returns
      return true;
    } catch (err) {
      console.error("Profile update failed:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  //
  useEffect(() => {
    loadProfile();
  }, []);

  if (loading && !profile) return <Skeleton />;

  // if (status === "error" && !profile) {
  //   return (
  //     <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
  //       <div className="max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
  //         <p className="font-semibold text-gray-900">
  //           We couldn't load your profile
  //         </p>
  //         <p className="mt-1 text-sm text-gray-500">
  //           Check your connection and try again.
  //         </p>
  //         <button
  //           type="button"
  //           onClick={loadProfile}
  //           className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
  //         >
  //           <RefreshCw className="h-4 w-4" /> Try again
  //         </button>
  //       </div>
  //     </main>
  //   );
  // }

  const user = profile?.user ?? {};
  const savedPreference = profile?.preference ?? {};
  const replaceName = user?.name?.charAt(0).toUpperCase();
  const pref = isEditing === "jobpref" ? draft : savedPreference;

  const safePref = pref ?? {};

  const age = getAge(user.dob);

  const bio = isEditing === "bio" ? editedText : user.bio;

  const location = [user.city, user.state].filter(Boolean).join(", ");

  const completeness = profile?.profileCompleteness ?? 0;

  const phone = user.mobileNumber?.number
    ? `${user.mobileNumber.code ?? ""}-${user.mobileNumber.number}`
    : null;

  const skills = isEditing === "skills" ? skillsDraft : (user.skills ?? []);

  const missing = profile?.missingFields ?? [];
  const salary = formatSalary(safePref.minSalary, safePref.maxSalary);
  const requiredSkills = JOB_SKILLS?.[safePref.jobCategory] ?? [];

  console.log(skillsDraft, "ALL THE AVAILABLE SKILLS");
  /* ----- bio ----- */

  const handleEditBio = () => {
    setEditedText(bio ?? "");
    setIsEditing("bio");
  };

  const handleCancelBio = () => {
    setEditedText("");
    setIsEditing("");
  };

  const handleSaveBio = async () => {
    const ok = await saveProfile("userinfo", { bio: editedText.trim() });
    if (ok) setIsEditing("");
  };

  const handleSkillEdit = () => {
    setSkillsDraft(skills); // copy saved skills
    setSkill("");
    setExperience("");
    setIsEditing("skills");
  };

  const handleSkillCreation = () => {
    const name = skill.trim();

    if (!name || skillsDraft.length >= 8) {
      alert("user allowed to select only 8 skills");
      return;
    }
    setSkillsDraft((prev) =>
      prev.some((s) => s.skill === name)
        ? prev
        : [...prev, { skill: name, experience }],
    );

    setSkill("");
    setExperience("");
  };

  console.log(setSkillsDraft, "CHECK ITS VALUE SKILL DRAFT");

  const handleRemoveSkills = (val) =>
    setSkillsDraft((prev) => prev.filter((s) => s.skill !== val));

  const handleSaveSkills = async () => {
    const ok = await saveProfile("userinfo", { skills: skillsDraft });
    if (ok) setIsEditing("");
  };
  /* ----- job preferences ----- */

  const handleJobPrefEdit = () => {
    // Copy the SAVED values into the draft, so inputs start pre-filled
    setDraft({
      jobTitle: pref.jobTitle ?? "",
      jobCategory: pref.jobCategory ?? "",
      locRange: pref.locRange ?? "",
      joiningPeriod: pref.joiningPeriod ?? "",
      shiftType: pref.shiftType ?? "",
      minSalary: pref.minSalary ?? "",
      maxSalary: pref.maxSalary ?? "",
      salaryCreditType: pref.salaryCreditType ?? "",
    });
    // setPrefError("");
    setIsEditing("jobpref");
  };

  const handleChange = (key, val) =>
    setDraft((prev) => ({ ...prev, [key]: val }));

  const handleCancel = () => {
    setDraft({});
    // setPrefError("");
    setIsEditing("");
  };

  const handleSave = async () => {
    // job preferences
    const minSalary = toNumberOrNull(draft.minSalary);
    const maxSalary = toNumberOrNull(draft.maxSalary);
    if (minSalary !== null && maxSalary !== null && minSalary > maxSalary)
      return;

    const ok = await saveProfile("jobinfo", {
      ...draft,
      locRange: toNumberOrNull(draft.locRange),
      minSalary,
      maxSalary,
    });
    if (ok) {
      setDraft({});
      setIsEditing("");
    }
  };
  /* ----- contact (only the mobile number is editable) ----- */

  const handleEditPhone = () => {
    setPhoneDraft(user?.mobileNumber?.number ?? "");
    // setPhoneError("");
    setIsEditing("phone");
  };

  const handleCancelPhone = () => {
    setPhoneDraft("");
    // setPhoneError("");
    setIsEditing("");
  };

  const handleSavePhone = async () => {
    const digits = phoneDraft.replace(/\D/g, "");
    if (digits.length < 6 || digits.length > 15) return;
    const ok = await saveProfile("userinfo", {
      mobileNumber: { ...user?.mobileNumber, number: digits },
    });
    if (ok) {
      setPhoneDraft("");
      setIsEditing("");
    }
  };

  //image uploading

  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);

    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    setError("");
    setFile(selectedFile);

    setPreviewUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);

      return URL.createObjectURL(selectedFile);
    });
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      return null;
    });

    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file || uploading) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setError("");

    try {
      setUploading(true);
      setError("");

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${Date.now()}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("ImageBucket")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("ImageBucket")
        .getPublicUrl(filePath);

      const ok = await saveProfile("userinfo", {
        profileImage: urlData?.publicUrl,
      });
      if (ok) setIsEditing("");

      handleRemove();
    } catch (err) {
      console.error("Profile image upload failed:", err);
      setError(err.message || "Unable to upload profile photo.");
    } finally {
      setUploading(false);
    }
  };

  const isEditingPrefs = isEditing === "jobpref";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-4xl font-bold text-white ring-4 ring-indigo-50">
              {/* {user?.profileImage ? (
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
              )} */}
              {/* Upload / Preview area */}
              {/* Profile image */}
              <div className="flex flex-col items-center">
                <div className="relative h-28 w-28">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gray-200 text-4xl font-bold text-white ring-4 ring-indigo-50">
                    {previewUrl || user?.profileImage ? (
                      <img
                        src={previewUrl || user.profileImage}
                        alt="Profile photo"
                        className="h-40 w-40 object-cover"
                      />
                    ) : (
                      <span aria-hidden="true">{replaceName}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    aria-label="Change profile photo"
                    className="absolute bottom-0 right-3 rounded-full bg-white p-2 text-gray-700 shadow-md ring-1 ring-gray-200 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>

                {/* <div className="relative h-40 w-40">
                  <div className="fle items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-4xl font-bold text-white ring-4 ring-indigo-50">
                    {previewUrl || user?.profileImage ? (
                      <img
                        src={previewUrl || user.profileImage}
                        alt="Profile photo"
                        className="h-full w-full "
                      />
                    ) : (
                      <span aria-hidden="true">
                        {user?.name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                  </div>

                
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    aria-label="Change profile photo"
                    className="absolute bottom-1 right-1 rounded-full bg-white p-2 text-gray-700 shadow-md ring-1 ring-gray-200 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div> */}

                {/* Hidden file input */}
                <input
                  id="profile-image-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={uploading}
                  className="hidden"
                />

                {/* Preview actions */}
                {previewUrl && (
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={uploading}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading || !file}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploading ? "Uploading..." : "Save photo"}
                    </button>
                  </div>
                )}

                {error && (
                  <p role="alert" className="mt-3 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>
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
              {pref.jobTitle && (
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
              {salary && (
                <span className="font-semibold text-green-600">{salary}</span>
              )}
            </div>
          </div>
        </Card>

        {/* Bio */}
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
                rows={4}
                className="mt-3 w-full rounded-lg border border-gray-200 p-3"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  aria-label="Cancel bio"
                  onClick={handleCancelBio}
                  className="rounded-md bg-gray-600 p-2 text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  aria-label="Save bio"
                  onClick={handleSaveBio}
                  className="rounded-md bg-blue-500 p-2 text-white"
                >
                  Save
                </button>
              </div>
            </>
          ) : (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {bio || <span className="text-gray-400">No bio added yet.</span>}
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
          <Stat value={profile?.jobsDone ?? "–"} label="Jobs done" />
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
            onEdit={handleSkillEdit}
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
                    {isEditing === "skills" && (
                      <button
                        type="button"
                        aria-label={`Delete skill ${s.skill}`}
                        onClick={() => handleRemoveSkills(s.skill)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </button>
                    )}
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
              {/* Skill selection */}
              {requiredSkills.length > 0 ? (
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
              ) : (
                <p className="text-sm text-gray-500">
                  Choose a job category in your job preferences to see suggested
                  skills.
                </p>
              )}

              {/* Experience level */}
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

              {/* Add skill */}
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

          {isEditing === "skills" && (
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleRemoveSkills}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSkills}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          )}
        </Card>

        {/* Job preferences */}
        <Card>
          <SectionHeader
            title="Job preferences"
            subtitle="The work you're looking for."
            editLabel="Edit job preferences"
            onEdit={handleJobPrefEdit}
          />

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PREFERENCE_FIELDS.map((field) => (
              <PreferenceRow
                key={field.key ?? field.keys.join("-")}
                field={field}
                source={isEditingPrefs ? draft : pref}
                isEditing={isEditingPrefs}
                onChange={handleChange}
              />
            ))}
          </div>

          {/* {prefError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {prefError}
            </p>
          )} */}

          {isEditingPrefs && (
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

        {/* Contact */}
        {/* <Card>
          <SectionHeader
            title="Contact information"
            subtitle="Your registered contact details."
          />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ContactRow icon={Phone} label="Mobile number" value={phone} />
            <ContactRow icon={Mail} label="Email" value={user?.email} breakAll />
          </div>
        </Card> */}

        {/* Contact */}
        <Card>
          <SectionHeader
            title="Contact information"
            subtitle="Your registered contact details."
          />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ContactRow
              icon={Phone}
              label="Mobile number"
              value={phone}
              onEdit={handleEditPhone}
              editLabel="Edit mobile number"
              editor={
                isEditing === "phone" ? (
                  <div>
                    <div className="mt-1 flex items-center gap-2">
                      {user?.mobileNumber?.code && (
                        <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                          {user.mobileNumber.code}
                        </span>
                      )}
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoFocus
                        aria-label="Mobile number"
                        value={phoneDraft}
                        onChange={(e) =>
                          setPhoneDraft(e.target.value.replace(/\D/g, ""))
                        }
                        className={inputClass.replace("mt-1 ", "")}
                      />
                    </div>

                    {/* {phoneError && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {phoneError}
              </p>
            )} */}

                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={handleCancelPhone}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePhone}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : null
              }
            />

            {/* Email: no onEdit, so it's read-only */}
            <ContactRow
              icon={Mail}
              label="Email"
              value={user?.email}
              breakAll
            />
          </div>
        </Card>
      </div>
      {loading && <Loading />}
    </main>
  );
};

export default MyProfile;
