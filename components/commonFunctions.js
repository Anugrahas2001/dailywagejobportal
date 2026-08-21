import { JOINING_TYPES, SHIFT_TYPES } from "@/constants/constant";
import { fetchUserToken } from "@/lib/fetchUserToken";

export const getShiftLabel = (shiftValue) => {
  return (
    SHIFT_TYPES.find((shift) => shift.value === shiftValue)?.label ?? shiftValue
  );
};

export const getJoingDate = (joingTime) => {
  return (
    JOINING_TYPES.find((joining) => joining.value === joingTime)?.label ??
    joingTime
  );
};

export const fetchAvailableJobs = async (role, page) => {
  const token = await fetchUserToken();

  if (!token) {
    throw new Error("User is not authenticated.");
  }

  const url =
    role === "worker"
      ? `/api/worker/jobs?status=Active&page=${page}&limit=12`
      : `/api/employer/job?page=${page}&limit=12`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch jobs.");
  }

  return {
    data: result.data,
    counts: result.counts,
    totalCount: result.totalCount,
  };
};

export const getPostedText = ({ createdAt, jobType }) => {
  const createdDate = new Date(createdAt);
  const today = new Date();

  const diffInMs = today - createdDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Posted today";
  }

  if (diffInDays === 1) {
    return "Posted 1 day ago";
  }

  return `${jobType === "saved" ? "Posted" : "Applied"} ${diffInDays} days ago`;
};

export function getStatusColor(status) {
  // const formattedStatus =
  // status.charAt(0).toUpperCase() + status.slice(1);
  console.log(status, "STATUS DATA");
  switch (status) {
    // Application statuses
    case "Applied":
      return {
        dot: "bg-blue-500",
        text: "text-blue-700",
      };

    case "Viewed":
      return {
        dot: "bg-indigo-500",
        text: "text-indigo-700",
      };

    case "Shortlisted":
      return {
        dot: "bg-purple-500",
        text: "text-purple-700",
      };

    case "Accepted":
      return {
        dot: "bg-green-500",
        text: "text-green-700",
      };

    case "Rejected":
      return {
        dot: "bg-red-500",
        text: "text-red-700",
      };

    // Job statuses
    case "All":
      return {
        dot: "bg-blue-500",
        text: "text-blue-700",
      };

    case "Active":
      return {
        dot: "bg-green-500",
        text: "text-green-700",
      };

    case "Paused":
      return {
        dot: "bg-amber-500",
        text: "text-amber-700",
      };

    case "Completed":
      return {
        dot: "bg-gray-500",
        text: "text-gray-700",
      };

    case "Closed":
      return {
        dot: "bg-red-500",
        text: "text-red-700",
      };

    default:
      return {
        dot: "bg-gray-500",
        text: "text-gray-700",
      };
  }
}
