// skeletons/CandidateCardSkeleton.jsx
// (move Bar to a shared file, e.g. skeletons/Bar.jsx, and import it in both skeletons)
const Bar = ({ className = "", rounded = "rounded" }) => (
  <div className={`bg-gray-200 ${rounded} ${className}`} />
);

// One 20px text row with a shorter bar inside (matches text-sm line height)
const Line = ({ width }) => (
  <div className="flex h-5 items-center">
    <Bar className={`h-3 ${width}`} />
  </div>
);

const SKILL_WIDTHS = ["w-16", "w-20", "w-14"];

const CandidateCardItem = () => (
  <article className="rounded-xl bg-white p-5 shadow-sm">
    {/* Top: avatar + name/contact */}
    <div className="flex gap-4">
      <Bar className="h-16 w-16 shrink-0" rounded="rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Bar className="h-5 w-40" />
        <Line width="w-52 max-w-full" />
        <Line width="w-36" />
        <Line width="w-32" />
      </div>
    </div>

    {/* Job title + category */}
    <div className="mt-4 flex flex-col gap-2">
      <Bar className="h-4 w-44" />
      <Bar className="h-6 w-24" rounded="rounded-full" />
    </div>

    {/* Salary / joining / shift */}
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
      <Bar className="h-4 w-full" />
      <Bar className="h-4 w-full" />
      <Bar className="h-4 w-3/4 sm:col-span-2" />
    </div>

    {/* Skills */}
    <div className="mt-5">
      <Bar className="mb-2 h-3 w-12" />
      <div className="flex flex-wrap gap-2">
        {SKILL_WIDTHS.map((w, i) => (
          <Bar key={i} className={`h-7 ${w}`} rounded="rounded-full" />
        ))}
      </div>
    </div>

    {/* Match */}
    <div className="mt-4 flex items-center justify-between">
      <Bar className="h-4 w-24" />
      <Bar className="h-7 w-28" rounded="rounded-full" />
    </div>

    {/* Footer actions */}
    <div className="mt-5 flex items-center justify-between border-t pt-4">
      <Bar className="h-9 w-28" rounded="rounded-md" />
      <Bar className="h-7 w-20" rounded="rounded-md" />
    </div>
  </article>
);

export const CandidateGridSkeleton = ({ cards = 6 }) => (
  <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
    {Array.from({ length: cards }, (_, i) => (
      <CandidateCardItem key={i} />
    ))}
  </section>
);

const CandidateCardSkeleton = ({ cards = 6 }) => (
  <div
    role="status"
    aria-busy="true"
    className="bg-gray-100 p-4 md:px-16 md:py-6"
  >
    <span className="sr-only">Loading candidates…</span>

    <div className="motion-safe:animate-pulse" aria-hidden="true">
      <CandidateGridSkeleton cards={cards} />
    </div>
  </div>
);

export default CandidateCardSkeleton;