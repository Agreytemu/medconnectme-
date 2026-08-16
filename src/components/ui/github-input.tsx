import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
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
  name?: string;
  placeholder?: string;
  trailing?: React.ReactNode;
};

export const GitHubInput = React.forwardRef<HTMLInputElement, GitHubInputProps>(
  (
    { label, value, onChange, type = "text", required, autoComplete, error, id, name, placeholder, trailing },
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
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            name={name}
            data-field={name}
            type={type}
            required={required}
            autoComplete={autoComplete}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={cn(
              inputBase,
              borderClass(error),
              trailing && "pr-10"
            )}
          />
          {trailing && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
              {trailing}
            </div>
          )}
        </div>
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
  name?: string;
  children: React.ReactNode;
};

export const GitHubSelect = React.forwardRef<
  HTMLSelectElement,
  GitHubSelectProps
>(({ label, value, onChange, required, error, id, name, children }, ref) => {
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
        name={name}
        data-field={name}
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

export type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  name?: string;
  autoComplete?: string;
  error?: string;
  id?: string;
  showLabel?: string;
  hideLabel?: string;
  onVisibilityChange?: (visible: boolean) => void;
};

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      label,
      value,
      onChange,
      required,
      name,
      autoComplete,
      error,
      id,
      showLabel = "Show password",
      hideLabel = "Hide password",
      onVisibilityChange,
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(false);
    const toggle = () => {
      const next = !visible;
      setVisible(next);
      onVisibilityChange?.(next);
    };
    return (
      <GitHubInput
        ref={ref}
        id={id}
        name={name}
        label={label}
        type={visible ? "text" : "password"}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        error={error}
        trailing={
          <button
            type="button"
            onClick={toggle}
            aria-label={visible ? hideLabel : showLabel}
            className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
      />
    );
  }
);
PasswordField.displayName = "PasswordField";
