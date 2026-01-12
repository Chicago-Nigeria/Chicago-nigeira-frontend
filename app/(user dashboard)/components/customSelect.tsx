"use client";

import { useState, type ComponentPropsWithoutRef } from "react";

type SelectButtonProps = {
  name: string;
  label?: string;
  options: string[];
  className?: string;
} & ComponentPropsWithoutRef<"button">;

export default function CustomSelectButton({
  name,
  label,
  options,
  className,
  ...props
}: SelectButtonProps) {
  const [selected, setSelected] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {/* Hidden input so it registers with forms */}
      <input type="hidden" name={name} value={selected || options[0]} />

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={` ${className ?? ""}`}
        {...props}
      >
        {selected || label || "Select..."}
      </button>

      {isOpen && (
        <ul className="absolute left-0 z-50 mt-2 w-full rounded-lg overflow-clip bg-white shadow-md">
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleSelect(option)}
              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                option === selected ? "bg-gray-200" : ""
              }`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
