// lib/matching/computeMatchesForJob.js
import JobDetails from "@/modals/JobDetails";
import User from "@/modals/User";
import { connectDB } from "../mongodb";

const EXPERIENCE_WEIGHT = {
  Beginner: 0.6,
  Basic: 0.75,
  Good: 0.85,
  Experienced: 0.95,
  Expert: 1,
};
const DEFAULT_EXPERIENCE_WEIGHT = 1;
const MAX_WEIGHTS = {
  category: 25,
  salary: 20,
  skills: 20,
  shift: 10,
  joining: 10,
  distance: 15,
};

// function computeMatchScore(job, pref, distanceInMeters, candidateSkills = []) {
//   // ... exact same function body you already have, unchanged ...
//   // (copy it verbatim from your route file)
// }
function computeMatchScore(job, pref, distanceInMeters, candidateSkills = []) {
  // console.log(job, distanceInMeters, pref, candidateSkills, "MAAHI");
  const raw = {}; // raw points per criterion, filled in below

  // --- Category (25 pts) ---
  const jobCat = (job.jobCategory || "").trim().toLowerCase();
  const prefCat = (pref.jobCategory || "").trim().toLowerCase();
  let categoryScore = 0;
  if (jobCat && prefCat) {
    if (jobCat === prefCat) categoryScore = 25;
    else if (jobCat.includes(prefCat) || prefCat.includes(jobCat))
      categoryScore = 12;
  }
  raw.category = categoryScore;

  // --- Salary overlap (20 pts) ---
  let salaryScore = 0;
  if (
    pref.minSalary != null &&
    pref.maxSalary != null &&
    job.minSalary != null &&
    job.maxSalary != null
  ) {
    const overlaps =
      job.minSalary <= pref.maxSalary && job.maxSalary >= pref.minSalary;
    if (overlaps) {
      const overlapLow = Math.max(job.minSalary, pref.minSalary);
      const overlapHigh = Math.min(job.maxSalary, pref.maxSalary);
      const overlapSize = Math.max(overlapHigh - overlapLow, 0);
      const prefRange = pref.maxSalary - pref.minSalary || 1;
      const overlapRatio = Math.min(overlapSize / prefRange, 1);
      salaryScore = 12 + overlapRatio * 8; // base credit for any overlap + ratio bonus
    }
  }
  raw.salary = Math.round(salaryScore);

  // --- Skills overlap (20 pts) ---
  // Matches job.skillsRequired (plain strings) against the candidate's
  // skills: [{ skill, experience }], weighting by experience level.
  let skillsScore = 0;
  const requiredSkills = (job.skillsRequired || []).filter(Boolean);
  if (requiredSkills.length === 0) {
    skillsScore = 12; // job didn't specify required skills — neutral credit
  } else if (Array.isArray(candidateSkills) && candidateSkills.length > 0) {
    const candidateSkillMap = new Map(
      candidateSkills
        .filter((s) => s?.skill)
        .map((s) => [s.skill.trim().toLowerCase(), s.experience]),
    );
    const perSkillMax = 20 / requiredSkills.length;
    let earned = 0;
    for (const required of requiredSkills) {
      const key = required.trim().toLowerCase();
      if (candidateSkillMap.has(key)) {
        const level = candidateSkillMap.get(key);
        const weight = EXPERIENCE_WEIGHT[level] ?? DEFAULT_EXPERIENCE_WEIGHT;
        earned += perSkillMax * weight;
      }
    }
    skillsScore = earned;
  }

  raw.skills = Math.round(skillsScore);

  // --- Shift type (10 pts) ---
  let shiftScore = 0;
  if (!pref.shiftType)
    shiftScore = 6; // flexible candidate, partial credit
  else if (pref.shiftType === job.jobShift) shiftScore = 10;
  raw.shift = shiftScore;

  // --- Joining period (10 pts) ---
  let joiningScore = 0;
  if (!pref.joiningPeriod) joiningScore = 6;
  else if (pref.joiningPeriod === job.availability) joiningScore = 10;
  raw.joining = joiningScore;

  // --- Distance (15 pts) ---
  let distanceScore = 0;
  if (distanceInMeters == null) {
    distanceScore = 7; // no location data available, neutral credit
  } else {
    const distanceKm = distanceInMeters / 1000;
    const range = pref.locRange || 10;
    const proximityRatio = Math.max(0, 1 - distanceKm / range);
    distanceScore = proximityRatio * 15;
  }
  raw.distance = Math.round(distanceScore);

  const total = Math.round(
    raw.category +
      raw.salary +
      raw.skills +
      raw.shift +
      raw.joining +
      raw.distance,
  );

  // Build a per-criterion breakdown expressed as its own percentage,
  // e.g. { score: 18, max: 20, percentage: 90 } for skills.
  const breakdown = Object.fromEntries(
    Object.entries(raw).map(([key, score]) => {
      const max = MAX_WEIGHTS[key];
      return [key, { score, max, percentage: Math.round((score / max) * 100) }];
    }),
  );

  return { score: Math.min(total, 100), breakdown };
}

