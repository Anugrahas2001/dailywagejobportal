// const Bar = ({ className = "" }) => {
//   const hasRadius = /(^|\s)rounded/.test(className);
//   return (
//     <div
//       className={`bg-gray-200 ${hasRadius ? "" : "rounded"} ${className}`}
//     />
//   );
// };

// const SKILL_WIDTHS = ["w-20", "w-28", "w-24", "w-32", "w-16"];

// export default function JobDetailsSkeleton({ showActions = false }) {
//   return (
//     <div
//       role="status"
//       aria-busy="true"
//       className="mx-auto max-w-5xl px-6 py-8"
//     >
//       <span className="sr-only">Loading job details…</span>

//       <div aria-hidden="true" className="space-y-8 motion-safe:animate-pulse">
//         {/* Header */}
//         <div className="space-y-3">
//           <Bar className="h-8 w-2/3" />
//           <Bar className="h-4 w-1/4" />
//         </div>

//         {/* Basic details grid */}
//         <div className="grid gap-4 rounded-lg border p-5 md:grid-cols-2">
//           {Array.from({ length: 6 }, (_, i) => (
//             <div key={i} className="space-y-2">
//               <Bar className="h-4 w-24" />
//               <Bar className="h-4 w-40" />
//             </div>
//           ))}
//         </div>

//         {/* Description */}
//         <div className="space-y-3">
//           <Bar className="h-6 w-56" />
//           <Bar className="h-4 w-full" />
//           <Bar className="h-4 w-full" />
//           <Bar className="h-4 w-5/6" />
//           <Bar className="h-4 w-2/3" />
//         </div>

//         {/* Skills */}
//         <div className="space-y-3">
//           <Bar className="h-6 w-48" />
//           <div className="flex flex-wrap gap-3">
//             {SKILL_WIDTHS.map((w, i) => (
//               <Bar key={i} className={`h-9 rounded-full ${w}`} />
//             ))}
//           </div>
//         </div>

//         {/* Responsibilities */}
//         <div className="space-y-3">
//           <Bar className="h-6 w-44" />
//           <Bar className="h-4 w-11/12" />
//           <Bar className="h-4 w-10/12" />
//           <Bar className="h-4 w-9/12" />
//         </div>

//         {/* Action buttons */}
//         {showActions && (
//           <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-7">
//             <Bar className="h-12 w-40 rounded-lg" />
//             <Bar className="h-12 w-40 rounded-lg" />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// skeletons/JobDetailsSkeleton.jsx
const Bar = ({ className = "", tone = "bg-gray-200" }) => {
  const hasRadius = /(^|\s)rounded/.test(className);
  return <div className={`${tone} ${hasRadius ? "" : "rounded"} ${className}`} />;
};

// A text row with the same height as the real line, with a shorter bar inside
const Line = ({ height = "h-6", width = "w-full", tone }) => (
  <div className={`flex items-center ${height}`}>
    <Bar className={`h-3.5 ${width}`} tone={tone} />
  </div>
);

// Section heading: text-xl (28px line) + mb-3
const SectionTitle = ({ width }) => (
  <div className="mb-3 flex h-7 items-center">
    <Bar className={`h-5 ${width}`} />
  </div>
);

const DETAIL_WIDTHS = ["w-48", "w-24", "w-40", "w-12", "w-28", "w-20"];
const SKILL_WIDTHS = ["w-24", "w-32", "w-20", "w-28", "w-36", "w-24"];
const DESCRIPTION_WIDTHS = ["w-full", "w-full", "w-full", "w-11/12", "w-full", "w-4/5", "w-2/3"];
const RESPONSIBILITY_WIDTHS = ["w-11/12", "w-10/12", "w-9/12", "w-10/12", "w-8/12"];

const Button = ({ className = "w-32" }) => (
  <Bar className={`h-12 rounded-lg ${className}`} />
);

// Mirrors the "accepted" panel: status select + photo upload
const AcceptedPanel = () => (
  <div className="w-full bg-gray-300">
    <div className="m-2 flex items-center justify-between">
      <Bar className="h-5 w-36" tone="bg-gray-100" />
      <Bar className="h-[42px] w-36 rounded-lg" tone="bg-gray-100" />
    </div>
    <div className="m-2 space-y-3">
      <Bar className="h-5 w-64" tone="bg-gray-100" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {Array.from({ length: 3 }, (_, i) => (
          <Bar key={i} className="h-24 w-full rounded-lg" tone="bg-gray-100" />
        ))}
      </div>
      <Bar className="h-8 w-full" tone="bg-gray-100" />
      <Bar className="h-10 w-36 rounded-lg" tone="bg-gray-100" />
    </div>
  </div>
);

const Actions = ({ type }) => {
  if (type === "applied" || type === "jobInvitation") return null;

  if (type === "accepted") return <AcceptedPanel />;

  // "saved": only the Apply button
  if (type === "saved") {
    return (
      <div className="flex w-full justify-center">
        <Button className="w-36" />
      </div>
    );
  }

  // default: Save for Later + Apply Now
  return (
    <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-7">
      <Button className="w-40" />
      <Button className="w-36" />
    </div>
  );
};

export default function JobDetailsSkeleton({ role, isModal, type }) {
  const showActions = role === "worker" && isModal;

  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-5xl px-6 py-8">
      <span className="sr-only">Loading job details…</span>

      <div aria-hidden="true" className="space-y-8 motion-safe:animate-pulse">
        {/* Header: h1 text-3xl (36px) + category (24px, mt-1) */}
        <div>
          <div className="flex h-9 items-center">
            <Bar className="h-7 w-2/3 max-w-md" />
          </div>
          <div className="mt-1">
            <Line height="h-6" width="w-32" />
          </div>
        </div>

        {/* Basic details: 6 cells (label + value) */}
        <div className="grid gap-4 rounded-lg border p-5 md:grid-cols-2">
          {DETAIL_WIDTHS.map((w, i) => (
            <div key={i}>
              <Line height="h-6" width="w-24" />
              <Line height="h-6" width={w} />
            </div>
          ))}
        </div>

        {/* Description: leading-7 lines */}
        <div>
          <SectionTitle width="w-56" />
          {DESCRIPTION_WIDTHS.map((w, i) => (
            <Line key={i} height="h-7" width={w} />
          ))}
        </div>

        {/* Skills: px-4 py-2 text-sm chips = h-9 */}
        <div>
          <SectionTitle width="w-48" />
          <div className="flex flex-wrap gap-3">
            {SKILL_WIDTHS.map((w, i) => (
              <Bar key={i} className={`h-9 rounded-full ${w}`} />
            ))}
          </div>
        </div>

        {/* Responsibilities: list rows with space-y-2 */}
        <div>
          <SectionTitle width="w-44" />
          <div className="space-y-2">
            {RESPONSIBILITY_WIDTHS.map((w, i) => (
              <div key={i} className="flex h-6 items-center gap-3">
                <Bar className="h-2 w-2 shrink-0 rounded-full" />
                <Bar className={`h-3.5 ${w}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Actions (only when the real page renders them) */}
        {showActions && <Actions type={type} />}
      </div>
    </div>
  );
}