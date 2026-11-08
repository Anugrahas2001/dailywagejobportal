// lib/matching/computeMatchedJobsForUser.js
import JobDetails from "@/modals/JobDetails";
import User from "@/modals/User";
import { connectDB } from "../mongodb";
import SavedJobs from "@/modals/SavedJobs";
import JobApplication from "@/modals/JobApplication";
import JobPreferences from "@/modals/JobPreferences";

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

// CHECK
function computeMatchScore(pref, job, distanceInMeters, candidateSkills = []) {
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
    // console.log(skillsScore, "CHECK THESE 2");
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

export async function computeMatchedJobsForUser(
  userId,
  status = "Active",
  minScore = 10,
) {
  try {
    await connectDB();
    // console.log(userId, status, "BOTH ID AND STATUS TRIGGERED");

    const [user, userJobPref] = await Promise.all([
      User.findById(userId)
        .select("gender city state country loc skills")
        .lean(),
      JobPreferences.findOne({ userId }).lean(),
    ]);
    // console.log(user, userJobPref, "USER AND THEIR PREFERENCES");
    const locRangeKm = userJobPref?.locRange || 10;

    const locRangeMeters = locRangeKm * 1000;
    console.log(locRangeMeters, "LOCATION RANGE IN METERS");
  
    if (!user || !userJobPref) return { total: 0, matches: [] };

    const appliedJobs = await JobApplication.find(
      { workerId: userId },
      { jobId: 1 },
    ).lean();

    const appliedJobIds = appliedJobs.map((job) => job.jobId);
    const allSavedJobs = await SavedJobs.find(
      {
        workerId: userId,
        isDeleted: false,
        jobId: { $nin: appliedJobIds },
      },
      { jobId: 1, _id: 0 },
    ).lean();

    const savedJobIds = allSavedJobs.map((job) => job.jobId);
    const excludedIds = [...appliedJobIds, ...savedJobIds];

    // 2. Build the aggregation pipeline on the "users" collection
    const pipeline = [];

    const hasValidLocation =
      Array.isArray(user.loc?.coordinates) &&
      (user.loc.coordinates[0] !== 0 || user.loc.coordinates[1] !== 0);

    if (hasValidLocation) {
      pipeline.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: user.loc.coordinates,
          },
          key: "loc",
          distanceField: "distanceInMeters",
          spherical: true,
          maxDistance: locRangeMeters,
        },
      });
    }

    const hardFilters = {
      isDeleted: false,
      _id: { $nin: excludedIds },
    };

    if (status !== "All") {
      hardFilters.status = status;
    }

    pipeline.push({ $match: hardFilters });

    pipeline.push({
      $project: {
        _id: 1,
        employerId: 1,
        jobTitle: 1, // ✅ was "jobName", check your actual schema field name
        jobCategory: 1,
        genderPreference: 1,
        jobDescription: 1,
        jobShift: 1,
        availability: 1, // ✅ added
        numberOfOpenings: 1, // ✅ added
        minSalary: 1, // ✅ added
        maxSalary: 1, // ✅ added
        city: 1,
        state: 1,
        country: 1,
        skillsRequired: 1,
        distanceInMeters: { $ifNull: ["$distanceInMeters", null] },
      },
    });

    const activeJobsCount = await JobDetails.countDocuments({
      status: "Active",
      isDeleted: false,
    });

    // console.log("📊 TOTAL ACTIVE JOBS IN DATABASE:", activeJobsCount);

    const jobs = await JobDetails.aggregate(pipeline);
    // console.log(jobs, "ALL THE JOBS");

    // console.log("========================================");
    // console.log("📦 AGGREGATION RESULT");
    console.log("📦 JOB COUNT:", jobs.length, userId);
    console.log("📦 JOBS:", jobs);
    console.log("========================================");
    const scored = jobs.map((job) => {
      const { score } = computeMatchScore(
        userJobPref,
        job,
        job.distanceInMeters,
        user.skills,
      );
      return {
        employerId: job.employerId,
        jobId: job._id,
        jobTitle: job.jobName,
        jobCategory: job.jobCategory,
        city: job.city,
        state: job.state,
        genderPreference: job.genderPreference,
        jobDescription: job.jobDescription,
        jobShift: job.jobShift,
        availability: job.availability,
        skillsRequired: job.skillsRequired,
        numberOfOpenings: job.numberOfOpenings,

        distanceKm:
          job.distanceInMeters != null
            ? +(job.distanceInMeters / 1000).toFixed(2)
            : null,
        matchPercentage: score,
      };
    });

    const ranked = scored
      .filter((c) => c.matchPercentage >= minScore)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
    const total = ranked.length;
    console.log(ranked, "+++++++++++===============RANKED");
    return { total, matches: ranked };
  } catch (error) {
    console.log(error, "ERROR FROM THE JOBS", error);
    return error;
  }
}
