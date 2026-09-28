"use client";

import React, { useState } from "react";

const Slider = ({ value, onChange }) => {
  const [internalValue, setInternalValue] = useState(50);
  const current = value !== undefined ? value : internalValue;

  const handleChange = (e) => {
    const newVal = Number(e.target.value);
    if (value === undefined) setInternalValue(newVal);
    onChange?.(newVal);
  };

  return (
    <div className="w-full">
      <input
        type="range"
        min={0}
        max={100}
        value={current}
        onChange={handleChange}
        className="w-full h-2 rounded-full bg-gray-200 accent-blue-600 cursor-pointer"
      />
      <p className="mt-2 text-sm text-gray-700">Value: {current}</p>
    </div>
  );
};

export default Slider;
