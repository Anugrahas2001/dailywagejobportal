// "use client";
// import { Maximize, X } from "lucide-react";
// import { useRouter } from "next/navigation";

// export default function Modal({ children, jobId, workerId, role }) {
//   const router = useRouter();

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
//       onClick={() => router.back()}
//     >
//       <div
//         className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button
//           onClick={() => {
//             role === "employer"
//               ? window.location.assign(
//                   `/employerDashboard/viewjobapplications/${workerId}?jobId=${jobId}`,
//                 )
//               : window.location.assign(`/workerDashboard/jobs/${jobId}`);
//           }}
//         >
//           <Maximize className="h-5 w-5" />
//         </button>
//         <button
//           onClick={() => router.back()}
//           // className="absolute right-4 top-4 text-2xl cursor-pointer p-2 bg-gray-400"
//           className="rounded-full cursor-pointer absolute top-2 right-2 p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
//         >
//           <X className="h-5 w-5" />
//         </button>

//         {children}
//       </div>
//     </div>
//   );
// }

"use client";

import { Maximize, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Modal({ children, jobId, workerId, role }) {
  console.log(role, jobId, "ROLE OF THE USER");
  const router = useRouter();

  const handleMaximize = () => {
    role === "employer" &&
      window.location.assign(
        `/employerDashboard/viewjobapplication/${workerId}?jobId=${jobId}`,
      );
    // if (role === "employer") {
    // window.location.assign(
    //   `/employerDashboard/viewjobapplication/${workerId}?jobId=${jobId}`,
    // );
    // } else {
    //   window.location.assign(`/workerDashboard/jobs/${jobId}`);
    // }
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
