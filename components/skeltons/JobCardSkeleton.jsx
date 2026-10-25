// const JobCardSkeleton = () => (
//   <article className="rounded-lg bg-white p-4 shadow mt-7 animate-pulse">
//     <div className="flex flex-col gap-4">
//       {/* Title + category + bookmark */}
//       <div className="flex w-full items-center justify-between">
//         <div className="flex flex-col gap-2">
//           <div className="h-5 w-40 rounded bg-gray-200" />
//           <div className="h-4 w-24 rounded bg-gray-200" />
//         </div>
//         <div className="h-8 w-8 rounded-full bg-gray-200" />
//       </div>

//       {/* Details */}
//       <div className="grid gap-2 border-t pt-4">
//         <div className="h-4 w-3/5 rounded bg-gray-200" />
//         <div className="h-4 w-2/5 rounded bg-gray-200" />
//         <div className="h-4 w-1/2 rounded bg-gray-200" />
//         <div className="h-4 w-3/5 rounded bg-gray-200" />
//         <div className="h-4 w-1/3 rounded bg-gray-200" />
//       </div>

//       {/* Status row */}
//       <div className="flex items-center justify-between">
//         <div className="h-4 w-20 rounded bg-gray-200" />
//         <div className="h-4 w-24 rounded bg-gray-200" />
//       </div>
//     </div>

//     {/* Footer */}
//     <div className="mt-4 flex items-center justify-between border-t pt-4">
//       <div className="h-4 w-24 rounded bg-gray-200" />
//       <div className="h-8 w-24 rounded bg-gray-200" />
//     </div>
//   </article>
// );

// export default JobCardSkeleton;


// skeltons/JobCardSkeleton.jsx
const Bar = ({ className = "" }) => (
  <div className={`rounded bg-gray-200 ${className}`} />
);

// const role=localStorage.getItem("role")

// One 20px text row (matches text-sm line height) with a shorter bar inside
const Line = ({ width }) => (
  <div className="flex h-5 items-center">
    <Bar className={`h-3 ${width}`} />
  </div>
);

const DETAIL_WIDTHS = ["w-1/2", "w-2/5", "w-1/3", "w-3/5", "w-1/3"];

const JobCardItem = ({ role }) => {
  const isEmployer = role === "employer";

  return (
    <article className="mt-7 rounded-lg bg-white p-4 shadow">
      <div className="flex flex-col gap-4">
        {/* Title + category (+ bookmark for workers) */}
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex flex-col gap-2">
            <Bar className="h-6 w-44 md:h-7" />
            <Bar className="h-5 w-28" />
          </div>
          {!isEmployer && <Bar className="h-10 w-10 rounded-full" />}
        </div>

        <div>
          {/* Details: location, shift, date, salary, openings */}
          <div className="grid gap-1 border-t pt-4">
            {DETAIL_WIDTHS.map((w, i) => (
              <Line key={i} width={w} />
            ))}
          </div>

          {/* Status row (+ views / matches / applications for employers) */}
          <div
            className={`mt-4 flex flex-row items-center justify-between ${
              isEmployer ? "h-9" : "h-5"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-200" />
              <Bar className="h-4 w-16" />
            </div>
            {isEmployer && (
              <div className="flex gap-3">
                {[0, 1, 2].map((i) => (
                  <Bar key={i} className="h-5 w-9" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      {isEmployer ? (
        <div className="flex flex-col justify-between border-t pt-4">
          <Bar className="h-4 w-24" />
          <div className="m-1 flex w-full items-center justify-between">
            <Bar className="h-8 w-32 md:h-9" />
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex h-9 items-center">
                  <Bar className="h-5 w-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-row items-center justify-between border-t pt-4">
          <Bar className="h-4 w-24" />
          <Bar className="h-8 w-20 md:h-9 md:w-24" />
        </div>
      )}
    </article>
  );
};

export const JobGridSkeleton = ({ role = "worker", cards = 6 }) => (
  <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
    {Array.from({ length: cards }, (_, i) => (
      <JobCardItem key={i} role={role} />
    ))}
  </section>
);

const PaginationSkeleton = () => (
  <div className="mt-8 flex justify-center gap-2">
    {Array.from({ length: 5 }, (_, i) => (
      <Bar key={i} className="h-9 w-9" />
    ))}
  </div>
);

const JobCardSkeleton = ({role="worker", cards = 6 }) => (
  <main
    role="status"
    aria-busy="true"
    className="bg-gray-100 p-4 md:px-16 md:py-6"
  >
    <span className="sr-only">Loading jobs…</span>

    <div className="motion-safe:animate-pulse">
      {role === "worker" ? (
        <>
          {/* SearchAndFilter */}
          <section className="m-3 w-full">
            <Bar className="h-12 w-full rounded-lg" />
          </section>
          {/* "Available Jobs" title + slider */}
          <Bar className="mt-8 h-8 w-48" />
          <div className="mt-4 space-y-2">
            <Bar className="h-4 w-32" />
            <Bar className="h-2 w-full max-w-md rounded-full" />
          </div>
        </>
      ) : (
        /* Analytics panel */
        <section className="rounded-lg bg-white p-3 shadow md:p-6">
          <div className="flex items-center justify-between">
            <Bar className="mb-4 h-8 w-32" />
            <Bar className="h-10 w-32 rounded-md md:h-12 md:w-40" />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Bar key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </section>
      )}

      <JobGridSkeleton role={role} cards={cards} />
      <PaginationSkeleton />
    </div>
  </main>
);

export default JobCardSkeleton;