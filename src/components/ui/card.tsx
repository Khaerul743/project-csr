import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
}

export function Card({
  children,
  className = "",
  hoverLift = true,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white border border-[#DBEAFE] rounded-3xl shadow-xs transition-all duration-200 ease-out ${
        hoverLift
          ? "hover:-translate-y-1 hover:shadow-md hover:border-[#93C5FD] cursor-default"
          : "hover:shadow-sm"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pb-4 flex flex-col gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-bold text-[#0A2558] tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-slate-600 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-6 pt-0 flex items-center justify-between border-t border-[#EDF6FF] mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