// For employer for fetching the matched users
export async function computeMatchesForJob(jobId, minScore = 10) {
  await connectDB();

  const job = await JobDetails.findOne({
    _id: jobId,
    isDeleted: { $ne: true },
  }).lean();
  if (!job) return { total: 0, matches: [] };

  const hasValidLocation =
    Array.isArray(job.loc?.coordinates) &&
    (job.loc.coordinates[0] !== 0 || job.loc.coordinates[1] !== 0);

  console.log(hasValidLocation, "HAS VALIDATION CHECK");

  // 2. Build the aggregation pipeline on the "users" collection
  const pipeline = [];

  // Geo pre-filter must be the first stage if present
  // if (hasValidLocation) {
  //   pipeline.push({
  //     $geoNear: {
  //       near: { type: "Point", coordinates: job.loc.coordinates },
  //       distanceField: "distanceInMeters",
  //       spherical: true,
  //     },
  //   });
  // }

  console.log("JOB LOCATION:", job.loc);
  console.log("JOB COORDINATES:", job.loc?.coordinates);
  console.log("HAS VALID LOCATION:", hasValidLocation);

  // Hard filters: only completed profiles, and gender preference
  // (skip gender filter entirely if job accepts "Any")
  //  { isOnboardingComplete: true };
  const hardFilters = { role: { $ne: "employer" } };
  // Uncomment and set to your real employer role value to exclude employers:

  if (job.genderPreference && job.genderPreference !== "Any") {
    hardFilters.gender = job.genderPreference;
  }
  pipeline.push({ $match: hardFilters });

  // Bring in each candidate's job preferences
  pipeline.push(
    {
      $lookup: {
        from: "jobpreferences", // mongoose's default pluralized collection name
        localField: "_id",
        foreignField: "userId",
        as: "preference",
      },
    },
    { $unwind: "$preference" },
  );

  // Drop candidates outside their own declared travel range
  // if (hasValidLocation) {
  //   pipeline.push({
  //     $match: {
  //       $expr: {
  //         $lte: [
  //           "$distanceInMeters",
  //           { $multiply: ["$preference.locRange", 1000] }, // locRange assumed in km
  //         ],
  //       },
  //     },
  //   });
  // }

  // Loose pre-filter: only consider candidates who've actually set a category
  pipeline.push({
    $match: { "preference.jobCategory": { $exists: true, $ne: null } },
  });

  // Only pull what we need before scoring in JS
  pipeline.push({
    $project: {
      _id: 1,
      name: 1,
      email: 1,
      mobileNumber: 1,
      city: 1,
      state: 1,
      isVerified: 1,
      gender: 1,
      profileImage: 1,
      skills: 1,
      distanceInMeters: { $ifNull: ["$distanceInMeters", null] },
      preference: 1,
    },
  });

  const candidates = await User.aggregate(pipeline);
  console.log(candidates, "DPNT PRODUCE TOO MUCH 3");

  // 3. Score every candidate in JS — keeps weighting easy to read/tune
  const scored = candidates.map((candidate) => {
    const { score } = computeMatchScore(
      job,
      candidate.preference,
      candidate.distanceInMeters,
      candidate.skills,
    );
    return {
      _id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      city: candidate.city,
      state: candidate.state,
      mobileNumber: candidate.mobileNumber,
      gender: candidate.gender,
      profileImage: candidate.profileImage,
      skills: candidate.skills,
      isVerified: candidate.isVerified,
      // distanceKm:
      //   candidate.distanceInMeters != null
      //     ? +(candidate.distanceInMeters / 1000).toFixed(2)
      //     : null,
      ...candidate.preference,
      // Single overall match rate for the whole profile, 0-100 (= 0%-100%)
      matchPercentage: score,
      // Only attached when explicitly requested — internal scoring detail,
      // not meant to be shown per-field on the profile card.
      // ...(debug ? { matchBreakdown: breakdown } : {}),
    };
  });

  console.log(scored, "DPNT PRODUCE TOO MUCH 4");

  // 4. Rank best -> worst, apply minScore filter, then paginate
  const ranked = scored
    .filter((c) => c.matchPercentage >= minScore)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
  const total = ranked.length;

  await JobDetails.findByIdAndUpdate(
    jobId,
    {
      $set: {
        aiMatchesCount: total,
      },
    },
    {
      returnDocument: "after",
    },
  );

  console.log("ALL SET");

  return { total, matches: ranked };
}

