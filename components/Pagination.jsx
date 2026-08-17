import React from "react";

const Pagination = ({ onClick, totalPages, page, totalCount }) => {
  
  return (
    <div className="border-t mt-4">
      <p className="text-sm mt-3">
        Page {page} of {totalPages} ({totalCount} total items)
      </p>
      <div className="flex justify-around items-center">
        <button
          className="bg-blue-500 text-white rounded-lg px-3 py-1 cursor-pointer"
          onClick={() => onClick(page - 1)}
          disabled={page === 1}
        >
          Prev
        </button>
        <div className="flex gap-2 mt-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onClick(p)}
              className={
                p === page
                  ? "px-3 py-1 rounded-md bg-blue-600 text-white font-bold cursor-pointer"
                  : "px-3 py-1 rounded-md bg-gray-500 text-gray-700 font-normal cursor-pointer hover:bg-gray-200"
              }
            >
              {p}
            </button>
          ))}
        </div>

        <button
          className="bg-blue-500 text-white rounded-lg px-3 py-1 cursor-pointer"
          onClick={() => onClick(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
