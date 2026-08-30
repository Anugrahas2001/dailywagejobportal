"use client";
import React from "react";

const Error = ({ error, onClick }) => {
  console.log(error, onClick, "SHAAA SHAAA SHAAA");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Error Icon / Title */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <span className="text-xl text-red-600">!</span>
          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            Something went wrong
          </h2>
        </div>

        {/* Error Message */}
        <p className="mb-6 text-sm leading-6 text-gray-600">
          {error.message || error}
        </p>

        {/* OK Button */}
        <div className="flex justify-end">
          <button
            onClick={onClick}
            className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error;
