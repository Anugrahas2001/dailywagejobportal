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




export async function computeMatchesForJob(jobId) {

  await connectDB();

  const job = await JobDetails.findOne({
    _id: jobId,
    isDeleted: { $ne: true },
  }).lean();
  if (!job) return { total: 0, matches: [] };
  console.log(job, "JOBDATA CHECK");
  const hasValidLocation =
    Array.isArray(job.loc?.coordinates) &&
    (job.loc.coordinates[0] !== 0 || job.loc.coordinates[1] !== 0);

  console.log(hasValidLocation, "HAS VALIDATION CHECK");

  const pipeline = [];
  if (hasValidLocation) {
    pipeline.push({
      $geoNear: {
        near: { type: "Point", coordinates: job.loc.coordinates },
        distanceField: "distanceInMeters",
        spherical: true,
      },
    });
  }

  const hardFilters = { role: { $ne: "employer" } };
  if (job.genderPreference && job.genderPreference !== "Any") {
    hardFilters.gender = job.genderPreference;
  }
  pipeline.push({ $match: hardFilters });

  pipeline.push(
    {
      $lookup: {
        from: "jobpreferences",
        localField: "_id",
        foreignField: "userId",
        as: "preference",
      },
    },
    { $unwind: "$preference" },
  );

  if (hasValidLocation) {
    pipeline.push({
      $match: {
        $expr: {
          $lte: [
            "$distanceInMeters",
            { $multiply: ["$preference.locRange", 1000] },
          ],
        },
      },
    });
  }

  pipeline.push({
    $match: { "preference.jobCategory": { $exists: true, $ne: null } },
  });

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
  console.log(candidates, "LENGTH CHECK111");
  const scored = candidates.map((candidate) => {
    const { score } = computeMatchScore(
      job,
      candidate.preference,
      candidate.distanceInMeters,
      candidate.skills,
    );
    return { workerId: candidate._id, matchingScore: score };
  });
  console.log(scored.length, "SCORED CHECK");

  const ranked = scored
    .filter((c) => c.score >= 10) // keep in sync with your minScore default
    .sort((a, b) => b.score - a.score);
  console.log(ranked, "RANKED CHECK");

  return { total: ranked.length, matches: ranked };
}
