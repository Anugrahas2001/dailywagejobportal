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

    const validation = validate(jobDetailSchema, obj);

    if (!validation.success) {
      return validationError(validation);
    }

    const newJob = await JobDetails.create(validation.data);

    return NextResponse.json(
      {
        message: "New job created successfully.",
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
        message: "Unable to create the job. Please try again later.",
        error: error.message,
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
        totalCount: result.totalCount[0]?.count,
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
