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
    console.log(page, limit, skip, "CHECK THESE 3");

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

    console.log(jobs.length, "WITH STATUS");
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
