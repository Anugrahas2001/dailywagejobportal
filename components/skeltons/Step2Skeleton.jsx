// // skeletons/Step2Skeleton.jsx
// const HAS_ROUNDED = /(^|\s)rounded/;

// // Your Step2 <form> has no gap utility, so the space between fields comes from
// // InputField / SelectField themselves. Change this to match their real spacing
// // (e.g. "gap-4" if they use mb-4, "gap-5" to match Step1).
// const FIELD_GAP = "gap-5";

// const Bar = ({ className = "", tone = "bg-gray-200" }) => (
//   <div className={`${tone} ${HAS_ROUNDED.test(className) ? "" : "rounded"} ${className}`} />
// );

// // Label row: text-sm = 20px line height
// const Label = ({ width = "w-24" }) => (
//   <div className="flex h-5 items-center">
//     <Bar className={`h-3.5 ${width}`} />
//   </div>
// );

// // Input / select box: py-2 + text-sm (20px) + 1px border top/bottom = 38px
// const InputBox = ({ className = "w-full" }) => (
//   <Bar className={`h-[38px] rounded-lg ${className}`} />
// );

// // Wrapper: flex flex-col gap-1.5 (same as InputField / SelectField)
// const Field = ({ labelWidth }) => (
//   <div className="flex w-full flex-col gap-1.5">
//     <Label width={labelWidth} />
//     <InputBox />
//   </div>
// );

// // One entry per field, in the same order as the real form
// const FIELD_LABEL_WIDTHS = [
//   "w-20", // Job Title
//   "w-28", // Job Category
//   "w-40", // Minimum Salary/Day
//   "w-40", // Maximum Salary/Day
//   "w-52", // Location Range in Meters
//   "w-24", // Shift Type
//   "w-36", // Salary Credit Type
//   "w-28", // Joining Period
// ];

// export default function Step2Skeleton() {
//   return (
//     <div role="status" aria-busy="true" className="mx-5 md:mx-16">
//       {/* <span className="sr-only">Loading job preferences form…</span> */}

//       <div aria-hidden="true" className="motion-safe:animate-pulse">
//         {/* Header: mb-8 mt-6
//             h1 text-2xl (32px) / md:text-3xl (36px), p mt-2 text-sm (20px) / md:text-base (24px).
//             The real subtitle wraps to 2 lines on narrow screens, so reserve 2 lines there. */}
//         <div className="mb-8 mt-6">
//           <div className="flex h-8 items-center md:h-9">
//             <Bar className="h-6 w-4/5 max-w-sm md:h-7" />
//           </div>
//           <div className="mt-2 space-y-0">
//             <div className="flex h-5 items-center md:h-6">
//               <Bar className="h-3.5 w-full max-w-lg" />
//             </div>
//             <div className="flex h-5 items-center md:hidden">
//               <Bar className="h-3.5 w-1/3" />
//             </div>
//           </div>
//         </div>

//         {/* Form: 8 label + input fields */}
//         <div className={`flex flex-col ${FIELD_GAP}`}>
//           {FIELD_LABEL_WIDTHS.map((w, i) => (
//             <Field key={i} labelWidth={w} />
//           ))}

//           {/* Submit: flex justify-center */}
//           <div className="flex w-full justify-center pb-6">
//             <Bar className="h-11 w-72 max-w-full rounded-lg" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



const Bar = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const FieldSkeleton = ({ labelWidth = "w-24" }) => (
  <div className="flex flex-col gap-1.5 w-full mb-5">
    <Bar className={`h-4 ${labelWidth}`} />
    <Bar className="h-10 w-full rounded-lg" />
  </div>
);

const Step2Skeleton = () => {
  return (
    <div className="mx-5 md:mx-16">
      {/* Heading */}
      <div className="mb-8 mt-6">
        <Bar className="h-8 md:h-9 w-72 md:w-96" />
        <Bar className="mt-3 h-4 w-full max-w-lg" />
      </div>

      <div>
        {/* Job Title */}
        <FieldSkeleton labelWidth="w-20" />

        {/* Job Category */}
        <FieldSkeleton labelWidth="w-28" />

        {/* Minimum Salary/Day */}
        <FieldSkeleton labelWidth="w-40" />

        {/* Maximum Salary/Day */}
        <FieldSkeleton labelWidth="w-40" />

        {/* Location Range in Meters */}
        <FieldSkeleton labelWidth="w-48" />

        {/* Shift Type */}
        <FieldSkeleton labelWidth="w-24" />

        {/* Salary Credit Type */}
        <FieldSkeleton labelWidth="w-36" />

        {/* Joining Period */}
        <FieldSkeleton labelWidth="w-28" />

        {/* Submit */}
        <div className="flex justify-center w-full pt-2 pb-6">
          <Bar className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default Step2Skeleton;
