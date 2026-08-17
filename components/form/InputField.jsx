// import React from "react";

// const InputField = ({ label, type = "text",placeholder, error, ...props }) => {
//   console.log(props, "FROM INPUT FIELD");
//   return (
//     <div className="flex justify-around items-center mb-3">
//       <label className="font-medium">{label}</label>

//       <input type={type} placeholder={placeholder} {...props} className="border rounded-lg p-2 w-72" />
//       {error && <span className="text-red-500 text-sm">{error}</span>}
//     </div>
//   );
// };

// export default InputField;


import React from "react";

const InputField = ({ 
  label, 
  type = "text", 
  placeholder, 
  error, 
  id, 
  className = "", 
  ...props 
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium mb-1.5"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full px-3 py-2 rounded-lg border text-sm
          placeholder:text-gray-400
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${error 
            ? "border-red-400 focus:ring-red-200 focus:border-red-500" 
            : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400
          ${className}
        `}
        {...props}
      />

      {error && (
        <span 
          id={`${inputId}-error`} 
          className="block text-red-500 text-xs mt-1"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default InputField;