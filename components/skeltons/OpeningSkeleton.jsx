// skeletons/OpeningSkeleton.jsx
//
// Exact skeleton for OpeningPage (signed-out view).
//   <OpeningSkeleton />                              -> role picker (default; use while authChecked is false)
//   <OpeningSkeleton variant="selected" role="worker" /> -> after a role is chosen
//
// Every box below reserves the real element's height; bars sit inside line-height boxes.

const Bar = ({ className = "", radius = "rounded", tone = "bg-gray-200" }) => (
  <div className={`${tone} ${radius} ${className}`} />
);

// Reserves a real line-height; the bar is the visible glyph area.
const TextLine = ({ box, bar, justify = "justify-center" }) => (
  <div className={`flex items-center ${justify} ${box}`}>
    <Bar className={`max-w-full ${bar}`} />
  </div>
);

// Widths approximate the real strings ("Employer", "Post jobs and hire workers", ...)
const ROLE_SKELETONS = {
  employer: { title: "w-20", desc: "w-44 md:w-48" },
  worker: { title: "w-16", desc: "w-44 md:w-52" },
};

// Real card: border-2 (4) + p-6 (48) + icon (40 | 56) + mt-3 (12) + h2 text-lg (28) + p (20 | 24)
//   -> 152px mobile, 172px md
// Card chrome is static; only the contents pulse.
const RoleCardSkeleton = ({ role, selected = false }) => {
  const w = ROLE_SKELETONS[role];
  const chrome = selected
    ? "border-blue-600 bg-blue-50 ring-4 ring-blue-300 shadow-2xl"
    : "border-gray-200 bg-white";

  return (
    <div className={`w-full rounded-2xl border-2 md:w-72 ${chrome}`}>
      <div
        aria-hidden="true"
        className="flex flex-col items-center p-6 motion-safe:animate-pulse"
      >
        {/* Icon: w-10 h-10 md:w-14 md:h-14 */}
        <Bar className="h-10 w-10 md:h-14 md:w-14" radius="rounded-xl" />

        {/* h2: mt-3, text-lg (28px line-height) */}
        <div className="mt-3 flex h-7 items-center">
          <Bar className={`h-4 ${w.title}`} />
        </div>

        {/* p: text-sm (20px) / md:text-base (24px) */}
        <div className="flex h-5 items-center md:h-6">
          <Bar className={`h-3 md:h-3.5 ${w.desc}`} />
        </div>
      </div>
    </div>
  );
};

// Real box: border (2) + p-4 (32) + two lines (20 | 24 each) + space-y-2 (8)
//   -> 82px mobile, 90px md
const CredentialsSkeleton = () => (
  <div className="mx-auto mt-6 w-full max-w-sm">
    <div aria-hidden="true" className="motion-safe:animate-pulse">
      {/* "Try the app with these demo credentials" */}
      <TextLine box="h-5 md:h-6" bar="h-3.5 w-64 md:h-4 md:w-72" />
    </div>

    <div className="mt-3 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div aria-hidden="true" className="space-y-2 p-4 motion-safe:animate-pulse">
        {/* Email: demoemployer@gmail.com */}
        <TextLine box="h-5 md:h-6" bar="h-3.5 w-48 md:h-4 md:w-56" justify="justify-start" />
        {/* Password: Demoemployer@01 */}
        <TextLine box="h-5 md:h-6" bar="h-3.5 w-40 md:h-4 md:w-48" justify="justify-start" />
      </div>
    </div>

    {/* Login button: mt-4 flex justify-center. Height/width assumed (h-12 w-36); match your <Button /> */}
    <div className="mt-4 flex justify-center">
      <Bar
        className="h-12 w-36 motion-safe:animate-pulse"
        radius="rounded-sm"
      />
    </div>
  </div>
);

export default function OpeningSkeleton({ variant = "roles", role = "employer" }) {
  const isSelected = variant === "selected";

  return (
    // Same outer wrapper as the real page
    <div role="status" className="min-h-screen w-screen bg-gray-100 px-4 py-8">
      <span className="sr-only">Loading…</span>

      <div className="mx-auto max-w-3xl">
        {/* "Change role" row: text-sm (20px) / md:text-base (24px), right-aligned */}
        {isSelected && (
          <div aria-hidden="true" className="motion-safe:animate-pulse">
            <TextLine
              box="h-5 md:h-6"
              bar="h-3.5 w-[72px] md:h-4 md:w-20"
              justify="justify-end"
            />
          </div>
        )}

        <div aria-hidden="true" className="motion-safe:animate-pulse">
          {/* h1 "Welcome to Work Now": text-2xl (32px) / md:text-4xl (40px) */}
          <TextLine box="h-8 md:h-10" bar="h-6 w-64 md:h-7 md:w-96" />

          {/* h3: mt-2, text-sm (20px) / md:text-base (24px) */}
          <div className="mt-2">
            <TextLine
              box="h-5 md:h-6"
              bar={
                isSelected
                  ? "h-3.5 w-48 md:h-4 md:w-56" // "Enter your details to continue"
                  : "h-3.5 w-28 md:h-4 md:w-32" // "Select Your Role"
              }
            />
          </div>
        </div>

        {/* mt-8 flex flex-col md:flex-row justify-center items-center gap-6 */}
        <div className="mt-8 flex flex-col items-center justify-center gap-6 md:flex-row">
          {isSelected ? (
            <RoleCardSkeleton role={role} selected />
          ) : (
            <>
              <RoleCardSkeleton role="employer" />
              <RoleCardSkeleton role="worker" />
            </>
          )}
        </div>

        {isSelected && <CredentialsSkeleton />}
      </div>
    </div>
  );
}
