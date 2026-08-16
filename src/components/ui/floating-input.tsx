"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const FloatingInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string }
>(({ label, className, ...props }, ref) => (
  <div className="group relative rounded-xl border-x border-b border-slate-300 transition-colors focus-within:border-emerald-500">
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center">
      <span className="h-px w-3.5 rounded-tl-xl bg-slate-300 transition-colors group-focus-within:bg-emerald-500" />
      <span className="px-1.5 text-sm leading-none text-slate-400 transition-colors group-focus-within:text-emerald-600">
        {label}
      </span>
      <span className="h-px flex-1 rounded-tr-xl bg-slate-300 transition-colors group-focus-within:bg-emerald-500" />
    </div>
    <input
      ref={ref}
      placeholder=" "
      className={cn(
        "w-full h-12 border-0 bg-transparent px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
));
FloatingInput.displayName = "FloatingInput";

export const FloatingSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }
>(({ label, className, value, children, ...props }, ref) => (
  <div className="group relative rounded-xl border-x border-b border-slate-300 transition-colors focus-within:border-emerald-500">
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center">
      <span className="h-px w-3.5 rounded-tl-xl bg-slate-300 transition-colors group-focus-within:bg-emerald-500" />
      <span className="px-1.5 text-sm leading-none text-slate-400 transition-colors group-focus-within:text-emerald-600">
        {label}
      </span>
      <span className="h-px flex-1 rounded-tr-xl bg-slate-300 transition-colors group-focus-within:bg-emerald-500" />
    </div>
    <select
      ref={ref}
      value={value}
      className={cn(
        "w-full h-12 appearance-none border-0 bg-transparent pl-3.5 pr-10 text-sm text-slate-800 focus:outline-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <option value="" disabled hidden />
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600" />
  </div>
));
FloatingSelect.displayName = "FloatingSelect";
