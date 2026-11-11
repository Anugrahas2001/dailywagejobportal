"use client";
import { fetchUserToken } from "@/lib/fetchUserToken";
import React, { useEffect, useState } from "react";
import { goToPage, timeAgo } from "./commonFunctions";
import { Bell } from "lucide-react";
import Pagination from "./Pagination";
import useControls from "./hooks/useControls";
import { NotificationsListSkeleton } from "./skeltons/NotificationsSkeleton";
import useLoading from "./hooks/useLoading";
import { PAGE_SIZE } from "@/constants/constant";
import Error from "./Error";
import useError from "./hooks/useError";
import { BellOff } from "lucide-react";

const ShowNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { error, setError } = useError();
  const { loading, setLoading } = useLoading();
  const {
    page,
    setPage,
    router,
    dispatch,
    runWithPending,
    isPending,
    initialLoading,
    setInitialLoading,
    totalCount,
    setTotalCount,
  } = useControls();
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 0;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await fetchUserToken();
        setLoading(true);
        const response = await fetch(
          `/api/employer/notifications?page=${page}&limit=12`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          const data = await res.json().catch(() => ({})); // body may not be JSON
          const message =
            data.message ||
            `Failed to fetch notifications (status ${response.status})`;
          setError(message);
          return; // stop here, don't touch job state
        }

        const { data, message, totalCount } = await response.json();

        setNotifications(data);
        setTotalCount(totalCount);
        setLoading(false);
      } catch (error) {
        console.log(error, "ERROR DATA");
        setLoading(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
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
          `/employerDashboard/appliedworkers?jobId=${jobId}&type=applications`,
        );
        break;
    }
  };

  // return (
  //   <div className="mx-auto mt-4 flex w-full max-w-2xl flex-col gap-3">
  //     {initialLoading ? (
  //       <NotificationsListSkeleton />
  //     ) : (
  //       <>
  //       notifications.map((notif) => (
  //         <div
  //           key={notif?._id}
  //           className={`group relative flex items-start cursor-pointer gap-4 overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
  //             notif?.isRead
  //               ? "border-gray-100 bg-white"
  //               : "border-indigo-100 bg-indigo-50/60"
  //           }`}
  //           onClick={() =>
  //             handleNavigation({
  //               notifType: notif?.notifType,
  //               jobId: notif?.data?.jobId,
  //             })
  //           }
  //         >
  //           {/* Accent bar for unread */}
  //           {/* {!notif?.isRead && (
  //           <span className="absolute left-0 top-0 h-full w-1 bg-indigo-500" />
  //         )} */}

  //           {/* Icon */}
  //           <div
  //             className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
  //               notif?.isRead
  //                 ? "bg-gray-100 text-gray-500"
  //                 : "bg-indigo-100 text-indigo-600"
  //             }`}
  //           >
  //             <Bell size={18} />
  //           </div>

  //           {/* Content */}
  //           <div className="flex min-w-0 flex-1 flex-col gap-1">
  //             <div className="flex items-center justify-between gap-3">
  //               <h3 className="truncate text-sm font-semibold text-gray-900">
  //                 {notif?.title}
  //               </h3>
  //               <span className="shrink-0 whitespace-nowrap text-xs font-medium text-gray-400">
  //                 {timeAgo(notif?.createdAt)}
  //               </span>
  //             </div>
  //             <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
  //               {notif?.message}
  //             </p>
  //           </div>
  //         </div>
  //       ))( <Pagination
  //       onClick={(p) => goToPage({ p, totalPages, setPage })}
  //       totalPages={totalPages}
  //       page={page}
  //       totalCount={totalCount}
  //     />)
  //       </>
  //     )}

  //   </div>
  // );

  return (
    <div className="mx-auto mt-4 flex w-full my-2 bg-gray-100 max-w-2xl flex-col gap-3">
      {initialLoading || loading ? (
        <NotificationsListSkeleton />
      ) : (
        <>
          {notifications.length === 0 ? (
            <div className="flex flex-col bg-white items-center rounded-md m-3 justify-center px-6 py-12 text-center md:py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 md:h-20 md:w-20">
                <BellOff className="h-8 w-8 text-blue-500 md:h-10 md:w-10" />
              </div>

              <h3 className="text-base font-semibold text-gray-900 md:text-lg">
                No notifications yet
              </h3>

              <p className="mt-1 max-w-xs text-sm text-gray-500 md:text-base">
                When you get job updates, invitations, or messages, they'll show
                up here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif?._id}
                className={`group relative flex items-start text-sm cursor-pointer gap-4 overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
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
                    <span className="shrink-0 whitespace-nowrap text-xs md:text-sm font-medium text-gray-400">
                      {timeAgo(notif?.createdAt)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                    {notif?.message}
                  </p>
                </div>
              </div>
            ))
          )}

          <Pagination
            onClick={(p) => goToPage({ p, totalPages, setPage })}
            totalPages={totalPages}
            page={page}
            totalCount={totalCount}
          />
        </>
      )}
      {error && <Error error={error} onClick={() => setError("")} />}
    </div>
  );
};

export default ShowNotifications;
