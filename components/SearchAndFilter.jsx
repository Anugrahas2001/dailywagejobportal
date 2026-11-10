"use client";

import { filterOptions } from "@/constants/constant";
import { fetchSearchAndFilterResults } from "@/lib/features/searchFilter/searchJobsThunk";
import { SlidersHorizontal } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

const SearchAndFilter = ({ page, onClick, onClear }) => {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(search ?? "");

  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedFilterValue, setSelectedFilterValue] = useState({
    Nearby: null,
    Availability: null,
    Shift: null,
    Salary: null,
    Date: null,
  });
  const dispatch = useDispatch();

  // Tracks whether a search has been explicitly triggered at least once
  // (via the search button or a filter selection). Until then, the
  // page-change effect below stays silent.
  // Becomes true after the first explicit search/filter, so the
  // page-change effect doesn't fire on mount.
  const hasSearchedRef = useRef(false);

  useEffect(() => {
    // Skip firing on mount / before the user has actually searched.
    // This effect should only react to page changes (e.g. pagination
    // clicks) that happen AFTER an initial search has been made.
    if (!hasSearchedRef.current) return;
    doSearchAndFilter(selectedFilterValue, page);
  }, [page]);

  const buildParams = (filters, searchText) => {
    const params = new URLSearchParams();
    if (searchText?.trim()) params.set("search", searchText.trim());
    if (filters.Nearby) params.set("nearby", filters.Nearby);
    if (filters.Shift) params.set("shift", filters.Shift);
    if (filters.Salary) params.set("salary", filters.Salary);
    if (filters.Availability) params.set("availability", filters.Availability);
    if (filters.Date) params.set("sortType", filters.Date);
    return params;
  };

  // Always pass the values explicitly so we never read stale state.
  const doSearchAndFilter = (filters, currentPage = 1, searchText = search) => {
    hasSearchedRef.current = true;

    dispatch(
      fetchSearchAndFilterResults({
        page: currentPage,
        limit: 12,
        params: buildParams(filters, searchText),
      }),
    );
  };

  const getLabel = (option, value) =>
    filterOptions[option]?.find((o) => String(o.value) === String(value))
      ?.label ?? value;

  // const hasActiveFilters = Object.values(selectedFilterValue).some(Boolean);
  const hasActiveFilters = Object.values(selectedFilterValue).some(
    (v) => v !== null && v !== undefined && v !== "",
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    // Input was cleared
    if (value.trim() === "" && search !== "") {
      setSearch("");

      if (hasActiveFilters) {
        // Filters still applied -> keep searching, just without text
        doSearchAndFilter(selectedFilterValue, 1, "");
        onClick?.();
      } else {
        // Nothing left to search/filter -> go back to the normal list
        hasSearchedRef.current = false; // stop the [page] effect from searching
        onClear?.();
      }
    }
  };

  const handleSelectFilter = (option, value) => {
    const updatedFilters = { ...selectedFilterValue, [option]: value };

    setSelectedFilterValue(updatedFilters);
    setActiveFilter(null);

    doSearchAndFilter(updatedFilters, 1);
  };

  const handleClearFilter = (option) => {
    const updatedFilters = { ...selectedFilterValue, [option]: null };
    setSelectedFilterValue(updatedFilters);

    const stillHasFilters = Object.values(updatedFilters).some(
      (v) => v !== null && v !== undefined && v !== "",
    );

    if (!stillHasFilters && !search) {
      hasSearchedRef.current = false;
      onClear?.();
      return;
    }
    doSearchAndFilter(updatedFilters, 1);
  };

  const handleSearch = () => {
    const text = searchInput.trim();
    setSearch(text);
    doSearchAndFilter(selectedFilterValue, 1, text);
    onClick?.();
  };

  return (
    <div className="w-full bg-gray-100">
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
            value={searchInput}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter here..."
            className="w-full rounded-lg py-2 outline-none md:px-3"
          />
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className={` mr-1 flex items-center gap-2 rounded-lg
            border border-gray-300
            px-2 py-2
            hover:bg-gray-100
            md:mr-2 md:px-4 ${showFilter && "bg-blue-500"}`}
        >
          <span className="hidden sm:inline">Search</span>
        </button>
        <SlidersHorizontal
          className="h-6 w-6 mx-3"
          onClick={() => setShowFilter(!showFilter)}
          // onClick={() => setShowFilter(true)}
        />
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
                <button
                  type="button"
                  className={`
    flex items-center gap-1
    whitespace-nowrap
    rounded-md
    px-2 py-1.5
    text-sm
    text-white
    transition
    md:px-3
    ${selectedValue ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"}
  `}
                >
                  <span>
                    {selectedValue != null && selectedValue !== ""
                      ? getLabel(option, selectedValue)
                      : option}
                  </span>

                  {/* Clear selected value */}
                  {selectedValue != null && selectedValue !== "" && (
                    <span
                      role="button"
                      aria-label={`Clear ${option} filter`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearFilter(option);
                        onClick?.();
                      }}
                      className="
        ml-1 flex h-4 w-4 cursor-pointer
        items-center justify-center
        rounded-full text-xs
        text-white/80
        hover:bg-white/20 hover:text-white
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
                        onClick={() => {
                          (handleSelectFilter(option, val.value), onClick());
                        }}
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
    </div>
  );
};

export default SearchAndFilter;
