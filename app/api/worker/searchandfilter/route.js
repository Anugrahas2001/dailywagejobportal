import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobApplication from "@/modals/JobApplication";
import JobDetails from "@/modals/JobDetails";
import SavedJobs from "@/modals/SavedJobs";
import User from "@/modals/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page"));
    const limit = Number(searchParams.get("limit")) || 12;
    const search = searchParams.get("search");
    const nearby = searchParams.get("nearby");
    const shift = searchParams.get("shift");
    const salary = searchParams.get("salary");
    const availability = searchParams.get("availability");
    const date = searchParams.get("sortType");

    console.log(search, nearby, shift, salary, date, "SEARCH");
    const skip = (page - 1) * limit;

    const userLoc = await User.findById(uid).select("loc.coordinates").lean();

    const appliedJobs = await JobApplication.find(
      { workerId: uid },
      { jobId: 1 },
    ).lean();

    const appliedJobIds = appliedJobs.map((job) => job.jobId);
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
    console.log(excludedIds.length, "ALL THE EXCLUDEDiDS");

    console.log(userLoc, "USER DATA");

    const filter = {
      isDeleted: false,
      status: "Active",
      _id: { $nin: excludedIds },
    };

    if (search) {
      filter.$or = [
        { jobName: { $regex: search, $options: "i" } },
        { jobCategory: { $regex: search, $options: "i" } },
      ];
    }

    if (shift) {
      filter.jobShift = shift;
    }

    if (availability) {
      filter.availability = availability;
    }

    if (salary) {
      if (salary === "0-500") {
        filter.minSalary = { $lte: 500 };
      }

      if (salary === "500-1000") {
        filter.minSalary = { $lte: 1000 };
        filter.maxSalary = { $gte: 500 };
      }

      if (salary === "1000-2000") {
        filter.minSalary = { $lte: 2000 };
        filter.maxSalary = { $gte: 1000 };
      }

      if (salary === "2000+") {
        filter.maxSalary = { $gte: 2000 };
      }
    }

    if (nearby) {
      const distanceKm = Number(nearby);

      if (!Number.isNaN(distanceKm) && distanceKm > 0) {
        const coordinates = userLoc?.loc?.coordinates;

        if (
          !coordinates ||
          coordinates.length !== 2 ||
          coordinates.some((value) => Number.isNaN(Number(value)))
        ) {
          return NextResponse.json(
            {
              message:
                "Latitude and longitude are required to search for nearby jobs.",
            },
            {
              status: 400,
            },
          );
        }

        filter.loc = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: coordinates,
            },
            $maxDistance: distanceKm * 1000,
          },
        };
      }
    }

    let query = JobDetails.find(filter);

    if (!nearby) {
      // no $near in the filter → safe to sort explicitly
      query = query.sort({
        createdAt: date === "oldest" ? 1 : -1,
      });
    }

    console.log(filter, "CHECK THE FILTER");

    const [allJobs, totalCount] = await Promise.all([
      query.skip(skip).limit(limit).lean(),
      JobDetails.countDocuments(filter),
    ]);
    // console.log("=======================4");

    // console.log(
    //   "RESULT ORDER:",
    //   allJobs.map((job) => ({
    //     id: job._id,
    //     createdAt: job.createdAt,
    //   })),
    // );

    // console.log(date, "=======================5");

    return NextResponse.json(
      {
        data: allJobs,
        totalCount,
        sortType: date,
        message: "Search and filter results fetched successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");

    return NextResponse.json(
      {
        message:
          "Unable to fetch search and filter results. Please try again later.",
      },
      {
        status: 500,
      },
    );
  }
}
