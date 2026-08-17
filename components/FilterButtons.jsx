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

//    <div className="relative inline-block">
//             <div className="flex items-center gap-2 border mt-4">
//               {jobType === "saved" && (
//                 <div
//                   className="flex mt-8 gap-2 relative"
//                   onMouseEnter={() => setShowStatusDropdown(true)}
//                   onMouseLeave={() => setShowStatusDropdown(false)}
//                 >
//                   <div className="flex gap-2 px-3 py-2 rounded-lg">
//                     <button
//                       className="rounded-lg border bg-gray-100 px-4 py-2 font-medium text-gray-700 cursor-default"
//                       disabled
//                     >
//                       Status
//                     </button>

//                     {/* Dropdown Button */}
//                     <button
//                       onClick={() => setShowStatusDropdown((prev) => !prev)}
//                       className="flex min-w-40 items-center justify-between rounded-lg border px-4 py-2 hover:bg-gray-100"
//                     >
//                       <span>{status}</span>
//                       <ChevronDown
//                         className={`h-4 w-4 transition-transform ${
//                           showStatusDropdown ? "rotate-180" : ""
//                         }`}
//                       />
//                     </button>
//                   </div>

//                   {showStatusDropdown && (
//                     <div className="absolute left-0 top-full w-44 rounded-lg border bg-white shadow-lg z-10">
//                       {statuses.map((item) => (
//                         <button
//                           key={item}
//                           onClick={() => {
//                             setStatus(item);
//                             setShowStatusDropdown(false);
//                           }}
//                           className="block w-full px-4 py-2 text-left hover:bg-gray-100"
//                         >
//                           {item}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}

//               <div
//                 className="flex mt-8 gap-2 relative"
//                 onMouseEnter={() => setShowSortDropdown(true)}
//                 onMouseLeave={() => setShowSortDropdown(false)}
//               >
//                 <button className="bg-gray-200 border px-3 py-2 rounded-lg">
//                   Sort
//                 </button>
//                 <button className="flex gap-2 min-w-40 border rounded-lg px-3 py-2 items-center justify-between">
//                   <span>{sort}</span>
//                   <ChevronDown className="w-4 h-4" />
//                 </button>

//                 {showSortDropdown && (
//                   <div className="absolute left-0 top-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg z-50">
//                     {(jobType === "saved"
//                       ? savedSortingOptions
//                       : appliedSortingOptions
//                     ).map((opt) => (
//                       <button
//                         key={opt.value}
//                         onClick={() => {
//                           setSort(opt);
//                           setShowSortDropdown(false);
//                         }}
//                         className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-blue-50 ${
//                           sort === opt.value
//                             ? "bg-blue-50 font-medium text-blue-600"
//                             : ""
//                         }`}
//                       >
//                         {opt.label}
//                         {sort === opt.value && (
//                           <span className="text-blue-600">✓</span>
//                         )}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
