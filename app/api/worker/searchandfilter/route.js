import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobApplication from "@/modals/JobApplication";
import JobDetails from "@/modals/JobDetails";
import SavedJobs from "@/modals/SavedJobs";
import User from "@/modals/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  console.log("app/api/worker/searchandfilter/route.js - GET");
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

    console.log(userLoc, search, nearby, "USER DATA");

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

    function getDistanceInKm([lng1, lat1], [lng2, lat2]) {
      const R = 6371; // Earth radius in km
      const toRad = (deg) => (deg * Math.PI) / 180;

      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // if (nearby) {
    //   const distanceKm = Number(nearby);
    //   console.log(distanceKm, "DISTANCE IN KM");

    //   if (!Number.isNaN(distanceKm) && distanceKm > 0) {
    //     const coordinates = userLoc?.loc?.coordinates;

    //     if (
    //       !coordinates ||
    //       coordinates.length !== 2 ||
    //       coordinates.some((value) => Number.isNaN(Number(value)))
    //     ) {
    //       return NextResponse.json(
    //         {
    //           message:
    //             "Latitude and longitude are required to search for nearby jobs.",
    //         },
    //         {
    //           status: 400,
    //         },
    //       );
    //     }

    //     filter.loc = {
    //       $near: {
    //         $geometry: {
    //           type: "Point",
    //           coordinates: coordinates,
    //         },
    //         $maxDistance: distanceKm * 1000,
    //       },
    //     };
    //   }
    // }

    // let query = JobDetails.find(filter);

    // if (!nearby) {
    //   // no $near in the filter → safe to sort explicitly
    //   query = query.sort({
    //     createdAt: date === "oldest" ? 1 : -1,
    //   });
    // }

    // console.log(filter, "CHECK THE FILTER");

    // const [allJobs, totalCount] = await Promise.all([
    //   query.skip(skip).limit(limit).lean(),
    //   JobDetails.countDocuments(filter),
    // ]);

    // let nearFilter = null;
    // let withinFilter = null;

    // if (nearby) {
    //   const distanceKm = Number(nearby);

    //   if (!Number.isNaN(distanceKm) && distanceKm > 0) {
    //     const coordinates = userLoc?.loc?.coordinates; // [lng, lat]

    //     if (
    //       !coordinates ||
    //       coordinates.length !== 2 ||
    //       coordinates.some((v) => Number.isNaN(Number(v)))
    //     ) {
    //       return NextResponse.json(
    //         {
    //           message:
    //             "Latitude and longitude are required to search for nearby jobs.",
    //         },
    //         { status: 400 },
    //       );
    //     }

    //     // for find(): filters AND sorts nearest-first
    //     nearFilter = {
    //       $near: {
    //         $geometry: { type: "Point", coordinates },
    //         $maxDistance: distanceKm * 1000, // meters
    //       },
    //     };

    //     // for countDocuments(): same radius, no sorting
    //     withinFilter = {
    //       $geoWithin: {
    //         $centerSphere: [coordinates, (distanceKm * 1000) / 6378100], // radians
    //       },
    //     };
    //   }
    // }


let allJobs = [];
let totalCount = 0;

if (nearby) {
  // "0-10" -> [0, 10]
  const [minKm, maxKm] = nearby.split("-").map(Number);

  if (Number.isNaN(minKm) || Number.isNaN(maxKm) || maxKm <= 0 || minKm > maxKm) {
    return NextResponse.json(
      { message: "Invalid nearby distance range." },
      { status: 400 },
    );
  }

  const coordinates = userLoc?.loc?.coordinates; // [lng, lat]

  if (
    !coordinates ||
    coordinates.length !== 2 ||
    coordinates.some((v) => Number.isNaN(Number(v)))
  ) {
    return NextResponse.json(
      { message: "Latitude and longitude are required to search for nearby jobs." },
      { status: 400 },
    );
  }

  // aggregate() does NOT auto-cast like find(), so cast ids manually
  const aggFilter = {
    ...filter,
    _id: { $nin: excludedIds},
  };

  const [result] = await JobDetails.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates },
        distanceField: "distanceInMeters",
        spherical: true,
        minDistance: minKm * 1000,
        maxDistance: maxKm * 1000,
        query: aggFilter,
      },
    },
    {
      $addFields: {
        distanceInKm: { $round: [{ $divide: ["$distanceInMeters", 1000] }, 2] },
      },
    },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ]);

  allJobs = result?.data ?? [];
  totalCount = result?.total?.[0]?.count ?? 0;
} else {
  const query = JobDetails.find(filter).sort({
    createdAt: date === "oldest" ? 1 : -1,
  });

  [allJobs, totalCount] = await Promise.all([
    query.skip(skip).limit(limit).lean(),
    JobDetails.countDocuments(filter),
  ]);
}

    const findFilter = nearFilter ? { ...filter, loc: nearFilter } : filter;
    const countFilter = withinFilter
      ? { ...filter, loc: withinFilter }
      : filter;

    let query = JobDetails.find(findFilter);
    if (!nearFilter) {
      query = query.sort({ createdAt: date === "oldest" ? 1 : -1 });
    }

    // const [allJobs, totalCount] = await Promise.all([
    //   query.skip(skip).limit(limit).lean(),
    //   JobDetails.countDocuments(countFilter),
    // ]);

    const userCoords = userLoc?.loc?.coordinates; // [lng, lat]

    allJobs.forEach((job) => {
      const jobCoords = job.loc?.coordinates; // [lng, lat]

      if (userCoords?.length === 2 && jobCoords?.length === 2) {
        const distanceKm = getDistanceInKm(userCoords, jobCoords);
        console.log(
          `Job: ${job.jobName} | ID: ${job._id} | Distance: ${distanceKm.toFixed(2)} km`,
        );
      } else {
        console.log(
          `Job: ${job.jobName} | ID: ${job._id} | Distance: N/A (missing coordinates)`,
        );
      }
    });

    console.log(allJobs.length, totalCount, "=======================5");

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
