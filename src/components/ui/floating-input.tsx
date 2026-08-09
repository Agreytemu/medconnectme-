"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const FloatingInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string }
>(({ label, className, ...props }, ref) => (
  <div className="relative">
    <input
      ref={ref}
      placeholder=" "
      className={cn(
        "peer w-full h-12 px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50",
        className
      )}
      {...props}
    />
    <label
      className={cn(
        "pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-slate-400 transition-all duration-150 ease-out",
        "peer-focus:top-0 peer-focus:text-xs peer-focus:text-emerald-600",
        "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-500"
      )}
    >
      {label}
    </label>
  </div>
));
FloatingInput.displayName = "FloatingInput";

export const FloatingSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }
>(({ label, className, value, onFocus, onBlur, children, ...props }, ref) => {
  const [focused, setFocused] = React.useState(false);
  const floated = focused || (value !== undefined && value !== "" && value !== null);
  return (
    <div className="relative">
      <select
        ref={ref}
        value={value}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          "w-full h-12 appearance-none rounded-xl border border-slate-300 bg-white pl-3.5 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50",
          className
        )}
        {...props}
      >
        <option value="" disabled hidden />
        {children}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
          focused ? "text-emerald-600" : "text-slate-400"
        )}
      />
      <label
        className={cn(
          "pointer-events-none absolute left-3 z-10 -translate-y-1/2 bg-transparent transition-all duration-150 ease-out",
          floated
            ? "top-0 text-xs text-emerald-600"
            : "top-1/2 text-sm text-slate-400"
        )}
      >
        {label}
      </label>
    </div>
  );
});
FloatingSelect.displayName = "FloatingSelect";
