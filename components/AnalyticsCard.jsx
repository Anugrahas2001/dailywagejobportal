import React from "react";

const AnalyticsCard = ({ dot, text, title, count, onClick }) => {
  return (
    <div className="rounded-md bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg p-2 md:p-4">
      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${text}`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`}></span>
        {title}
      </div>
      <div className="flex justify-between items-center px-2 mt-3">
        <div className="flex items-center">
          <h2 className="text-sm md:text-xl font-bold">{count}</h2>
          <p className="text-sm ml-1 text-gray-500">Total Jobs</p>
        </div>
        <button
          className="bg-blue-600 cursor-pointer text-white text-sm px-1 md:px-2 py-1 rounded-sm"
          onClick={onClick}
        >
          View
        </button>
      </div>
    </div>
  );
};

export default AnalyticsCard;
