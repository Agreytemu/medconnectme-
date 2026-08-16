import * as React from "react";
import { cn } from "@/lib/utils";

const inputBase =
  "block h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600/30";

function borderClass(error?: string | boolean) {
  return error
    ? "border-red-500 focus:border-red-500"
    : "border-[#d0d7de] hover:border-slate-400 focus:border-emerald-600";
}

export type GitHubInputProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
  id?: string;
  placeholder?: string;
};

export const GitHubInput = React.forwardRef<HTMLInputElement, GitHubInputProps>(
  (
    { label, value, onChange, type = "text", required, autoComplete, error, id, placeholder },
    ref
  ) => {
  const reactId = React.useId();
  const inputId = id ?? reactId;
  return (
    <div>
      <label
        htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        <input
          id={inputId}
          ref={ref}
          type={type}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(inputBase, borderClass(error))}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
GitHubInput.displayName = "GitHubInput";

export type GitHubSelectProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  error?: string;
  id?: string;
  children: React.ReactNode;
};

export const GitHubSelect = React.forwardRef<
  HTMLSelectElement,
  GitHubSelectProps
>(({ label, value, onChange, required, error, id, children }, ref) => {
  const reactId = React.useId();
  const selectId = id ?? reactId;
  return (
    <div>
      <label
        htmlFor={selectId}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <select
        id={selectId}
        ref={ref}
        required={required}
        value={value}
        onChange={onChange}
        className={cn(
          inputBase,
          "appearance-none bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat pr-9",
          "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')]",
          borderClass(error)
        )}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});
GitHubSelect.displayName = "GitHubSelect";
