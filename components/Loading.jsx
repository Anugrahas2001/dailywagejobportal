// components/Loading.jsx

"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

        <h2 className="text-lg font-semibold text-gray-800">Loading...</h2>

        <p className="text-sm text-gray-500">Please wait a moment</p>
      </div>
    </div>
  );
}
