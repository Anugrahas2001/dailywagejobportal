

// // lib/matching/computeMatchedJobsForUser.js

// import JobDetails from "@/modals/JobDetails";
// import User from "@/modals/User";
// import SavedJobs from "@/modals/SavedJobs";
// import JobApplication from "@/modals/JobApplication";
// import JobPreferences from "@/modals/JobPreferences";
// import { connectDB } from "../mongodb";

// const EXPERIENCE_WEIGHT = {
//   Beginner: 0.6,
//   Basic: 0.75,
//   Good: 0.85,
//   Experienced: 0.95,
//   Expert: 1,
// };

// const DEFAULT_EXPERIENCE_WEIGHT = 1;

// const MAX_WEIGHTS = {
//   category: 25,
//   salary: 20,
//   skills: 20,
//   shift: 10,
//   joining: 10,
//   distance: 15,
// };

// /**
//  * Calculate match percentage between a worker's preferences
//  * and a job.
//  */
// function computeMatchScore(
//   pref,
//   job,
//   distanceInMeters,
//   candidateSkills = [],
// ) {
//   const raw = {};

//   // =========================================================
//   // 1. CATEGORY - 25%
//   // =========================================================

//   const jobCategory = (job.jobCategory || "").trim().toLowerCase();
//   const preferredCategory = (pref.jobCategory || "").trim().toLowerCase();

//   let categoryScore = 0;

//   if (jobCategory && preferredCategory) {
//     if (jobCategory === preferredCategory) {
//       categoryScore = 25;
//     } else if (
//       jobCategory.includes(preferredCategory) ||
//       preferredCategory.includes(jobCategory)
//     ) {
//       categoryScore = 12;
//     }
//   } else {
//     // No category preference
//     categoryScore = 12;
//   }

//   raw.category = categoryScore;

//   // =========================================================
//   // 2. SALARY - 20%
//   // =========================================================

//   let salaryScore = 0;

//   if (
//     pref.minSalary != null &&
//     pref.maxSalary != null &&
//     job.minSalary != null &&
//     job.maxSalary != null
//   ) {
//     const overlaps =
//       job.minSalary <= pref.maxSalary &&
//       job.maxSalary >= pref.minSalary;

//     if (overlaps) {
//       const overlapLow = Math.max(
//         job.minSalary,
//         pref.minSalary,
//       );

//       const overlapHigh = Math.min(
//         job.maxSalary,
//         pref.maxSalary,
//       );

//       const overlapSize = Math.max(
//         overlapHigh - overlapLow,
//         0,
//       );

//       const prefRange =
//         pref.maxSalary - pref.minSalary || 1;

//       const overlapRatio = Math.min(
//         overlapSize / prefRange,
//         1,
//       );

//       salaryScore = 12 + overlapRatio * 8;
//     }
//   } else {
//     salaryScore = 10;
//   }

//   raw.salary = Math.round(salaryScore);

//   // =========================================================
//   // 3. SKILLS - 20%
//   // =========================================================

//   let skillsScore = 0;

//   const requiredSkills = (
//     job.skillsRequired || []
//   ).filter(Boolean);

//   if (requiredSkills.length === 0) {
//     // Job doesn't require specific skills
//     skillsScore = 12;
//   } else if (
//     Array.isArray(candidateSkills) &&
//     candidateSkills.length > 0
//   ) {
//     const candidateSkillMap = new Map(
//       candidateSkills
//         .filter((skill) => skill?.skill)
//         .map((skill) => [
//           skill.skill.trim().toLowerCase(),
//           skill.experience,
//         ]),
//     );

//     const perSkillMax =
//       20 / requiredSkills.length;

//     let earned = 0;

//     for (const requiredSkill of requiredSkills) {
//       const key = requiredSkill
//         .trim()
//         .toLowerCase();

//       if (candidateSkillMap.has(key)) {
//         const experience =
//           candidateSkillMap.get(key);

//         const weight =
//           EXPERIENCE_WEIGHT[experience] ??
//           DEFAULT_EXPERIENCE_WEIGHT;

//         earned += perSkillMax * weight;
//       }
//     }

//     skillsScore = earned;
//   }

//   raw.skills = Math.round(skillsScore);

//   // =========================================================
//   // 4. SHIFT - 10%
//   // =========================================================

//   let shiftScore = 0;

//   if (!pref.shiftType) {
//     shiftScore = 6;
//   } else if (pref.shiftType === job.jobShift) {
//     shiftScore = 10;
//   }

//   raw.shift = shiftScore;

//   // =========================================================
//   // 5. JOINING PERIOD - 10%
//   // =========================================================

//   let joiningScore = 0;

//   if (!pref.joiningPeriod) {
//     joiningScore = 6;
//   } else if (
//     pref.joiningPeriod === job.availability
//   ) {
//     joiningScore = 10;
//   }

//   raw.joining = joiningScore;

