// // skeletons/Step4Skeleton.jsx
// const HAS_ROUNDED = /(^|\s)rounded/;

// const Bar = ({ className = "", tone = "bg-gray-200" }) => (
//   <div className={`${tone} ${HAS_ROUNDED.test(className) ? "" : "rounded"} ${className}`} />
// );

// // A text row with the same height as the real line, with a shorter bar inside
// const Line = ({ height = "h-6", width = "w-full", barHeight = "h-3.5", center = true, tone }) => (
//   <div className={`flex items-center ${center ? "justify-center" : ""} ${height}`}>
//     <Bar className={`${barHeight} ${width}`} tone={tone} />
//   </div>
// );

// export default function Step4Skeleton() {
//   return (
//     // Same outer wrapper as the real page: vertically + horizontally centered
//     <div
//       role="status"
//       aria-busy="true"
//       className="flex min-h-screen items-center justify-center px-5 py-10 md:px-16"
//     >
//       <span className="sr-only">Loading profile photo step…</span>

//       <div aria-hidden="true" className="w-full max-w-md motion-safe:animate-pulse">
//         {/* Header: mb-8 text-center
//             h1 text-2xl (32px) / md:text-3xl (36px), p mt-2 text-sm (20px) / md:text-base (24px).
//             Subtitle is ~60 chars, so it wraps to 2 lines at max-w-md. */}
//         <div className="mb-8">
//           <div className="flex h-8 items-center justify-center md:h-9">
//             <Bar className="h-6 w-3/4 max-w-xs md:h-7" />
//           </div>
//           <div className="mt-2">
//             <Line height="h-5 md:h-6" width="w-full" />
//             <Line height="h-5 md:h-6" width="w-1/2" />
//           </div>
//         </div>

//         {/* Upload area: w-full aspect-square rounded-2xl
//             Inner placeholders mirror the empty state: icon (h-10 w-10), "Click to select"
//             (text-sm), and the format hint (text-xs). */}
//         <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl bg-gray-200 p-6">
//           <Bar className="h-10 w-10 rounded-lg" tone="bg-gray-100" />
//           <Line height="h-5" width="w-40" tone="bg-gray-100" />
//           <Line height="h-4" width="w-52 max-w-full" barHeight="h-3" tone="bg-gray-100" />
//         </div>

//         {/* Actions: mt-6 flex flex-col gap-2
//             Continue button, then the "Skip for now" text button (text-sm = 20px). */}
//         <div className="mt-6 flex flex-col gap-2">
//           <Bar className="h-11 w-full rounded-lg" />
//           <Line height="h-5" width="w-24" />
//         </div>
//       </div>
//     </div>
//   );
// }


const Bar = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const Step4Skeleton = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 md:px-16 py-10">
      <div className="w-full max-w-md">
        {/* Heading */}
        <div className="mb-8 flex flex-col items-center">
          <Bar className="h-8 md:h-9 w-60 md:w-72" />
          <Bar className="mt-3 h-4 w-full max-w-sm" />
          <Bar className="mt-2 h-4 w-2/3" />
        </div>

        {/* Upload / preview area */}
        <Bar className="w-full aspect-square rounded-2xl" />

        {/* Actions */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <Bar className="h-10 w-full rounded-lg" />
          <Bar className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
};

export default Step4Skeleton;
