import React from "react";

const SelectField = ({
  label,
  options = [],
  placeholder,
  error,
  id,
  className = "",
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  console.log(error, "INSIDE OF THE SELECT FIELD");

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium mb-1.5">
          {label}
        </label>
      )}

      {/* appearance-none */}
      {/* // bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22/%3E%3C/svg%3E')]
          // bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.1em] */}

      <select
        id={selectId}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={`
          w-full px-3 py-2 rounded-lg border text-sm bg-white
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${
            error
              ? "border-red-400 focus:ring-red-200 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
          }
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <span
          id={`${selectId}-error`}
          className="block text-red-500 text-xs mt-1"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default SelectField;
