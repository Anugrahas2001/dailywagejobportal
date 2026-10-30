// skeletons/LoginSkeleton.jsx
const HAS_ROUNDED = /(^|\s)rounded/;

const Bar = ({ className = "", tone = "bg-gray-200" }) => (
  <div className={`${tone} ${HAS_ROUNDED.test(className) ? "" : "rounded"} ${className}`} />
);

// Label: text-sm (20px) + mb-1.5, like the real <label className="mb-1.5 block text-sm ...">
const Label = ({ width }) => (
  <div className="mb-1.5 flex h-5 items-center">
    <Bar className={`h-3.5 ${width}`} />
  </div>
);

// Input: py-2.5 + text-sm (20px) + 1px border top/bottom = 42px
const Input = () => <Bar className="h-[42px] w-full rounded-lg" />;

export default function LoginSkeleton() {
  return (
    // Same outer wrapper as the real page (h-screen w-screen bg-slate-50)
    <div role="status" aria-busy="true" className="h-screen w-screen bg-slate-50">
      <span className="sr-only">Loading login form…</span>

      {/* Same as the real page: flex-col, centered horizontally, top-aligned */}
      <div className="flex flex-col items-center justify-center">
        {/* Card chrome is static; only the contents pulse */}
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-blue-600 bg-white p-6 shadow-md">
          {/* h-64 flex flex-col items-center justify-center p-1 */}
          <div
            aria-hidden="true"
            className="flex h-64 flex-col items-center justify-center p-1 motion-safe:animate-pulse"
          >
            {/* Fields: mx-auto w-full max-w-xl space-y-5 */}
            <div className="mx-auto w-full max-w-xl space-y-5">
              <div>
                <Label width="w-12" />
                <Input />
              </div>
              <div>
                <Label width="w-20" />
                <Input />
              </div>
            </div>

            {/* Login button: w-36 mt-4 h-12 */}
            <Bar className="mt-4 h-12 w-36 rounded-sm" />
          </div>
        </div>

        {/* Divider: mt-4 flex items-center gap-3, "Or" text-sm (20px) */}
        <div
          aria-hidden="true"
          className="mx-auto mt-4 flex w-full max-w-sm items-center gap-3 motion-safe:animate-pulse"
        >
          <div className="h-px flex-1 bg-gray-300" />
          <div className="flex h-5 items-center">
            <Bar className="h-3.5 w-5" />
          </div>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        {/* Google button: h-12 w-64 mt-4 */}
        <Bar className="mt-4 h-12 w-64 rounded-sm motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
