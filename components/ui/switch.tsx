"use client";

import * as React from "react";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: "sm" | "md";
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = "", checked = false, onCheckedChange, disabled = false, size = "md", onChange, ...props }, ref) => {
    const isSm = size === "sm";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label
        className={`relative inline-flex items-center cursor-pointer select-none ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      >
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div
          className={`relative rounded-full transition-colors duration-200 ease-in-out ${
            isSm ? "w-8 h-4.5" : "w-10 h-5"
          } ${
            checked ? "bg-emerald-500 dark:bg-emerald-600" : "bg-neutral-300 dark:bg-neutral-700"
          } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-400/30`}
        >
          <div
            className={`absolute top-0.5 left-0.5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
              isSm ? "w-3.5 h-3.5" : "w-4 h-4"
            } ${
              checked ? (isSm ? "translate-x-3.5" : "translate-x-5") : "translate-x-0"
            }`}
          />
        </div>
      </label>
    );
  }
);

Switch.displayName = "Switch";
