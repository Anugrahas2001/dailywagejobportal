import { calculateSuggestedRate } from "@/lib/calculateSuggestedRate";
import { generateId } from "@/lib/generateRandomId";
import { connectDB } from "@/lib/mongodb";
import { sendNotification } from "@/lib/notificationService";
import { validate } from "@/lib/validate";
import { validationError } from "@/lib/validationError";
import { jobApplicationSchema } from "@/lib/validations/jobs/jobValidation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobApplication from "@/modals/JobApplication";
import JobDetails from "@/modals/JobDetails";
import JobMatches from "@/modals/JobMatches";
import SavedJobs from "@/modals/SavedJobs";
import WorkerSession from "@/modals/WorkerSession";
import {
  JOB_COMPLETION_STATUS,
  WORKER_WORKING_STATUS,
} from "@/constants/constant";
import { NextResponse } from "next/server";
import User from "@/modals/User";

export async function POST(request) {
  console.log("app\api\worker\jobs\route.js - POST");
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    const { jobId } = await request.json();

    const jobObj = {
      _id: generateId(),
      jobId,
      workerId: uid,
    };

    console.log(jobObj, "THE JOB OBJECT");

    const validation = validate(jobApplicationSchema, jobObj);
    if (!validation.success) {
      return validationError(validation);
    }

    const alreadyApplied = await JobApplication.findOne({
      jobId,
      workerId: uid,
      status: { $ne: "rejected" },
    });

    const job = await JobDetails.findById(jobId).select("employerId").lean();

    console.log(alreadyApplied, "ALREADY APPLIED");

    if (alreadyApplied) {
      return NextResponse.json(
        {
          message: "You have already applied for this job.",
        },
        {
          status: 409,
        },
      );
    }

    const application = await JobApplication.create(validation.data);
    console.log(application, "APPLICATION CREATED NEWLY");

    const updateApplicantCount = await JobDetails.findByIdAndUpdate(
      { _id: jobId },
      {
        $inc: { applicantsCount: 1 },
      },
      {
        new: true,
      },
    );

    const savedJob = await SavedJobs.findOneAndUpdate(
      { jobId: jobId, workerId: uid },
      {
        $set: {
          isDeleted: true,
        },
      },
      {
        returnDocument: "after",
        upsert: false,
      },
    );

    await sendNotification({
      title: "New job application",
      notifType: "NEW_JOB_APPLICATION",
      message:
        "A candidate just applied to your job posting. Review their profile to see if they're a good fit.",
      senderId: uid,
      recepientId: job?.employerId,
      data: {
        jobId,
      },
    });

    return NextResponse.json(
      {
        message: "Your job application was submitted successfully.",
        data: application,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Unable to submit your job application. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}

//working perfectly.
// export async function GET(request) {
//   try {
//     await connectDB();

//     const { uid } = await verifyFirebaseToken(request);

//     const { searchParams } = new URL(request.url);
//     const status = searchParams.get("status");
//     const page = Number(searchParams.get("page")) || 1;
//     const limit = Number(searchParams.get("limit")) || 12;

//     const skip = (page - 1) * limit;

//     if (!status) {
//       return NextResponse.json(
//         {
//           message: "Status query parameter is required.",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     const appliedJobs = await JobApplication.find(
//       { workerId: uid },
//       { jobId: 1 },
//     ).lean();

//     const appliedJobIds = appliedJobs.map((job) => job.jobId);
//     console.log(appliedJobIds, "APPLIED IDS");
//     const allSavedJobs = await SavedJobs.find(
//       {
//         workerId: uid,
//         isDeleted: false,
//         jobId: { $nin: appliedJobIds },
//       },
//       { jobId: 1, _id: 0 },
//     ).lean();

//     const savedJobIds = allSavedJobs.map((job) => job.jobId);
//     const excludedIds = [...appliedJobIds, ...savedJobIds];
//     console.log(excludedIds, "ALL THE EXCLUDEDiDS");
//     const filter = {
//       isDeleted: false,
//       _id: { $nin: excludedIds },
//     };

//     if (status !== "All") {
//       filter.status = status;
//     }

//     const jobs = await JobDetails.find(filter)
//       .sort({ createdAt: -1 })
//       .lean()
//       .skip(skip)
//       .limit(limit);
//     const allJobIds = jobs.map((job) => job._id);
//     console.log(allJobIds.length, "ALL JOBIDA");
//     const duplicateIds = allJobIds.filter((id) => excludedIds.includes(id));
//     console.log(duplicateIds, "ALL DUPLICATE IDS");
//     const totalCount = await JobDetails.countDocuments(filter);
//     console.log(jobs.length, totalCount, "ALL WORKER JOBS");
//     return NextResponse.json(
//       {
//         message: "Jobs fetched successfully.",
//         data: jobs,
//         totalCount,
//       },
//       {
//         status: 200,
//       },
//     );
//   } catch (error) {
//     console.log(error);

//     return NextResponse.json(
//       {
//         message: "Unable to fetch jobs. Please try again later.",
//         error: error.message,
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

// CORRECT

export async function GET(request) {
  console.log("app/api/worker/jobs/route.js - GET");
  try {
    const { uid } = await verifyFirebaseToken(request);

    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    // Use ?? so that matching=0 is respected (|| would turn 0 into 20)
    const rawMatching = searchParams.get("matching");
    const parsedMatching = rawMatching !== null ? Number(rawMatching) : NaN;
    const matchingRate = Number.isNaN(parsedMatching) ? 20 : parsedMatching;
    console.log(matchingRate, "MATCHING MATCHING RATE");
    const skip = (page - 1) * limit;

    const appliedJobs = await JobApplication.find(
      { workerId: uid },
      { jobId: 1 },
    ).lean();

    const appliedJobIds = appliedJobs.map((job) => job.jobId);
    console.log(appliedJobIds, "APPLIED IDS");
    const allSavedJobs = await SavedJobs.find(
      {
        workerId: uid,
        isDeleted: false,
        jobId: { $nin: appliedJobIds },
      },
      { jobId: 1, _id: 0 },
    ).lean();

    const savedJobIds = allSavedJobs.map((job) => job.jobId);
    const excludedIds = [...appliedJobIds, ...savedJobIds];
    console.log(excludedIds, "ALL THE EXCLUDEDiDS");

    const matches = await JobMatches.find({
      workerId: uid,
      jobId: { $nin: excludedIds },
      matchingScore: { $gte: matchingRate },
    })
      .select("jobId matchingScore")
      .sort({ matchingScore: -1 })
      .lean();

    // Create a Map:
    // jobId -> matchingScore

    const matchScoreMap = new Map(
      matches.map((job) => [String(job.jobId), job.matchingScore]),
    );

    const matchingJobIds = matches.map((job) => job.jobId);

    const allMatchingJobs = await JobDetails.find({
      _id: { $in: matchingJobIds },
    }).lean();

    // Add matchingScore to each job
    const jobsWithScores = allMatchingJobs.map((job) => ({
      ...job,
      matchingScore: matchScoreMap.get(job._id),
    }));

    // console.log(matchScoreMap, jobsWithScores, "FINDING VALUES");

    // Sort by matchingScore descending (this is the source of truth for order)
    jobsWithScores.sort(
      (a, b) => (b.matchingScore ?? 0) - (a.matchingScore ?? 0),
    );

    // Paginate AFTER sorting
    const paginatedJobs = jobsWithScores.slice(skip, skip + limit);
    // e.g. skip = 12, limit = 12 → array.slice(12, 24) → items 13–24;
    // console.log(paginatedJobs, "*************************");
    return NextResponse.json(
      {
        message: "Jobs fetched successfully.",
        data: paginatedJobs,
        totalCount: matches.length,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Unable to fetch jobs. Please try again later.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}


// const MS_PER_MIN = 60 * 1000;

// const getWorkDate = (d = new Date()) =>
//   d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // "YYYY-MM-DD"

// const round2 = (n) => Math.round(n * 100) / 100;

// const fail = (message, status) => NextResponse.json({ message }, { status });

// export async function PUT(request) {
//   try {
//     await connectDB();
//     const { uid } = await verifyFirebaseToken(request);
//     const {
//       jobId,
//       action,
//       workerStatus,
//       imageUrls = [],
//     } = await request.json();
//     console.log(jobId, workerStatus, action, "JOB ID DATAAAAA");
//     if (!jobId || !action) return fail("jobId and action are required.", 400);

//     const now = new Date(); // always use server time, never client time
//     const active = { jobId, workerId: uid,  };

//     const latest = await WorkerSession.findOne({ ...active })
//       .sort({ createdAt: -1 })
//       .select("_id");
//     console.log(latest, "LATEST DATA DATA");
//     // if (!latest) return fail("No session found.", 404);

//     switch (action) {
//       // ───────────── START THE DAY ─────────────
//       case "START": {
//         const [job, worker] = await Promise.all([
//           JobDetails.findById(jobId).lean(),
//           User.findById(uid).lean(),
//         ]);
//         if (!job) return fail("Job not found.", 404);
//         // TODO: verify this worker is actually assigned to this job

//         const workDate = getWorkDate(now);

//         const existing = await WorkerSession.findOne({
//           jobId,
//           workerId: uid,
//           workDate,
//         }).lean();
//         if (existing?.startTime)
//           return fail("Work already started today.", 409);

//         try {
//           const session = await WorkerSession.findOneAndUpdate(
//             { jobId, workerId: uid, workDate },
//             {
//               $setOnInsert: {
//                 _id: generateId(),
//                 employerId: job.employerId, // from DB, not from the client
//                 agreedRate: calculateSuggestedRate(job, worker), // ideally the rate saved at hire time
//                 rateType: job.rateType || "Hourly",
//               },
//               $set: {
//                 jobCompletionStatus: JOB_COMPLETION_STATUS.STARTED,
//                 workingStatus: WORKER_WORKING_STATUS.WORKING,
//                 startTime: now,
//               },
//             },
//             { upsert: true, new: true },
//           );
//           return NextResponse.json({ session });
//         } catch (err) {
//           // the "one active job per worker" unique index fired
//           if (err.code === 11000)
//             return fail("You already have another job in progress.", 409);
//           throw err;
//         }
//       }

//       // ───────────── INPROGESS THE DAY ─────────────
//       case "INPROGESS": {
//         try {
//           const workDate = getWorkDate(now);
//           const session = await WorkerSession.findOneAndUpdate(
//             { ...active,jobCompletionStatus: "Started" },
//             {
//               $set: {
//                 jobCompletionStatus: JOB_COMPLETION_STATUS.IN_PROGRESS,
//               },
//             },
//             { upsert: false, new: true },
//           );
//           console.log(session, "CHECK THIS VALUE");
//           return NextResponse.json({ session });
//         } catch (err) {
//           // the "one active job per worker" unique index fired
//           if (err.code === 11000)
//             return fail("You already have another job in progress.", 409);
//           throw err;
//         }
//       }

//       // ───────────── START BREAK ─────────────
//       case "BREAK_START": {
//         const session = await WorkerSession.findOneAndUpdate(
//           {
//             _id: latest?._id,
//             ...active,
//             workingStatus: WORKER_WORKING_STATUS.WORKING,
//           },
//           {
//             $push: { breaks: { startedAt: now } },
//             $set: { workingStatus: WORKER_WORKING_STATUS.ON_BREAK },
//           },
//           { new: true },
//         );
//         if (!session)
//           return fail("No active working session to take a break from.", 400);
//         return NextResponse.json({ session });
//       }

//       // ───────────── END BREAK ─────────────
//       // case "BREAK_END": {
//       //   const latest = await WorkerSession.findOne({ ...active })
//       //     .sort({ createdAt: -1 })
//       //     .select("_id");

//       //   if (!latest) return fail("No session found.", 404);

//       //   const session = await WorkerSession.findOneAndUpdate(
//       //     {
//       //       _id: latest?._id,
//       //       ...active,
//       //       workingStatus: WORKER_WORKING_STATUS.ON_BREAK,
//       //       breaks: { $elemMatch: { endedAt: null } }, // an open break exists
//       //     },
//       //     {
//       //       $set: {
//       //         "breaks.$[open].endedAt": now,
//       //         workingStatus: WORKER_WORKING_STATUS.WORKING,
//       //       },
//       //     },
//       //     { new: true, arrayFilters: [{ "open.endedAt": null }] },
//       //   );
//       //   if (!session) return fail("No open break to end.", 400);
//       //   return NextResponse.json({ session });
//       // }
//       case "BREAK_END": {
//         const session = await WorkerSession.findOne({ ...active }).sort({
//           createdAt: -1,
//         });

//         if (!session) return fail("No session found.", 404);

//         if (session.workingStatus !== WORKER_WORKING_STATUS.BREAK_START) {
//           return fail(
//             `Session status is "${session.workingStatus}", not on break.`,
//             400,
//           );
//         }

//         const openBreak = session.breaks.find((b) => !b.endedAt);
//         console.log(openBreak, "OPEN BREAK DATA");
//         if (!openBreak)
//           return fail("No open break found on this session.", 400);

//         openBreak.endedAt = now;
//         session.workingStatus = WORKER_WORKING_STATUS.WORKING;
//         await session.save();
//         console.log(session, "SESSION DATA");
//         return NextResponse.json({ session });
//       }

//       // ───────────── END THE DAY ─────────────
//       case "COMPLETED": {
//         const session = await WorkerSession.findOne(active).lean();
//         if (!session) return fail("No active session to end.", 404);

//         // close an open break, if any, at the end time
//         const breaks = session.breaks.map((b) => ({
//           startedAt: b.startedAt,
//           endedAt: b.endedAt ?? now,
//         }));

//         const breakMs = breaks.reduce(
//           (sum, b) => sum + Math.max(0, b.endedAt - b.startedAt),
//           0,
//         );
//         const workedMs = Math.max(0, now - session.startTime - breakMs);

//         const breakMinutes = Math.round(breakMs / MS_PER_MIN);
//         const totalWorkingMinutes = Math.round(workedMs / MS_PER_MIN);

//         const totalSalaryAmount =
//           session.rateType === "Daily"
//             ? session.agreedRate
//             : round2((totalWorkingMinutes / 60) * session.agreedRate);

//         const allowed = [
//           WORKER_WORKING_STATUS.NOT_AVAILABLE,
//           WORKER_WORKING_STATUS.START_TOMORROW,
//         ];
//         const nextStatus = allowed.includes(workerStatus)
//           ? workerStatus
//           : WORKER_WORKING_STATUS.NOT_AVAILABLE;

//         const updated = await WorkerSession.findOneAndUpdate(
//           {
//             _id: session._id,
//             jobCompletionStatus: JOB_COMPLETION_STATUS.IN_PROGRESS,
//           }, // blocks double-submit
//           {
//             $set: {
//               jobCompletionStatus: JOB_COMPLETION_STATUS.COMPLETED,
//               workingStatus: nextStatus,
//               endTime: now,
//               breaks,
//               breakMinutes,
//               totalWorkingMinutes,
//               totalSalaryAmount,
//             },
//             ...(imageUrls.length && {
//               $push: { workPics: { $each: imageUrls } },
//             }),
//           },
//           { new: true },
//         );
//         if (!updated) return fail("Session was already ended.", 409);
//         return NextResponse.json({ session: updated });
//       }

//       // ───────────── ADD PHOTOS ─────────────
//       case "ADD_PHOTOS": {
//         if (!imageUrls.length) return fail("No images provided.", 400);
//         const session = await WorkerSession.findOneAndUpdate(
//           active,
//           { $push: { workPics: { $each: imageUrls } } },
//           { new: true },
//         );
//         if (!session) return fail("No active session.", 404);
//         return NextResponse.json({ session });
//       }

//       default:
//         try {
//           const workDate = getWorkDate(now);
//           const session = await WorkerSession.findOneAndUpdate(
//             { jobId, workerId: uid, workDate },
//             {
//               $set: {
//                 workingStatus: workerStatus,
//               },
//             },
//             { upsert: false, new: true },
//           );
//           console.log(session, "CHECK THIS VALUE");
//           return NextResponse.json({ session });
//         } catch (err) {
//           // the "one active job per worker" unique index fired
//           if (err.code === 11000)
//             return fail("You already have another job in progress.", 409);
//           throw err;
//         }
//     }
//   } catch (error) {
//     console.log(error, "ERROR DATA");
//     return fail("Unable to update the worker's session.", 500);
//   }
// }

// // Client calls:

// // javascript
// // fetch("/api/work-session", { method: "PUT", body: JSON.stringify({ jobId, action: "START" }) });
// // fetch("/api/work-session", { method: "PUT", body: JSON.stringify({ jobId, action: "BREAK_START" }) });
// // fetch("/api/work-session", { method: "PUT", body: JSON.stringify({ jobId, action: "BREAK_END" }) });
// // fetch("/api/work-session", {
// //   method: "PUT",
// //   body: JSON.stringify({ jobId, action: "END", workerStatus: "START_TOMORROW", imageUrls }),
// // });




const MS_PER_MIN = 60 * 1000;
const MAX_PHOTOS = 10;

const { STARTED, IN_PROGRESS, COMPLETED } = JOB_COMPLETION_STATUS;
const { WORKING, BREAK_START, NOT_AVAILABLE, AVAILABLE, START_TOMORROW } =
  WORKER_WORKING_STATUS;

const OPEN_STATUSES = [STARTED, IN_PROGRESS];
const END_OF_DAY_STATUSES = [NOT_AVAILABLE, START_TOMORROW];
const MANUAL_STATUSES = [NOT_AVAILABLE, WORKING, AVAILABLE, START_TOMORROW];

// old/alternate action names -> canonical
const ACTION_ALIASES = { INPROGESS: "IN_PROGRESS", END: "COMPLETED" };

const getWorkDate = (d = new Date()) =>
  d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // "YYYY-MM-DD"

const round2 = (n) => Math.round(n * 100) / 100;
const fail = (message, status) => NextResponse.json({ message }, { status });
const ok = (session) => NextResponse.json({ session });

const cleanImages = (urls) =>
  Array.isArray(urls)
    ? urls.filter((u) => typeof u === "string" && u.trim()).slice(0, MAX_PHOTOS)
    : [];

// ───────────── ACTION HANDLERS ─────────────
const handlers = {
  async START({ jobId, uid, now }) {
    const [job, worker] = await Promise.all([
      JobDetails.findById(jobId).lean(),
      User.findById(uid).lean(),
    ]);
    if (!job) return fail("Job not found.", 404);
    // TODO: verify this worker is actually assigned to this job

    try {
      // Matches only if today's session hasn't started. If it already has,
      // the upsert tries an insert and the unique index rejects it (11000).
      const session = await WorkerSession.findOneAndUpdate(
        { jobId, workerId: uid, workDate: getWorkDate(now), startTime: null },
        {
          $setOnInsert: {
            _id: generateId(),
            employerId: job.employerId, // from DB, never from the client
            agreedRate: calculateSuggestedRate(job, worker),
            rateType: job.rateType || "Hourly",
          },
          $set: {
            jobCompletionStatus: STARTED,
            workingStatus: WORKING,
            startTime: now,
          },
        },
        { upsert: true, new: true },
      );
      return ok(session);
    } catch (err) {
      if (err.code === 11000) {
        return err.keyPattern?.jobId
          ? fail("Work already started today.", 409)
          : fail("You already have another job in progress.", 409);
      }
      throw err;
    }
  },

  async IN_PROGRESS({ open }) {
    const session = await WorkerSession.findOneAndUpdate(
      open,
      { $set: { jobCompletionStatus: IN_PROGRESS } },
      { new: true },
    );
    if (!session) return fail("No active session found.", 404);
    return ok(session);
  },

  async BREAK_START({ open, now }) {
    const session = await WorkerSession.findOneAndUpdate(
      { ...open, workingStatus: WORKING },
      {
        $push: { breaks: { startedAt: now } },
        $set: { workingStatus: BREAK_START },
      },
      { new: true },
    );
    if (!session)
      return fail("No active working session to take a break from.", 400);
    return ok(session);
  },

  async BREAK_END({ open, now }) {
    const session = await WorkerSession.findOneAndUpdate(
      {
        ...open,
        workingStatus: BREAK_START,
        breaks: { $elemMatch: { endedAt: null } },
      },
      {
        $set: { "breaks.$[open].endedAt": now, workingStatus: WORKING },
      },
      { new: true, arrayFilters: [{ "open.endedAt": null }] },
    );
    if (!session) return fail("No open break to end.", 400);
    return ok(session);
  },

  async COMPLETED({ open, now, workerStatus, imageUrls }) {
    const session = await WorkerSession.findOne(open).lean();
    if (!session?.startTime) return fail("No active session to end.", 404);

    // close an open break at the end time
    const breaks = session.breaks.map((b) => ({
      startedAt: b.startedAt,
      endedAt: b.endedAt ?? now,
    }));

    const breakMs = breaks.reduce(
      (sum, b) => sum + Math.max(0, b.endedAt - b.startedAt),
      0,
    );
    const workedMs = Math.max(0, now - session.startTime - breakMs);

    const breakMinutes = Math.round(breakMs / MS_PER_MIN);
    const totalWorkingMinutes = Math.round(workedMs / MS_PER_MIN);

    const totalSalaryAmount =
      session.rateType === "Daily"
        ? session.agreedRate
        : round2((totalWorkingMinutes / 60) * session.agreedRate);

    const update = {
      $set: {
        jobCompletionStatus: COMPLETED,
        workingStatus: END_OF_DAY_STATUSES.includes(workerStatus)
          ? workerStatus
          : NOT_AVAILABLE,
        endTime: now,
        breaks,
        breakMinutes,
        totalWorkingMinutes,
        totalSalaryAmount,
      },
    };
    if (imageUrls.length) update.$push = { workPics: { $each: imageUrls } };

    const updated = await WorkerSession.findOneAndUpdate(
      {
        _id: session._id,
        jobCompletionStatus: { $in: OPEN_STATUSES }, // blocks double-submit
        updatedAt: session.updatedAt, // blocks a break change mid-calculation
      },
      update,
      { new: true },
    );
    if (!updated)
      return fail("Session was already ended or just changed. Retry.", 409);
    return ok(updated);
  },

  async ADD_PHOTOS({ jobId, uid, imageUrls }) {
    if (!imageUrls.length) return fail("No images provided.", 400);
    // No status filter, so sort picks the latest session for this job
    const session = await WorkerSession.findOneAndUpdate(
      { jobId, workerId: uid },
      { $push: { workPics: { $each: imageUrls } } },
      { new: true, sort: { createdAt: -1 } },
    );
    if (!session) return fail("No session found.", 404);
    return ok(session);
  },

  // Manual status change (Available / Not Available / Start Tomorrow)
  // async DEFAULT({ jobId, uid, now, workerStatus }) {
  //   if (!MANUAL_STATUSES.includes(workerStatus))
  //     return fail("Invalid status for this action.", 400);

  //   const session = await WorkerSession.findOneAndUpdate(
  //     { jobId, workerId: uid, workDate: getWorkDate(now) },
  //     { $set: { workingStatus: workerStatus,endTime:now } },
  //     { new: true, runValidators: true },
  //   );
  //   if (!session) return fail("No session found for today.", 404);
  //   return ok(session);
  // },
  async DEFAULT({ jobId, uid, now, workerStatus }) {
  if (!MANUAL_STATUSES.includes(workerStatus))
    return fail("Invalid status for this action.", 400);

  const session = await WorkerSession.findOneAndUpdate(
    { jobId, workerId: uid, workDate: getWorkDate(now) },
    {
      $set: {
        workingStatus: workerStatus,
        endTime: workerStatus === START_TOMORROW ? now : null,
      },
    },
    { new: true, runValidators: true },
  );
  if (!session) return fail("No session found for today.", 404);
  return ok(session);
},
};

// ───────────── ROUTE ─────────────
export async function PUT(request) {
  try {
    await connectDB();

    let uid;
    try {
      ({ uid } = await verifyFirebaseToken(request));
    } catch {
      return fail("Unauthorized.", 401);
    }

    const body = await request.json().catch(() => null);
    if (!body) return fail("Invalid request body.", 400);

    const { jobId, workerStatus } = body;
    const rawAction = body.action;
    if (!jobId || !rawAction) return fail("jobId and action are required.", 400);

    const action = ACTION_ALIASES[rawAction] ?? rawAction;
    const handler = handlers[action] ?? handlers.DEFAULT;

    return await handler({
      jobId,
      uid,
      workerStatus,
      imageUrls: cleanImages(body.imageUrls),
      now: new Date(), // always server time, never client time
      // the one open session of this worker for this job
      open: {
        jobId,
        workerId: uid,
        jobCompletionStatus: { $in: OPEN_STATUSES },
      },
    });
  } catch (error) {
    console.error("WorkerSession PUT failed:", error);
    return fail("Unable to update the worker's session.", 500);
  }
}
