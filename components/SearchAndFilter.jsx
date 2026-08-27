"use client";

import { filterOptions } from "@/constants/constant";
import { fetchSearchAndFilterResults } from "@/lib/features/jobs/jobThunk";
import { Filter, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const SearchAndFilter = ({ page }) => {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedFilterValue, setSelectedFilterValue] = useState({
    Nearby: null,
    Availability: null,
    Shift: null,
    Salary: null,
    Date: null,
  });
  // const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  // const pageSize = 12; // define this
  console.log(page, "FROM DASHBOARD");
  // const totalCount = useSelector((state) => state.jobs.totalCount);

  // const totalPages = Math.ceil(totalCount / pageSize) || 0;

  console.log(activeFilter, selectedFilterValue, "SELECTED FILETR VALUES");

  useEffect(() => {
  doSearchAndFilter(selectedFilterValue, page);
}, [page]);

  const buildParams = (filters) => {
    // build fresh each time
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (filters.Nearby) params.set("nearby", filters.Nearby);
    if (filters.Shift) params.set("shift", filters.Shift);
    if (filters.Salary) params.set("salary", filters.Salary);
    if (filters.Availability) params.set("availability", filters.Availability);
    if (filters.Date) params.set("date", filters.Date);

    return params;
  };

  // const goToPage = (p) => {
  //   if (p >= 1 && p <= totalPages) setPage(p);
  // };

  const doSearchAndFilter = (filters, currentPage = 1) => {
    const params = buildParams(filters);
    console.log(params, "NEWLY BUILD PARAMS");
    // setPage(currentPage);

    dispatch(
      fetchSearchAndFilterResults({
        page: currentPage,
        limit: 12,
        params,
      }),
    );
  };

  const handleSelectFilter = (option, value) => {
    const updatedFilters = {
      ...selectedFilterValue,
      [option]: value,
    };

    setSelectedFilterValue(updatedFilters);
    setActiveFilter(null);

    doSearchAndFilter(updatedFilters, page);
  };

  const handleClearFilter = (option) => {
    const updatedFilters = {
      ...selectedFilterValue,
      [option]: null,
    };

    setSelectedFilterValue(updatedFilters);

    doSearchAndFilter(updatedFilters, page);
  };

  return (
    <div className="w-full">
      {/* Search bar */}
      <div className="flex w-full items-center gap-2 bg-white">
        <div
          className="
            m-1 flex flex-1 items-center rounded-lg border border-gray-300
            px-2
            focus-within:border-blue-500
            focus-within:ring-2
            focus-within:ring-blue-200
            md:m-2
          "
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter here..."
            className="w-full rounded-lg py-2 outline-none md:px-3"
          />

          <Search
            className="h-5 w-5 shrink-0 text-gray-500 md:h-6 md:w-6"
            onClick={() => doSearchAndFilter(selectedFilterValue, page)}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setShowFilter((prev) => !prev);
            setActiveFilter(null);
          }}
          className={` mr-1 flex items-center gap-2 rounded-lg
            border border-gray-300
            px-2 py-2
            hover:bg-gray-100
            md:mr-2 md:px-4 ${showFilter && "bg-blue-500"}`}
        >
          <Filter className="h-5 w-5" />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* Filters */}
      {showFilter && (
        <div
          className="
            mt-2 flex w-full
            items-center justify-center
            gap-2 rounded-lg
            border border-gray-200
            bg-white p-3
            shadow-sm
            md:gap-4
          "
          onMouseLeave={() => setActiveFilter(null)}
        >
          {Object.keys(filterOptions).map((option) => {
            const selectedValue = selectedFilterValue[option];

            return (
              <div
                key={option}
                className="relative"
                onMouseEnter={() => setActiveFilter(option)}
              >
                {/* Filter button */}
                <button
                  // onClick={() => setShowFilteredValue((prev) => !prev)}
                  type="button"
                  className={`
                    flex items-center gap-1
                    whitespace-nowrap
                    rounded-md
                    px-2 py-1.5
                    text-sm
                    transition
                    md:px-3
                    ${
                      selectedValue
                        ? "bg-blue-700 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }
                  `}
                >
                  <span>
                    {selectedFilterValue[option]
                      ? filterOptions[option].find(
                          (opt) => opt.value === selectedFilterValue[option],
                        )?.label
                      : option}
                  </span>

                  {/* Clear selected value */}
                  {selectedFilterValue[option] && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        // clearFilter(option);
                        handleClearFilter(option);
                      }}
                      className="
        ml-1
        flex h-4 w-4
        items-center justify-center
        rounded-full
        text-xs
        text-white/80
        hover:bg-white/20
        hover:text-white
        cursor-pointer
      "
                    >
                      ×
                    </span>
                  )}

                  {/* Dropdown arrow */}
                  <span className="ml-0.5 mb-2.5 font-bold text-white/80">
                    ⌄
                  </span>
                </button>

                {/* Dropdown */}
                {activeFilter === option && (
                  <div
                    onMouseEnter={() => setActiveFilter(option)}
                    onMouseLeave={() => setActiveFilter(null)}
                    className="
                      absolute left-0 top-full z-50
                      mt-1 min-w-full
                      overflow-hidden
                      rounded-md
                      border border-gray-200
                      bg-white
                      shadow-lg
                    "
                  >
                    {filterOptions[option].map((val) => (
                      <button
                        key={val?.value}
                        type="button"
                        onClick={() => handleSelectFilter(option, val.value)}
                        className={`
                          block w-full
                          whitespace-nowrap
                          px-3 py-2
                          text-left
                          text-sm
                          transition
                          ${
                            selectedValue === val.value
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }
                        `}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* <Pagination
        onClick={goToPage}
        totalPages={totalPages}
        page={page}
        totalCount={totalCount}
      /> */}
    </div>
  );
};

export default SearchAndFilter;
