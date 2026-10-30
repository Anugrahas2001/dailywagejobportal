import { JOB_STATUS_VALUES } from "@/constants/constant";
import { connectDB } from "@/lib/mongodb";
import { matchQueue } from "@/lib/queues/matchQueue";
import { validate } from "@/lib/validate";
import { validationError } from "@/lib/validationError";
import { jobUpdateSchema } from "@/lib/validations/employer/employerJobValidation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobDetails from "@/modals/JobDetails";
import JobDeatils from "@/modals/JobDetails";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  console.log("app/api/employer/job/[id]/route.js - DELETE");
  try {
    await connectDB();

    const { id } = await params;
    const { uid } = await verifyFirebaseToken(request);

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
        status: deletedJob.status,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Unable to delete the job. Please try again.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

// export async function PUT(request, { params }) {
//   console.log("app/api/employer/job/[id]/route.js - PUT");
//   try {
//     await connectDB();
//     const { id } = await params;
//     const { uid } = await verifyFirebaseToken(request);
//     const body = await request.json();
//     console.log(body, id, uid, "============================");
//     const validation = validate(jobDetailSchema, body);
//     if (!validation.success) {
//       return validationError(validation);
//     }
//     const data = validation.data;

//     const existingJob=await jobDetails.findById(id).lean();

//     if(!existingJob){
//       return NextResponse.json({
//         message:"Job Not Found"
//       },{
//         status:404
//       })
//     }

//     const updatedJob = await JobDeatils.findOneAndUpdate(
//       {
//         _id: id,
//         employerId: uid,
//       },
//       {
//         $set: {
//           ...existingJob,data
//         },
//       },
//       {
//         new: true,
//         runValidators: true,
//       },
//     );
//     if (!updatedJob) {
//       return NextResponse.json(
//         {
//           message: "Job not found.",
//         },
//         {
//           status: 404,
//         },
//       );
//     }

//     // for (const job of candidateJobs) {
//     await matchQueue.add(
//       "compute-matches",
//       { jobId: updatedJob._id, employerId: uid },
//       { jobId: `job-${updatedJob._id}` },
//       // { jobId: `job-${updatedJob._id}`, delay: 10000 }, // debounce rapid edits
//     );

//     return NextResponse.json(
//       {
//         message: "Job updated successfully.",
//         data: updatedJob,
//       },
//       {
//         status: 200,
//       },
//     );
//   } catch (error) {
//     console.log(error, "ERROR DATA");
//     return NextResponse.json(
//       {
//         message: "Unable to update the job. Please try later.",
//         error: error.message,
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

// Fields that change who a job should match with
const MATCH_FIELDS = [
  "jobCategory",
  "jobShift",
  "loc",
  "skillsRequired",
  "minSalary",
  "maxSalary",
  "genderPreference",
  "availability",
];

const json = (message, status, extra = {}) =>
  NextResponse.json({ message, ...extra }, { status });

export async function PUT(request, { params }) {
  try {
    console.log("22222222222@@@@@@@@@@@@@@@@@@@@@@$$$$$$$$$$%%%%%%%%%%%%");
    const { uid } = await verifyFirebaseToken(request);
    const { id } = await params;
    if (!id || id.length > 64) return json("Invalid job id.", 400);

    // 2. Parse body safely
    let body;
    try {
      body = await request.json();
    } catch {
      return json("Invalid JSON body.", 400);
    }

    // 3. Validate with the partial update schema
    const validation = validate(jobUpdateSchema, body);
    if (!validation.success) return validationError(validation);

    const data = validation.data;
    if (Object.keys(data).length === 0) {
      return json("No fields to update.", 400);
    }

    await connectDB();

    const filter = { _id: id, employerId: uid, isDeleted: { $ne: true } };

    // 4. Cross-field salary check, only when exactly one side was sent
    if ((data.minSalary !== undefined) !== (data.maxSalary !== undefined)) {
      const existing = await JobDetails.findOne(filter)
        .select("minSalary maxSalary")
        .lean();

      if (!existing) return json("Job not found.", 404);

      const min = data.minSalary ?? existing.minSalary;
      const max = data.maxSalary ?? existing.maxSalary;
      if (max < min) {
        return json(
          "Maximum salary must be greater than or equal to minimum salary.",
          400,
        );
      }
    }

    // 5. Update only the fields that were sent
    const updatedJob = await JobDetails.findOneAndUpdate(
      filter,
      { $set: data },
      { new: true, runValidators: true, lean: true },
    );

    if (!updatedJob) return json("Job not found.", 404);

    // 6. Recompute matches only when it matters
    const needsMatching =
      updatedJob.status === JOB_STATUS_VALUES.ACTIVE &&
      (data.status === JOB_STATUS_VALUES.ACTIVE ||
        MATCH_FIELDS.some((f) => f in data));

    if (needsMatching) {
      try {
        // await matchQueue.add(
        //   "compute-matches",
        //   { jobId: updatedJob._id, employerId: uid },
        //   { jobId: `job-${updatedJob._id}`, removeOnComplete: true },
        // );
        
        // when a job is EDITED
        await matchQueue.add(
          "compute-matches",
          { jobId: updatedJob._id.toString(), employerId: uid, notify: false },
          { jobId: `job-${updatedJob._id}`, removeOnComplete: true },
        );
      } catch (queueError) {
        // The job is already saved, so don't fail the request
        console.error("QUEUE ERROR:", queueError);
      }
    }

    return json("Job updated successfully.", 200, { data: updatedJob });
  } catch (error) {
    console.error("JOB UPDATE ERROR:", error);

    if (error?.name === "ValidationError") {
      return json("Invalid job data.", 400);
    }
    if (error?.name === "CastError") {
      return json("Invalid job id.", 400);
    }

    // Don't leak internal error details to the client
    return json("Unable to update the job. Please try later.", 500);
  }
}

export async function GET(request, { params }) {
  console.log("app/api/employer/job/[id]/route.js - GET");
  try {
    await connectDB();
    const { id } = await params;
    const { uid } = await verifyFirebaseToken(request);
    const job = await JobDeatils.findById(id).lean();
    if (!job) {
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
        message: "Job Details fetched successfully.",
        result: job,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Unable to fetch the job details. Please try later.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
