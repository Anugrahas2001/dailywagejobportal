// skeletons/NotificationsSkeleton.jsx
const Bar = ({ className = "", rounded = "rounded" }) => (
  <div className={`bg-gray-200 ${rounded} ${className}`} />
);

const NotificationItem = () => (
  <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    {/* Icon circle */}
    <Bar className="h-10 w-10 shrink-0" rounded="rounded-full" />

    {/* Content */}
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {/* Title + time */}
      <div className="flex h-5 items-center justify-between gap-3">
        <Bar className="h-4 w-40 max-w-[60%]" />
        <Bar className="h-3 w-14 shrink-0" />
      </div>

      {/* Message: 2 lines (text-sm + leading-relaxed) */}
      <div className="flex flex-col text-sm">
        <div className="flex h-[1.625em] items-center">
          <Bar className="h-3 w-full" />
        </div>
        <div className="flex h-[1.625em] items-center">
          <Bar className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  </div>
);

export const NotificationsListSkeleton = ({ count = 12 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }, (_, i) => (
      <NotificationItem key={i} />
    ))}
  </div>
);

const PaginationSkeleton = () => (
  <div className="mt-8 flex justify-center gap-2">
    {Array.from({ length: 5 }, (_, i) => (
      <Bar key={i} className="h-9 w-9" />
    ))}
  </div>
);

export default function NotificationsSkeleton({ count = 12 }) {
  return (
    <div role="status" className="mx-auto mt-4 w-full max-w-2xl">
      <span className="sr-only">Loading notifications…</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <NotificationsListSkeleton count={count} />
        <PaginationSkeleton />
      </div>
    </div>
  );
}