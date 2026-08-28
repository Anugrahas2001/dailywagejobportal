export const LoginLoading = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo / heading skeleton */}
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />

          <div className="mt-4 h-7 w-40 animate-pulse rounded-md bg-gray-200" />

          <div className="mt-2 h-4 w-56 animate-pulse rounded-md bg-gray-200" />
        </div>

        {/* Input skeletons */}
        <div className="mt-8 space-y-5">
          <div>
            <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-gray-200" />
          </div>

          <div>
            <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-gray-200" />
          </div>

          <div className="h-11 w-full animate-pulse rounded-lg bg-gray-200" />
        </div>

        {/* Spinner */}
        <div className="mt-6 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      </div>
    </div>
  );
};
