import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId =
      id ||
      (typeof label === "string"
        ? label
            .replace(/\*/g, "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
        : undefined);

    const renderLabelContent = () => {
      if (typeof label === "string") {
        if (label.endsWith(" *")) {
          return (
            <>
              {label.slice(0, -2)} <span className="text-rose-500">*</span>
            </>
          );
        }
        if (label.endsWith("*")) {
          return (
            <>
              {label.slice(0, -1)} <span className="text-rose-500">*</span>
            </>
          );
        }
      }
      return label;
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[#0A2558] tracking-wide"
          >
            {renderLabelContent()}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full text-sm bg-white border rounded-xl transition-all duration-200 outline-none placeholder:text-slate-400 text-[#0A2558] disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
              leftIcon ? "pl-10" : "pl-4"
            } ${rightIcon ? "pr-10" : "pr-4"} py-2.5 ${
              error
                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-[#E2E8F0] focus:border-[#1765F5] focus:ring-2 focus:ring-[#1765F5]/15"
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-600">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
