// components/Button.jsx
// import { Loader2 } from "lucide-react";
import Loading from "./Loading";

export default function Button({
  loading = false,
  disabled = false,
  loadingText,
  children,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm text-white
        disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {/* {loading && <Loader2 className="h-4 w-4 animate-spin" />} */}
      {loading && <Loading />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}



{/* <Button
  loading={isPending(`apply-${job._id}`)}
  loadingText="Applying..."
  onClick={() => handleAppliedJob(job._id)}
>
  Apply Now
</Button> */}