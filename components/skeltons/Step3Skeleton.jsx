// // skeletons/Step3Skeleton.jsx
// const HAS_ROUNDED = /(^|\s)rounded/;

// const Bar = ({ className = "", tone = "bg-gray-200" }) => (
//   <div className={`${tone} ${HAS_ROUNDED.test(className) ? "" : "rounded"} ${className}`} />
// );

// // A text row with the same height as the real line, with a shorter bar inside
// const Line = ({ height = "h-6", width = "w-full", barHeight = "h-3.5", className = "" }) => (
//   <div className={`flex items-center ${height} ${className}`}>
//     <Bar className={`${barHeight} ${width}`} />
//   </div>
// );

// // Suggested-skill chips: px-4 py-2 text-sm + 1px border = h-[38px]
// const CHIP_WIDTHS = ["w-24", "w-32", "w-20", "w-28", "w-36", "w-24", "w-28"];

// // EXPERIENCE_LEVELS radios (assumed 3 options): radio + label text
// const RADIO_WIDTHS = ["w-16", "w-24", "w-14"];

// export default function Step3Skeleton() {
//   return (
//     <div role="status" aria-busy="true" className="mx-auto max-w-2xl">
//       {/* <span className="sr-only">Loading skills form…</span> */}

//       {/* Same wrapper classes as the real page: space-y-8 between sections */}
//       <div aria-hidden="true" className="space-y-8 motion-safe:animate-pulse">
//         {/* Header: mb-8 mt-6
//             h1 text-2xl (32px) / md:text-3xl (36px), p mt-2 text-sm (20px) / md:text-base (24px).
//             Subtitle wraps to ~3 lines on mobile and 2 lines from md up. */}
//         <div className="mb-8 mt-6">
//           <div className="flex h-8 items-center md:h-9">
//             <Bar className="h-6 w-3/4 max-w-xs md:h-7" />
//           </div>
//           <div className="mt-2">
//             <Line height="h-5 md:h-6" width="w-full" />
//             <Line height="h-5 md:h-6" width="w-full" />
//             <Line height="h-5 md:hidden" width="w-1/3" />
//           </div>
//         </div>

//         {/* Bio: mx-5 space-y-2
//             label (24px) + textarea rows=4 (4 x 24px + py-3 + border = 122px) + counter text-xs (16px) */}
//         <div className="mx-5 space-y-2">
//           <Line height="h-6" width="w-10" barHeight="h-3.5" />
//           <Bar className="h-[122px] w-full rounded-lg" />
//           <div className="flex h-4 items-center justify-end">
//             <Bar className="h-3 w-12" />
//           </div>
//         </div>

//         {/* Skills: px-4 space-y-4 */}
//         <div className="space-y-4 px-4">
//           {/* "Add Skill" label (24px) */}
//           <Line height="h-6" width="w-24" />

//           {/* Required Skills: heading text-sm (20px) + mb-2, then chips mt-4 gap-2.
//               Shown whenever the category has suggested skills (true for any real category). */}
//           <div className="mt-4">
//             <div className="mb-2 flex h-5 items-center">
//               <Bar className="h-3.5 w-28" />
//             </div>
//             <div className="mt-4 flex w-full flex-wrap gap-2">
//               {CHIP_WIDTHS.map((w, i) => (
//                 <Bar key={i} className={`h-[38px] rounded-full ${w}`} />
//               ))}
//             </div>
//           </div>

//           {/* "Or type your own skill" input: py-2 text-sm + border = 38px */}
//           <Bar className="h-[38px] w-full rounded-lg" />

//           {/* Experience level: px-4, heading (24px) + mb-3, radios gap-5 */}
//           <div className="px-4">
//             <div className="mb-3 flex h-6 items-center">
//               <Bar className="h-3.5 w-32" />
//             </div>
//             <div className="flex flex-wrap gap-5">
//               {RADIO_WIDTHS.map((w, i) => (
//                 <div key={i} className="flex h-6 items-center gap-2">
//                   <Bar className="h-4 w-4 shrink-0 rounded-full" />
//                   <Bar className={`h-3.5 ${w}`} />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* "+ Add Skill" button: px-4 py-2 text-base = 40px */}
//           <Bar className="h-10 w-28 rounded-lg" />
//         </div>

//         {/* Skill cards are not shown: the real page starts with skills = [] */}

//         {/* Counter: text-center text-sm (20px) */}
//         <div className="flex h-5 items-center justify-center">
//           <Bar className="h-3.5 w-56 max-w-full" />
//         </div>

//         {/* Submit */}
//         <div className="flex w-full justify-center pb-6">
//           <Bar className="h-11 w-72 max-w-full rounded-lg" />
//         </div>
//       </div>
//     </div>
//   );
// }




const Bar = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const Step3Skeleton = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Heading */}
      <div className="mb-8 mt-6">
        <Bar className="h-8 md:h-9 w-64 md:w-80" />
        <Bar className="mt-3 h-4 w-full" />
        <Bar className="mt-2 h-4 w-3/4" />
      </div>

      {/* Bio */}
      <div className="space-y-2 mx-5">
        <Bar className="h-5 w-10" />
        <Bar className="h-28 w-full rounded-lg" />
        <div className="flex justify-end">
          <Bar className="h-3 w-12" />
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-4 px-4">
        <Bar className="h-5 w-20" />

        {/* Required skills chips */}
        <div className="mt-4">
          <Bar className="mb-2 h-4 w-28" />
          <div className="flex flex-wrap gap-2 w-full mt-4">
            <Bar className="h-9 w-24 rounded-full" />
            <Bar className="h-9 w-28 rounded-full" />
            <Bar className="h-9 w-20 rounded-full" />
            <Bar className="h-9 w-32 rounded-full" />
            <Bar className="h-9 w-24 rounded-full" />
            <Bar className="h-9 w-28 rounded-full" />
          </div>
        </div>

        {/* Custom skill input */}
        <Bar className="h-10 w-full rounded-lg" />

        {/* Experience level */}
        <div className="px-4">
          <Bar className="mb-3 h-5 w-32" />
          <div className="flex flex-wrap gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Bar className="h-4 w-4 rounded-full" />
                <Bar className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Add skill button */}
        <Bar className="h-10 w-28 rounded-lg" />
      </div>

      {/* Skill count */}
      <div className="flex justify-center">
        <Bar className="h-4 w-56" />
      </div>

      {/* Submit */}
      <div className="flex justify-center w-full pb-6">
        <Bar className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
};

export default Step3Skeleton;
