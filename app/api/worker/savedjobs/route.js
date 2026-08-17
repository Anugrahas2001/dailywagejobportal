import { connectDB } from "@/lib/mongodb";
import { validate } from "@/lib/validate";
import SavedJobs from "@/modals/SavedJobs";
import { NextResponse } from "next/server";
import { generateId } from "@/lib/generateRandomId";
import { validationError } from "@/lib/validationError";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import { savedJobApplicationSchema } from "@/lib/validations/jobs/jobValidation";
import JobDetails from "@/modals/JobDetails";

export async function POST(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    const body = await request.json();
    const savedObj = {
      _id: generateId(),
      workerId: uid,
      jobId: body.jobId,
      isDeleted: body.toggle,
    };
    const validation = validate(savedJobApplicationSchema, savedObj);
    if (!validation.success) {
      return validationError(validation);
    }

    // const savedJob=await SavedJobs.create(validation.data);
    const savedJob = await SavedJobs.findOneAndUpdate(
      {
        jobId: body.jobId,
        workerId: uid,
      },
      {
        $set: {
          isDeleted: validation.data.isDeleted,
        },
        $setOnInsert: {
          _id: generateId(),
          workerId: uid,
          jobId: validation.data.jobId,
        },
      },
      {
        new: false,
        upsert: true,
        includeResultMetadata: true,
      },
    );

    const isNew = !savedJob?.lastErrorObject?.updatedExisting;
    const savedJobObj = isNew ? validation.data : savedJob.value;

    const savedJobDoc = await JobDetails.findById(savedJobObj?.jobId).lean();
console.log(savedJobDoc,"CHECK THIS DOC")
    return NextResponse.json(
      {
        success: true,
        message: isNew
          ? "Saved job created successfully."
          : "Job already saved.",
        data: savedJobDoc,
        deletedJob:savedJob?.isDeleted
      },
      { status: isNew ? 201 : 200 },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Failed to craete saved jobs.",
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
    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 12, 1),
      50,
    );
    console.log(page, limit, "PAGE AND LIMIT");
    const skip = (page - 1) * limit;
    const sort = searchParams.get("sorttype") || "newest";
    const { uid } = await verifyFirebaseToken(request);

    let sortOption = {};
    switch (sort) {
      case "newest":
        sortOption = { savedAt: -1 };
        break;
      case "oldest":
        sortOption = { savedAt: 1 };
        break;
      case "high-to-low":
        sortOption = { minSalary: -1, maxSalary: -1 };
        break;
      case "low-to-high":
        sortOption = { minSalary: 1, maxSalary: 1 };
        break;
      default:
        sortOption = { savedAt: -1 };
        break;
    }

    const [allsavedJobs, total] = await Promise.all([
      SavedJobs.find({ workerId: uid, isDeleted: false })
        .sort(sortOption)
        .select("jobId savedAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      SavedJobs.countDocuments({ workerId: uid, isDeleted: false }),
    ]);

    const allSavedJobIds = allsavedJobs.map((job) => job?.jobId);
    console.log(allSavedJobIds, "ALL SAVED JOB IDS FROM THE ROUTE.JS FILE");
    const allJobs = await JobDetails.find({
      _id: { $in: allSavedJobIds },
      isDeleted: false,
    }).lean();

    const jobMap = new Map(allJobs.map((job) => [String(job._id), job]));

    const orderedJobs = allSavedJobIds
      .map((id) => {
        const job = jobMap.get(String(id));
        if (!job) return null;
        const savedEntry = allsavedJobs.find(
          (s) => String(s.jobId) === String(id),
        );
        return { ...job, savedAt: savedEntry?.savedAt };
      })
      .filter(Boolean);
    console.log(orderedJobs.length, total, "CHECK BOTH");
    return NextResponse.json(
      {
        message: "Successfully fetched the data.",
        data: orderedJobs,
        totalCount: total,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Failed to fetch all the saved jobs.",
      },
      {
        status: 500,
      },
    );
  }
}
