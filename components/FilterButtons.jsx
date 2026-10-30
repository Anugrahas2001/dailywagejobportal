import { ChevronDown } from "lucide-react";
import React from "react";

const FilterButtons = ({
  title,
  dropDown,
  setDropdownStatus,
  value,
  setValue,
  options,
  onClick,
  defaultLabel,
}) => {
  console.log(options, "OPTIONS DATA");
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || defaultLabel;
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
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setValue(opt.value);
                setDropdownStatus(false);
                onClick?.();
              }}
              className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-blue-50 ${
                value === opt.value
                  ? "bg-blue-50 font-medium text-blue-600"
                  : ""
              }`}
            >
              {opt.label}
              {value === opt.value && <span className="text-blue-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterButtons;
