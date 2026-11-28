import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const textareaId =
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
            htmlFor={textareaId}
            className="text-xs font-semibold text-[#0A2558] tracking-wide"
          >
            {renderLabelContent()}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full text-sm bg-white border rounded-xl transition-all duration-200 outline-none placeholder:text-slate-400 text-[#0A2558] disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed p-3 min-h-[90px] resize-y ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              : "border-[#E2E8F0] focus:border-[#1765F5] focus:ring-2 focus:ring-[#1765F5]/15"
          } ${className}`}
          {...props}
        />

        {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-slate-600 font-normal">{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