//   // =========================================================
//   // 6. LOCATION - 15%
//   // =========================================================

//   let distanceScore = 0;

//   if (distanceInMeters == null) {
//     // This should normally not happen because
//     // location is being used as a hard filter.
//     distanceScore = 0;
//   } else {
//     const distanceKm =
//       distanceInMeters / 1000;

//     const preferredRangeKm =
//       Number(pref.locRange) || 10;

//     const proximityRatio = Math.max(
//       0,
//       1 - distanceKm / preferredRangeKm,
//     );

//     distanceScore =
//       proximityRatio * 15;
//   }

//   raw.distance = Math.round(distanceScore);

//   // =========================================================
//   // TOTAL
//   // =========================================================

//   const total = Math.round(
//     raw.category +
//       raw.salary +
//       raw.skills +
//       raw.shift +
//       raw.joining +
//       raw.distance,
//   );

//   const breakdown = Object.fromEntries(
//     Object.entries(raw).map(
//       ([key, score]) => {
//         const max = MAX_WEIGHTS[key];

//         return [
//           key,
//           {
//             score,
//             max,
//             percentage: Math.round(
//               (score / max) * 100,
//             ),
//           },
//         ];
//       },
//     ),
//   );

//   return {
//     score: Math.min(total, 100),
//     breakdown,
//   };
// }

// /**
//  * Fetch jobs matched with worker preferences.
//  */
// export async function computeMatchedJobsForUser(
//   userId,
//   status = "Active",
//   minScore = 10,
// ) {
//   try {
//     await connectDB();

//     console.log(
//       userId,
//       status,
//       "USER ID AND STATUS",
//     );

//     // =======================================================
//     // 1. FETCH USER + JOB PREFERENCES
//     // =======================================================

//     const [user, userJobPref] =
//       await Promise.all([
//         User.findById(userId)
//           .select(
//             "gender city state country loc skills",
//           )
//           .lean(),

//         JobPreferences.findOne({
//           userId,
//         }).lean(),
//       ]);

//     if (!user) {
//       console.log("USER NOT FOUND");

//       return {
//         total: 0,
//         matches: [],
//       };
//     }

//     if (!userJobPref) {
//       console.log(
//         "JOB PREFERENCES NOT FOUND",
//       );

//       return {
//         total: 0,
//         matches: [],
//       };
//     }

//     // =======================================================
//     // 2. LOCATION RANGE
//     // =======================================================

//     const locRangeKm =
//       Number(userJobPref.locRange) || 10;

//     const locRangeMeters =
//       locRangeKm * 1000;

//     console.log(
//       "USER PREFERENCE:",
//       userJobPref,
//     );

//     console.log(
//       "LOCATION RANGE KM:",
//       locRangeKm,
//     );

//     console.log(
//       "LOCATION RANGE METERS:",
//       locRangeMeters,
//     );

//     // =======================================================
//     // 3. CHECK USER LOCATION
//     // =======================================================

//     const hasValidLocation =
//       Array.isArray(user.loc?.coordinates) &&
//       user.loc.coordinates.length === 2 &&
//       Number.isFinite(
//         user.loc.coordinates[0],
//       ) &&
//       Number.isFinite(
//         user.loc.coordinates[1],
//       ) &&
//       !(
//         user.loc.coordinates[0] === 0 &&
//         user.loc.coordinates[1] === 0
//       );

//     console.log(
//       "USER LOCATION:",
//       user.loc,
//     );

//     console.log(
//       "HAS VALID LOCATION:",
//       hasValidLocation,
//     );

//     // =======================================================
//     // 4. FETCH APPLIED JOBS
//     // =======================================================

//     const appliedJobs =
//       await JobApplication.find(
//         {
//           workerId: userId,
//         },
//         {
//           jobId: 1,
//           _id: 0,
//         },
//       ).lean();

//     const appliedJobIds =
//       appliedJobs.map(
//         (job) => job.jobId,
//       );

//     console.log(
//       "APPLIED JOB IDS:",
//       appliedJobIds,
//     );

//     // =======================================================
//     // 5. FETCH SAVED JOBS
//     // =======================================================

//     const savedJobs =
//       await SavedJobs.find(
//         {
//           workerId: userId,
//           isDeleted: false,
//         },
//         {
//           jobId: 1,
//           _id: 0,
//         },
//       ).lean();

//     const savedJobIds =
//       savedJobs.map(
//         (job) => job.jobId,
//       );

//     console.log(
//       "SAVED JOB IDS:",
//       savedJobIds,
//     );

//     // =======================================================
//     // 6. COMBINE EXCLUDED JOB IDS
//     // =======================================================

//     const excludedIds = [
//       ...new Set([
//         ...appliedJobIds,
//         ...savedJobIds,
//       ]),
//     ];

//     console.log(
//       "EXCLUDED JOB IDS:",
//       excludedIds,
//     );

//     // =======================================================
//     // 7. BUILD AGGREGATION PIPELINE
//     // =======================================================

