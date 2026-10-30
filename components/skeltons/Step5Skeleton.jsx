// // skeletons/Step5Skeleton.jsx
// const HAS_ROUNDED = /(^|\s)rounded/;

// const Bar = ({ className = "", tone = "bg-gray-200" }) => (
//   <div
//     className={`${tone} ${HAS_ROUNDED.test(className) ? "" : "rounded"} ${className}`}
//   />
// );

// // A text row with the same height as the real line, with a shorter bar inside
// const Line = ({ height = "h-6", width = "w-full", barHeight = "h-3.5" }) => (
//   <div className={`flex items-center justify-center ${height}`}>
//     <Bar className={`${barHeight} ${width}`} />
//   </div>
// );

// export default function Step5Skeleton() {
//   return (
//     // Same page + card chrome as the real component (static, not pulsing)
//     <div
//       role="status"
//       aria-busy="true"
//       className="flex min-h-screen items-center justify-center bg-gray-50 px-4"
//     >
//       <span className="sr-only">Loading face verification…</span>

//       <div className="w-full max-w-2xl rounded-2xl border bg-white p-8 shadow-lg">
//         <div aria-hidden="true" className="motion-safe:animate-pulse">
//           {/* Header: mb-8 text-center
//               h1 text-3xl (36px), p mt-2 text-base (24px), one line */}
//           <div className="mb-8">
//             <div className="flex h-9 items-center justify-center">
//               <Bar className="h-7 w-3/5 max-w-xs" />
//             </div>
//             <div className="mt-2">
//               <Line height="h-6" width="w-4/5 max-w-sm" />
//             </div>
//           </div>

//           {/* Initial state (active = false): flex flex-col items-center gap-4
//               "Start Face Verification": px-8 py-3 text-base = 48px
//               "Skip for now": text-base = 24px */}
//           <div className="flex flex-col items-center gap-4">
//             <Bar className="h-12 w-64 max-w-full rounded-lg" />
//             <Line height="h-6" width="w-24" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


const Bar = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const Step5Skeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-lg border p-8">
        {/* Heading */}
        <div className="mb-8 flex flex-col items-center">
          <Bar className="h-9 w-56" />
          <Bar className="mt-3 h-4 w-72 max-w-full" />
        </div>

        {/* Camera preview area */}
        <div className="flex flex-col items-center gap-6">
          <Bar className="w-full max-w-lg aspect-[4/3] rounded-xl" />

          {/* Primary action */}
          <Bar className="h-12 w-48 rounded-lg" />

          {/* Skip link */}
          <Bar className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
};

export default Step5Skeleton;
