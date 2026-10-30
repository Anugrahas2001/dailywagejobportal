// skeletons/MyJobsSkeleton.jsx
const Bar = ({ className = "", rounded = "rounded" }) => (
  <div className={`bg-gray-200 ${rounded} ${className}`} />
);

// One line of the details block (text-sm + leading-5 = 20px)
const DetailLine = ({ width }) => (
  <div className="flex h-5 items-center">
    <Bar className={`h-3 ${width}`} />
  </div>
);

const JobCardSkeleton = ({ jobType }) => {
  const isInvitation = jobType === "jobInvitation" || jobType === "accepted";

  return (
    <article className="mt-7 rounded-lg bg-white p-4 shadow">
      <div className="flex flex-col gap-4">
        {/* Title + category (+ bookmark on the Saved tab) */}
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-1 flex-col gap-2">
            <Bar className="h-5 w-3/4" />
            <Bar className="h-4 w-1/2" />
          </div>
          {jobType === "saved" && (
            <Bar className="h-10 w-10 shrink-0" rounded="rounded-full" />
          )}
        </div>

        {/* Details: location, shift, availability, salary, openings */}
        <div className="grid gap-1 border-t pt-4">
          <DetailLine width="w-2/3" />
          <DetailLine width="w-1/2" />
          <DetailLine width="w-3/5" />
          <DetailLine width="w-1/2" />
          <DetailLine width="w-2/5" />
        </div>

        {/* Status dot + label */}
        {!isInvitation && (
          <div className="mt-4 flex items-center gap-2">
            <Bar className="h-3 w-3" rounded="rounded-full" />
            <Bar className="h-4 w-20" />
          </div>
        )}
      </div>

      {/* Footer */}
      {!isInvitation ? (
        <div className="mt-4 flex flex-row items-center justify-between border-t pt-4">
          <Bar className="h-4 w-28" />
          <Bar className="h-9 w-24" />
        </div>
      ) : (
        <div className="mt-3 flex justify-between">
          <Bar className="h-10 w-20" />
          <Bar className="h-10 w-20" />
        </div>
      )}
    </article>
  );
};

export default function MyJobsSkeleton({ jobType, count = 6 }) {
  return (
    <div
      role="status"
      className="grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-3"
    >
      <span className="sr-only">Loading jobs…</span>
      <div
        aria-hidden="true"
        className="contents"
      >
        {Array.from({ length: count }, (_, i) => (
          <JobCardSkeleton key={i} jobType={jobType} />
        ))}
      </div>
    </div>
  );
}