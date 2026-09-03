"use client";

import { Maximize, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Modal({ children, jobId, workerId, role, matchingRate, type }) {
  console.log(jobId, workerId, role, matchingRate, type, "ROLE OF THE USER");
  const router = useRouter();

  const handleMaximize = () => {
    role === "employer" &&
      window.location.assign(
        `/employerDashboard/viewjobapplication/${workerId}?jobId=${jobId}&type=${type}&matching=${matchingRate}`,
      );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => router.back()}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal buttons */}
        <div className="absolute right-3 top-3 z-50 flex items-center gap-2">
          {role === "employer" && (
            <button
              type="button"
              onClick={handleMaximize}
              className="cursor-pointer rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              title="Open full page"
            >
              <Maximize className="h-5 w-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => router.back()}
            className="cursor-pointer rounded-full px-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-7">{children}</div>
      </div>
    </div>
  );
}
