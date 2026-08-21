import { generateId } from "@/lib/generateRandomId";
import { connectDB } from "@/lib/mongodb";
import { validate } from "@/lib/validate";
import { validationError } from "@/lib/validationError";
import { jobApplicationSchema } from "@/lib/validations/jobs/jobValidation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobApplication from "@/modals/JobApplication";
import JobDetails from "@/modals/JobDetails";
import SavedJobs from "@/modals/SavedJobs";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    const body = await request.json();
    console.log(body, "FOR APPLYING A JOB");
    const jobObj = {
      _id: generateId(),
      jobId: body.jobId,
      workerId: uid,
    };
    const validation = validate(jobApplicationSchema, jobObj);
    if (!validation.success) {
      return validationError(validation);
    }
    console.log(validation.data, "VALIDATION DATA");

    const alreadyApplied = await JobApplication.findOne({
      jobId: body.jobId,
      workerId: uid,
      status:"applied",
      // cancelled:false
    });

    if (alreadyApplied) {
      return NextResponse.json(
        {
          message: "You have already applied.",
        },
        {
          status: 409,
        },
      );
    }

    const application = await JobApplication.create(validation.data);
    console.log(application, "APPLICATION CREATED");
    const updateApplicantCount = await JobDetails.findByIdAndUpdate(
      { _id: body.jobId },
      {
        $inc: { applicantsCount: 1 },
      },
      {
        new: true,
      },
    );

    const savedJob = await SavedJobs.findOneAndUpdate(
      { jobId: body.jobId, workerId: uid },
      {
        $set: {
          isDeleted: true,
        },
      },
      {
        returnDocument:"after",
        upsert:false
      },
    );
    console.log(updateApplicantCount, "CHECK THIS VALUE APPLIED");
    return NextResponse.json(
      {
        message: "Sucessfully created the job Apllication.",
        data: updateApplicantCount,
        
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Failed to create a job application.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { uid } = await verifyFirebaseToken(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;

    const skip = (page - 1) * limit;
    console.log(page, skip, "CHECK THESE 2");
    if (!status) {
      return NextResponse.json(
        {
          message: "Status query parameter is required.",
        },
        {
          status: 400,
        },
      );
    }

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
    console.log(savedJobIds, "ALL SAVES IDS");
    const excludedIds = [...appliedJobIds, ...savedJobIds];
    console.log(excludedIds, "ALL THE EXCLUDEDiDS");
    const filter = {
      isDeleted: false,
      _id: { $nin: excludedIds },
    };

    if (status !== "All") {
      filter.status = status;
    }

    console.log(filter, "FILTER DATA");

    const jobs = await JobDetails.find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .skip(skip)
      .limit(limit);
    const allJobIds = jobs.map((job) => job._id);
    console.log(allJobIds.length, "ALL JOBIDA");
    const duplicateIds = allJobIds.filter((id) => excludedIds.includes(id));
    console.log(duplicateIds, "ALL DUPLICATE IDS");
    const totalCount = await JobDetails.countDocuments(filter);
    console.log(jobs.length, totalCount, "ALL WORKER JOBS");
    return NextResponse.json(
      {
        message: "Successfully fetched jobs.",
        data: jobs,
        totalCount,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: "Failed to fetch jobs.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
