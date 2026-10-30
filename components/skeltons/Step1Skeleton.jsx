// // skeletons/Step1Skeleton.jsx
// const HAS_ROUNDED = /(^|\s)rounded/;

// const Bar = ({ className = "", tone = "bg-gray-200" }) => (
//   <div className={`${tone} ${HAS_ROUNDED.test(className) ? "" : "rounded"} ${className}`} />
// );

// // Label row: text-sm = 20px line height
// const Label = ({ width = "w-24" }) => (
//   <div className="flex h-5 items-center">
//     <Bar className={`h-3.5 ${width}`} />
//   </div>
// );

// // Input box: py-2 + text-sm (20px) + 1px border top/bottom = 38px
// const InputBox = ({ className = "w-full" }) => (
//   <Bar className={`h-[38px] rounded-lg ${className}`} />
// );

// // Wrapper: flex flex-col gap-1.5 (same as InputField / fieldWrapper)
// const Field = ({ labelWidth, children }) => (
//   <div className="flex w-full flex-col gap-1.5">
//     <Label width={labelWidth} />
//     {children ?? <InputBox />}
//   </div>
// );

// export default function Step1Skeleton() {
//   return (
//     <div role="status" aria-busy="true" className="mx-5 md:mx-16">
//       {/* <span className="sr-only">Loading your profile form…</span> */}

//       <div aria-hidden="true" className="motion-safe:animate-pulse">
//         {/* Header: mb-8 mt-6
//             h1 text-2xl (32px) / md:text-3xl (36px), p mt-2 text-sm (20px) / md:text-base (24px) */}
//         <div className="mb-8 mt-6">
//           <div className="flex h-8 items-center md:h-9">
//             <Bar className="h-6 w-3/5 max-w-xs md:h-7" />
//           </div>
//           <div className="mt-2 flex h-5 items-center md:h-6">
//             <Bar className="h-3.5 w-4/5 max-w-md" />
//           </div>
//         </div>

//         {/* Form: flex flex-col gap-5 */}
//         <div className="flex flex-col gap-5">
//           {/* Name */}
//           <Field labelWidth="w-14" />

//           {/* Gender */}
//           <Field labelWidth="w-16" />

//           {/* Date of Birth */}
//           <Field labelWidth="w-28" />

//           {/* Mobile number: label + (+91 box | input) */}
//           <Field labelWidth="w-44">
//             <div className="flex gap-2">
//               <Bar className="h-[38px] w-14 shrink-0 rounded-lg" />
//               <InputBox className="flex-1" />
//             </div>
//           </Field>

//           {/* Years of experience */}
//           <Field labelWidth="w-40" />

//           {/* Use current location: border px-3 py-2, switch h-6 w-12 => 42px */}
//           <div className="flex h-[42px] items-center justify-between rounded-lg border border-gray-200 px-3">
//             <Bar className="h-3.5 w-36" />
//             <Bar className="h-6 w-12 rounded-full" />
//           </div>

//           {/* City */}
//           <Field labelWidth="w-10" />

//           {/* State */}
//           <Field labelWidth="w-12" />

//           {/* Country */}
//           <Field labelWidth="w-16" />

//           {/* Submit: flex justify-center pt-2 pb-6 */}
//           <div className="flex w-full justify-center pb-6 pt-2">
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
  <div className="flex flex-col gap-1.5 w-full">
    <Bar className={`h-4 ${labelWidth}`} />
    <Bar className="h-10 w-full rounded-lg" />
  </div>
);

const Step1Skeleton = () => {
  return (
    <div className="mx-5 md:mx-16">
      {/* Heading */}
      <div className="mb-8 mt-6">
        <Bar className="h-8 md:h-9 w-64 md:w-80" />
        <Bar className="mt-3 h-4 w-full max-w-md" />
      </div>

      <div className="flex flex-col gap-5">
        {/* Name */}
        <FieldSkeleton labelWidth="w-14" />

        {/* Gender */}
        <FieldSkeleton labelWidth="w-16" />

        {/* Date of Birth */}
        <FieldSkeleton labelWidth="w-28" />

        {/* Mobile Number */}
        <div className="flex flex-col gap-1.5 w-full">
          <Bar className="h-4 w-44" />
          <div className="flex gap-2">
            <Bar className="h-10 w-14 rounded-lg" />
            <Bar className="h-10 flex-1 rounded-lg" />
          </div>
        </div>

        {/* Years of Experience */}
        <FieldSkeleton labelWidth="w-36" />

        {/* Use current location toggle */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
          <Bar className="h-4 w-40" />
          <Bar className="h-6 w-12 rounded-full" />
        </div>

        {/* City */}
        <FieldSkeleton labelWidth="w-10" />

        {/* State */}
        <FieldSkeleton labelWidth="w-12" />

        {/* Country */}
        <FieldSkeleton labelWidth="w-16" />

        {/* Submit */}
        <div className="flex justify-center w-full pt-2 pb-6">
          <Bar className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default Step1Skeleton;
