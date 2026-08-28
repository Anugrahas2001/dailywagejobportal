import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobDetails from "@/modals/JobDetails";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const { uid } = await verifyFirebaseToken(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;

    const skip = (page - 1) * limit;

    if (!status) {
      return NextResponse.json(
        {
          message: "The status query parameter is required.",
        },
        {
          status: 400,
        },
      );
    }

    const filter = {
      employerId: uid,
      isDeleted: false,
    };
    console.log(status, "STATUS DATA");
    if (status !== "All") {
      filter.status = status;
    }

    const jobs = await JobDetails.find(filter).lean().skip(skip).limit(limit);
    const totalCount = await JobDetails.countDocuments(filter);

    return NextResponse.json(
      {
        message: "Jobs fetched successfully.",
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
        message: "Unable to fetch jobs. Please try later.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
