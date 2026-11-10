import { ChevronDown } from "lucide-react";
import React from "react";

const FilterButtons = ({
  title,
  dropDown,
  setDropdownStatus,
  value,
  // statusVal,
  setValue,
  options = {},
  onClick,
  defaultLabel,
}) => {

  const entries = Object.entries(options); // [[label, value], ...]
  const applicableStatusValues = ["Applied", "Shortlisted", "Viewed"];
  const selectedLabel =
    entries.find(([, optValue]) => optValue === value)?.[0] ?? defaultLabel;

  // When "Applied" is selected, only show the first 3 options
  // const visibleEntries = applicableStatusValues.includes(value)
  //   ? entries.slice(0, 3)
  //   : entries;
  const visibleEntries = applicableStatusValues.includes(value)
    ? entries.filter(([, optValue]) =>
        applicableStatusValues.includes(optValue),
      )
    : entries;

  return (
    <div
      className="flex mt-8 gap-2 relative"
      onMouseEnter={() => setDropdownStatus(true)}
      onMouseLeave={() => setDropdownStatus(false)}
    >
      <button className="bg-gray-200 border px-3 py-2 rounded-lg">
        {title}
      </button>

      <button className="flex gap-2 min-w-40 border rounded-lg px-3 py-2 items-center justify-between">
        <span>{selectedLabel}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {dropDown && (
        <div className="absolute left-0 top-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg z-50">
          {visibleEntries.map(([label, optValue]) => (
            <button
              key={optValue}
              onClick={() => {
                setValue(optValue);
                setDropdownStatus(false);
                onClick?.();
              }}
              className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-blue-50 ${
                value === optValue ? "bg-blue-50 font-medium text-blue-600" : ""
              }`}
            >
              {label}
              {value === optValue && <span className="text-blue-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterButtons;
