import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold text-slate-700 tracking-wide"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full text-sm bg-white border rounded-xl transition-all duration-200 outline-none placeholder:text-slate-400 text-slate-900 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed p-3 min-h-[90px] resize-y ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          } ${className}`}
          {...props}
        />

        {error && <span className="text-[11px] text-rose-500 font-medium">{error}</span>}
        {!error && helperText && (
          <span className="text-[11px] text-slate-400 font-normal">{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
