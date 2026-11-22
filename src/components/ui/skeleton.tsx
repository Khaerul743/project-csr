"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base Skeleton Shimmer Block
 */
export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Shimmer Card Skeleton (mimics opportunity, program, or proposal cards)
 */
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-2xs ${className}`}
      aria-hidden="true"
    >
      {/* Header: Icon / Avatar + Title */}
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
      </div>

      {/* Body: 2 content lines */}
      <div className="space-y-2 pt-1">
        <Skeleton className="h-3 w-full rounded-md" />
        <Skeleton className="h-3 w-4/5 rounded-md" />
      </div>

      {/* Stats/Badges */}
      <div className="pt-2 flex items-center gap-2">
        <Skeleton className="h-6 w-20 rounded-lg" />
        <Skeleton className="h-6 w-24 rounded-lg" />
      </div>

      {/* Footer: Date / Author + Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Grid of Card Skeletons
 */
export function CardGridSkeleton({
  count = 3,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      aria-busy="true"
      aria-label="Memuat konten..."
    >
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
}

/**
 * Shimmer Table Skeleton
 */
export function TableSkeleton({
  rows = 5,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs ${className}`}
      aria-busy="true"
      aria-label="Memuat tabel..."
    >
      {/* Table Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-40 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-100 p-2 sm:p-4 space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 py-3 px-3 rounded-xl"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-3.5 w-2/5 rounded-md" />
                <Skeleton className="h-2.5 w-1/4 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-5 w-20 rounded-md hidden sm:block" />
            <Skeleton className="h-5 w-24 rounded-md hidden md:block" />
            <Skeleton className="h-7 w-20 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Metric/Stat Card Skeleton
 */
export function MetricCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-2xs ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-28 rounded-md" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20 rounded-md" />
      <Skeleton className="h-3 w-32 rounded-md" />
    </div>
  );
}

/**
 * Metric Grid Skeleton
 */
export function MetricGridSkeleton({
  count = 4,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 ${className}`}
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <MetricCardSkeleton key={idx} />
      ))}
    </div>
  );
}
