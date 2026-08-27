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
    const date = searchParams.get("date");

    console.log(page, limit, "PAGE AND LIMIT");
    console.log(search, nearby, shift, salary, date, "SEARCH");
    const skip = (page - 1) * limit;

    const userLoc = await User.findById(uid).select("loc.coordinates").lean();

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

    // if (nearby) {
    //   const distanceKm = Number(nearby);

    //   if (!Number.isNaN(distanceKm) && Number(distanceKm) > 0) {
    //     if (
    //       Number.isNaN(userLoc.coordinates?.longitude) ||
    //       Number.isNaN(userLoc.coordinates?.latitude)
    //     ) {
    //       return NextResponse.json(
    //         {
    //           message: "Longitude and latitude are required for search.",
    //         },
    //         {
    //           status: 404,
    //         },
    //       );
    //     }

    //     filter.loc = {
    //       $near: {
    //         $geometry: {
    //           type: "Point",
    //           coordinates: [
    //             userLoc.coordinates?.longitude,
    //             userLoc.coordinates?.latitude,
    //           ],
    //         },
    //       },
    //     };
    //   }
    // }

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
                "User longitude and latitude are required for nearby search.",
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

    let sort = {
      createdAt: -1,
    };

    if (date === "oldest") {
      sort = {
        createdAt: 1,
      };
    }

    console.log("================================");
    console.log("DATE:", date);
    console.log("SORT:", JSON.stringify(sort));
    console.log("================================");
    let query = JobDetails.find(filter);

    if (!nearby) {
      // no $near in the filter → safe to sort explicitly
      query = query.sort(sort);
      // console.log(query,"INSIDE OF THE NEARBY");
    }

    console.log(sort, filter, "CHECK THE FILTER");

    // const [allJobs, totalCount] = await Promise.all([
    //   query.skip(skip).limit(limit),
    //   JobDetails.countDocuments(filter),
    // ]);

    // console.log(allJobs.length, "ALL JOBS", totalCount);

    const [allJobs, totalCount] = await Promise.all([
      query.skip(skip).limit(limit).lean(),
      JobDetails.countDocuments(filter),
    ]);

    console.log(
      "RESULT ORDER:",
      allJobs.map((job) => ({
        id: job._id,
        createdAt: job.createdAt,
      })),
    );

    return NextResponse.json(
      {
        data: allJobs,
        totalCount,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");

    return NextResponse.json(
      {
        message: "Failed to perform the search and filter operations.",
      },
      {
        status: 500,
      },
    );
  }
}