//     const pipeline = [];

//     // -------------------------------------------------------
//     // GEO NEAR MUST BE THE FIRST STAGE
//     // -------------------------------------------------------

//     if (hasValidLocation) {
//       pipeline.push({
//         $geoNear: {
//           near: {
//             type: "Point",
//             coordinates:
//               user.loc.coordinates,
//           },

//           key: "loc",

//           distanceField:
//             "distanceInMeters",

//           spherical: true,

//           maxDistance:
//             locRangeMeters,
//         },
//       });
//     }

//     // =======================================================
//     // 8. HARD FILTERS
//     // =======================================================

//     const hardFilters = {
//       isDeleted: false,

//       _id: {
//         $nin: excludedIds,
//       },
//     };

//     // Status
//     if (status !== "All") {
//       hardFilters.status = status;
//     }

//     // -------------------------------------------------------
//     // Gender
//     // -------------------------------------------------------
//     //
//     // Example:
//     //
//     // Worker = Male
//     //
//     // Job Male -> match
//     // Job Female -> don't match
//     // Job Any -> match
//     //

//     // if (
//     //   user.gender &&
//     //   user.gender !== "Any"
//     // ) {
//     //   hardFilters.genderPreference = {
//     //     $in: [
//     //       user.gender,
//     //       "Any",
//     //     ],
//     //   };
//     // }

//     console.log(
//       "FINAL HARD FILTERS:",
//       JSON.stringify(
//         hardFilters,
//         null,
//         2,
//       ),
//     );

//     pipeline.push({
//       $match: hardFilters,
//     });

//     // =======================================================
//     // 9. PROJECT REQUIRED FIELDS
//     // =======================================================

//     pipeline.push({
//       $project: {
//         _id: 1,

//         // IMPORTANT:
//         // Schema uses jobName, NOT jobTitle
//         jobName: 1,

//         jobCategory: 1,

//         genderPreference: 1,

//         jobDescription: 1,

//         jobShift: 1,

//         availability: 1,

//         numberOfOpenings: 1,

//         minSalary: 1,

//         maxSalary: 1,

//         salaryType: 1,

//         currency: 1,

//         city: 1,

//         state: 1,

//         country: 1,

//         skillsRequired: 1,

//         responsibilities: 1,

//         distanceInMeters: {
//           $ifNull: [
//             "$distanceInMeters",
//             null,
//           ],
//         },
//       },
//     });

//     // =======================================================
//     // 10. EXECUTE QUERY
//     // =======================================================

//     const jobs =
//       await JobDetails.aggregate(
//         pipeline,
//       );

//     console.log(
//       "GEO + HARD FILTERED JOBS:",
//       jobs.length,
//     );

//     console.log(
//       jobs,
//       "AVAILABLE MATCHING JOBS",
//     );

//     // =======================================================
//     // 11. CALCULATE MATCHING PERCENTAGE
//     // =======================================================

//     const scored = jobs.map(
//       (job) => {
//         const {
//           score,
//           breakdown,
//         } = computeMatchScore(
//           userJobPref,
//           job,
//           job.distanceInMeters,
//           user.skills,
//         );

//         return {
//           jobId: job._id,

//           jobName: job.jobName,

//           jobCategory:
//             job.jobCategory,

//           genderPreference:
//             job.genderPreference,

//           jobDescription:
//             job.jobDescription,

//           jobShift:
//             job.jobShift,

//           availability:
//             job.availability,

//           skillsRequired:
//             job.skillsRequired,

//           numberOfOpenings:
//             job.numberOfOpenings,

//           minSalary:
//             job.minSalary,

//           maxSalary:
//             job.maxSalary,

//           salaryType:
//             job.salaryType,

//           currency:
//             job.currency,

//           city: job.city,

//           state: job.state,

//           country:
//             job.country,

//           distanceKm:
//             job.distanceInMeters !=
//             null
//               ? +(
//                   job.distanceInMeters /
//                   1000
//                 ).toFixed(2)
//               : null,

//           matchPercentage:
//             score,

//           matchBreakdown:
//             breakdown,
//         };
//       },
//     );

//     // =======================================================
//     // 12. REMOVE LOW MATCHES + SORT
//     // =======================================================

//     const ranked = scored
//       .filter(
//         (job) =>
//           job.matchPercentage >=
//           minScore,
//       )
//       .sort(
//         (a, b) =>
//           b.matchPercentage -
//           a.matchPercentage,
//       );

//     // =======================================================
//     // 13. RESULT
//     // =======================================================

//     return {
//       total: ranked.length,
//       matches: ranked,
//     };
//   } catch (error) {
//     console.error(
//       "ERROR FROM MATCHED JOBS:",
//       error,
//     );

//     return {
//       total: 0,
//       matches: [],
//       error:
//         error.message ||
//         "Failed to fetch matched jobs",
//     };
//   }
// }