import { generateId } from "@/lib/generateRandomId";
import { connectDB } from "@/lib/mongodb";
import { validate } from "@/lib/validate";
import { validationError } from "@/lib/validationError";
import { jobDetailSchema } from "@/lib/validations/employer/employerJobValidation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobDetails from "@/modals/JobDetails";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    const body = await request.json();

    const obj = {
      _id: generateId(),
      employerId: uid,
      ...body,
    };

    // console.log(obj, "FOR VALIDATION");

    const validation = validate(jobDetailSchema, obj);

    if (!validation.success) {
      return validationError(validation);
    }

    const newJob = await JobDetails.create(validation.data);
    console.log(newJob, "THE NEW JOB CREATED");
    return NextResponse.json(
      {
        message: "A new job created successfully.",
        data: newJob,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log(error, "BACKEND ERROR");
    return NextResponse.json(
      {
        message: "failed to create a new job.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

// export async function GET(request) {
//   try {
//     await connectDB();
//     const counts = {
//       All: 0,
//       Active: 0,
//       Paused: 0,
//       Completed: 0,
//     };

//     console.log("I'M STARTING TOEXECUTE");
//     const { uid } = await verifyFirebaseToken(request);
//     const { searchParams } = new URL(request.url);
//     const page = Number(searchParams.get("page")) || 1;
//     const limit = Number(searchParams.get("limit")) || 10;

//     const skip = (page - 1) * limit;

//     const allJobs = await JobDetails.find({
//       employerId: uid,
//       isDeleted: false,
//       // _id: { $nin: appliedJobIds },
//     })
//       .lean();

//     console.log(allJobs, "ALL THE AVAILABLE JOBS",allJobs.length);
//     for (const job of allJobs) {
//       if (counts[job.status] !== undefined) {
//         counts[job.status]++;
//         console.log(counts[job.status], "DATA");
//       }
//     }
//     counts.All = allJobs.length;
//     console.log(counts, "&&&&&&&&&&&&");

//     const allJobsIds = allJobs.map((job) => job?._id);

//     const numberofApplications = await JobApplication.aggregate([
//       {
//         $match: {
//           jobId: { $in: allJobsIds },
//           status: { $in: ["applied", "viewed", "shortlisted"] },
//           cancelled: false,
//         },
//       },
//       {
//         $group: {
//           _id: "$jobId",
//           totalApplications: { $sum: 1 },
//         },
//       },
//     ]);

//     console.log(numberofApplications, "CHECK THIS");

//     return NextResponse.json(
//       {
//         message: "Successfully fetched all the available jobs.",
//         data: allJobs,
//         counts,
//         numberofApplications,
//       },
//       {
//         status: 200,
//       },
//     );
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json(
//       {
//         message: "Failed to fetch all the avilable jobs.",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

export async function GET(request) {
  try {
    await connectDB();

    const { uid } = await verifyFirebaseToken(request);
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    const matchStage = {
      employerId: uid,
      isDeleted: false,
    };

    const [result] = await JobDetails.aggregate([
      { $match: matchStage },
      {
        $facet: {
          jobs: [
            { $sort: { createdAt: -1 } }, // adjust to whatever sort you want
            { $skip: skip },
            { $limit: limit },
          ],
          statusCounts: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    // console.log(result, "RESULT DATA");

    const counts = { All: 0, Active: 0, Paused: 0, Completed: 0 };
    result.statusCounts.forEach(({ _id, count }) => {
      if (counts[_id] !== undefined) counts[_id] = count;
    });
    counts.All = result.totalCount[0]?.count || 0;

    return NextResponse.json(
      {
        message: "Successfully fetched all the available jobs.",
        data: result.jobs,
        counts,
        totalCount:result.totalCount[0]?.count
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Failed to fetch all the available jobs." },
      { status: 500 },
    );
  }
}
