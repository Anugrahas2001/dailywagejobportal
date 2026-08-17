import { generateId } from "@/lib/generateRandomId";
import { connectDB } from "@/lib/mongodb";
import { validate } from "@/lib/validate";
import { validationError } from "@/lib/validationError";
import { jobViewSchema } from "@/lib/validations/jobs/jobValidation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobDetails from "@/modals/JobDetails";
import JobViews from "@/modals/JobViews";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    const body = await request.json();
    const newObj = {
      _id: generateId(),
      jobId: body.jobId,
      workerId: uid,
    };
    const validation = validate(jobViewSchema, newObj);
    if (!validation.success) {
      return validationError(validation);
    }
    const exJobView = await JobViews.findOneAndUpdate(
      {
        jobId: validation.data.jobId,
        workerId: uid,
      },
      {
        $setOnInsert: validation.data
      },
      {
        new: false,
        upsert: true,
        includeResultMetadata: true,
      },
    );

    const isNew = !exJobView?.lastErrorObject?.updatedExisting;
    console.log(
      isNew,
      exJobView?.lastErrorObject?.updatedExisting,
      "CHECK BOTH",
    );
    const jobViewDoc = isNew ? validation.data : exJobView.value;

    // Only bump the counter when this is a genuinely new viewer
    let updatedJob = null;
    if (isNew) {
      updatedJob = await JobDetails.findByIdAndUpdate(
        body.jobId,
        { $inc: { viewsCount: 1 } },
        { new: true },
      );
    }

    return NextResponse.json(
      {
        message: "Successfully updated the jov view count.",
        data: jobViewDoc,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Failed to create the job view document.",
      },
      {
        status: 200,
      },
    );
  }
}
