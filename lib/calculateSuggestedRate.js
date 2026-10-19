import { EXPERIENCE_LEVELS } from "@/constants/constant";

const normalize = (s) => String(s || "").trim().toLowerCase();

// Beginner=0, Basic=0.25, Good=0.5, Experienced=0.75, Expert=1
const levelScore = (level) => {
  const i = EXPERIENCE_LEVELS.indexOf(level);
  if (i === -1) return 0;
  return i / (EXPERIENCE_LEVELS.length - 1);
};

/**
 * Suggest a rate inside the job's min/max range based on the worker's skills.
 * @param {object} job    JobDetails doc (minSalary, maxSalary, skillsRequired, jobCategory)
 * @param {object} worker User doc (skills[], yearsOfExperience)
 * @returns {{ rate: number, score: number, matchedSkills: string[], missingSkills: string[] }}
 */
export function calculateSuggestedRate(job, worker) {
  const { minSalary, maxSalary } = job;
  const workerSkills = worker.skills || [];

  // 1. Which skills to judge the worker on
  const required =
    job.skillsRequired?.length > 0
      ? job.skillsRequired
      : [job.jobCategory].filter(Boolean);

  // 2. Score each required skill
  const matchedSkills = [];
  const missingSkills = [];
  let skillTotal = 0;

  for (const req of required) {
    const found = workerSkills.find((s) => normalize(s.skill) === normalize(req));
    if (found) {
      matchedSkills.push(req);
      skillTotal += levelScore(found.experience);
    } else {
      missingSkills.push(req); // counts as 0
    }
  }

  const skillScore = required.length ? skillTotal / required.length : 0;

  // 3. Small bonus from total years of experience (10+ years = max)
  const yearsScore = Math.min((worker.yearsOfExperience || 0) / 10, 1);

  // 4. Blend: skills matter most
  const score = 0.8 * skillScore + 0.2 * yearsScore;

  // 5. Place the worker inside the job's range, round to nearest 10
  const raw = minSalary + (maxSalary - minSalary) * score;
  const rate = Math.min(maxSalary, Math.max(minSalary, Math.round(raw / 10) * 10));

  return { rate, score: Number(score.toFixed(2)), matchedSkills, missingSkills };
}