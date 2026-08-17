import { connectDB } from "@/lib/mongodb";
import { validate } from "@/lib/validate";
import { validationError } from "@/lib/validationError";
import { jobDetailSchema } from "@/lib/validations/employer/employerJobValidation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobDeatils from "@/modals/JobDetails";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { uid } = await verifyFirebaseToken(request);
    console.log(id, "THE JOB ID");

    const deletedJob = await JobDeatils.findByIdAndUpdate(
      {
        _id: id,
        employerId: uid,
      },
      {
        $set: {
          isDeleted: true,
        },
      },
      {
        new: true,
        select: "_id status",
      },
    );

    console.log(deletedJob, "DELETED JOBBB");
    if (!deletedJob) {
      return NextResponse.json(
        {
          message: "Job not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Job deleted successfully.",
        jobId: deletedJob._id,
        status:deletedJob.status,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to delete job.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { uid } = await verifyFirebaseToken(request);
    const body = await request.json();
    const validation = validate(jobDetailSchema, body);
    if (!validation.success) {
      return validationError(validation);
    }
    const data = validation.data;
    console.log(data, "%%%%%%%%%%%%%%");
    const updatedJob = await JobDeatils.findOneAndUpdate(
      {
        _id: id,
        employerId: uid,
      },
      {
        $set: data,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedJob) {
      return NextResponse.json(
        {
          message: "Job not found",
        },
        {
          status: 404,
        },
      );
    }
    return NextResponse.json(
      {
        message: "Successfully Updated the job",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Failed to update the job details.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { uid } = await verifyFirebaseToken(request);
    const job = await JobDeatils.findById(id).lean();
    if (!job) {
      return NextResponse.json(
        {
          message: "Job  not found.",
        },
        {
          status: 404,
        },
      );
    }
    console.log(job, "JOB DATA");
    return NextResponse.json(
      {
        message: "Successfully fetched the job.",
        job,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Failed to fetch the job details.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
