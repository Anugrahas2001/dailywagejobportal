"use client";
import { fetchUserToken } from "@/lib/fetchUserToken";
import React, { useEffect, useState } from "react";
import { timeAgo } from "./commonFunctions";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

const ShowNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageLimit = 12;
  const pageNumbers = totalCount / pageLimit;
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await fetchUserToken();
        const response = await fetch(
          `/api/employer/notifications?page=${page}&limit=12`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const { data, message, totalCount } = await response.json();

        if (!response.ok) {
          console.log(
            message || "Something went wrong with the notification fetching",
          );
        }
        console.log(data, "ALL THE NOTIFICATIONS DATA");
        setNotifications(data);
        setTotalCount(totalCount);
      } catch (error) {
        console.log(error, "ERROR DATA");
      }
    };

    fetchNotifications();
  }, [page]);

  const handleNavigation = ({ notifType, jobId }) => {
    switch (notifType) {
      case "NEW_JOB_CREATED":
        router.push("/workerDashboard");
        break;
      case "NEW_JOB_APPLICATION":
        router.push(
          `/employerDashboard/appliedworkers?jobId=${jobId}&type=applications`,
        );
        break;
      case "JOB_INVITATION":
        router.push("/workerDashboard/myjobs");
        break;
      case "UPDATED_JOB_APP_STATUS":
        router.push("/workerDashboard/myjobs");
        break;
      case "JOB_INVITATION_ACCEPTED":
        router.push(
          "/employerDashboard/appliedworkers?jobId=${jobId}&type=applications",
        );
        break;
    }
  };

  return (
    //   <div className="flex flex-col gap-3">
    //     {notifications.map((notif) => (
    //       <div
    //         key={notif?._id}
    //         className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:bg-gray-50"
    //       >
    //         <div className="flex min-w-0 flex-col gap-1">
    //           <h3 className="truncate text-sm font-semibold text-gray-900">
    //             {notif?.title}
    //           </h3>
    //           <p className="text-sm text-gray-600">{notif?.message}</p>
    //         </div>

    //         <span className="shrink-0 whitespace-nowrap text-xs text-gray-400">
    //           {timeAgo(notif?.createdAt)}
    //         </span>
    //       </div>
    //     ))}
    //   </div>

    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
      {notifications.map((notif) => (
        <div
          key={notif?._id}
          className={`group relative flex items-start gap-4 overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
            notif?.isRead
              ? "border-gray-100 bg-white"
              : "border-indigo-100 bg-indigo-50/60"
          }`}
          onClick={() =>
            handleNavigation({
              notifType: notif?.notifType,
              jobId: notif?.data?.jobId,
            })
          }
        >
          {/* Accent bar for unread */}
          {/* {!notif?.isRead && (
            <span className="absolute left-0 top-0 h-full w-1 bg-indigo-500" />
          )} */}

          {/* Icon */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              notif?.isRead
                ? "bg-gray-100 text-gray-500"
                : "bg-indigo-100 text-indigo-600"
            }`}
          >
            <Bell size={18} />
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <h3 className="truncate text-sm font-semibold text-gray-900">
                {notif?.title}
              </h3>
              <span className="shrink-0 whitespace-nowrap text-xs font-medium text-gray-400">
                {timeAgo(notif?.createdAt)}
              </span>
            </div>
            <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
              {notif?.message}
            </p>
          </div>

          {/* Unread dot */}
          {/* {!notif?.isRead && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
        )} */}
        </div>
      ))}
    </div>
  );
};

export default ShowNotifications;
