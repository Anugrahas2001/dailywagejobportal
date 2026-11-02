// ./skeltons/JobDetailsPageSkeleton.jsx
const Bar = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

export default function JobDetailsPageSkeleton() {
  return (
    <div
      className="max-w-5xl mx-auto px-6 py-8 space-y-8"
      role="status"
      aria-busy="true"
      aria-label="Loading job details"
    >
      {/* Header */}
      <div className="space-y-3">
        <Bar className="h-9 w-2/3" />
        <Bar className="h-4 w-1/4" />
      </div>

      {/* Basic details (6 cells) */}
      <div className="grid md:grid-cols-2 gap-4 rounded-lg border p-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Bar className="h-4 w-24" />
            <Bar className="h-4 w-40" />
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="space-y-3">
        <Bar className="h-6 w-56" />
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-5/6" />
        <Bar className="h-4 w-2/3" />
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <Bar className="h-6 w-44" />
        <div className="flex flex-wrap gap-3">
          {[80, 104, 72, 96, 88].map((w, i) => (
            <Bar key={i} className="h-9 rounded-full" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* Responsibilities */}
      <div className="space-y-3">
        <Bar className="h-6 w-48" />
        <div className="space-y-2">
          {["w-11/12", "w-4/5", "w-10/12", "w-3/4"].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <Bar className="h-2 w-2 rounded-full" />
              <Bar className={`h-4 ${w}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Action area */}
      <div className="flex justify-center">
        <Bar className="h-12 w-36 rounded-lg" />
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}