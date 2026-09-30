import type { ReactNode } from "react";
import { cn } from "@/libs/utils/cn";
import { cardClass } from "./styles";

/*
 * Skeleton loaders. Every wrapper uses `animate-delayed-fade-in`, so a skeleton only becomes
 * visible when loading takes longer than ~200ms — cached responses render without a flash.
 */

/** Base shimmer block; size it with Tailwind classes (`h-4 w-32`, `size-10 rounded-full`, ...). */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block animate-pulse rounded-md bg-line/70", className)} />;
}

/** Screen-reader text + delayed fade-in wrapper shared by the composite skeletons. */
function SkeletonRegion({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" className={cn("animate-delayed-fade-in", className)}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** A few lines of text. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("grid gap-2", className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn("h-3.5", index === lines - 1 && lines > 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

const CELL_WIDTHS = ["w-24", "w-32", "w-20", "w-28", "w-16"];

/**
 * Placeholder rows to render inside an existing `<tbody>` while a table loads.
 * The first column mimics an avatar + two text lines; the last one mimics action buttons.
 */
export function TableRowsSkeleton({ rows = 5, columns }: { rows?: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr key={rowIndex} aria-hidden="true" className="animate-delayed-fade-in">
          {Array.from({ length: columns }, (_, columnIndex) => (
            <td key={columnIndex} className="border-r border-b border-line/70 px-3 py-3 last:border-r-0">
              {columnIndex === 0 && columns > 2 ? (
                <Skeleton className="mx-auto h-3.5 w-5" />
              ) : columnIndex === 1 ? (
                <span className="flex items-center gap-2.5">
                  <Skeleton className="size-8 shrink-0 rounded-lg" />
                  <span className="grid flex-1 gap-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </span>
                </span>
              ) : columnIndex === columns - 1 && columns > 2 ? (
                <span className="flex gap-1.5">
                  <Skeleton className="size-7 rounded-md" />
                  <Skeleton className="size-7 rounded-md" />
                  <Skeleton className="size-7 rounded-md" />
                </span>
              ) : (
                <Skeleton className={cn("h-3.5", CELL_WIDTHS[(rowIndex + columnIndex) % CELL_WIDTHS.length])} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Stand-alone table skeleton (header + rows) for places that don't render the table while loading. */
export function TableSkeleton({ rows = 5, columns = 5, label = "Loading..." }: { rows?: number; columns?: number; label?: string }) {
  return (
    <SkeletonRegion label={label} className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[640px] border-collapse">
        <thead className="bg-soft">
          <tr>
            {Array.from({ length: columns }, (_, index) => (
              <th key={index} className="border-r border-b border-line px-3 py-2.5 text-left last:border-r-0">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <TableRowsSkeleton rows={rows} columns={columns} />
        </tbody>
      </table>
    </SkeletonRegion>
  );
}

/** Detail page: header with avatar/title/actions, optional media banner, then info tiles. */
export function DetailSkeleton({
  items = 6,
  sections = 1,
  media = false,
  label = "Loading details...",
}: {
  items?: number;
  sections?: number;
  /** Show a media placeholder. */
  media?: boolean;
  label?: string;
}) {
  return (
    <SkeletonRegion label={label} className="grid gap-5">
      <div className={cn(cardClass, "flex flex-wrap items-center justify-between gap-4 p-5 md:p-6")}>
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-2xl" />
          <div className="grid gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-3.5 w-40" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-24 rounded-xl" />
          <Skeleton className="h-11 w-24 rounded-xl" />
        </div>
      </div>

      {media ? (
        <div className={cn(cardClass, "grid gap-4 p-5 md:grid-cols-2 md:p-6")}>
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="aspect-video w-full rounded-xl" />
        </div>
      ) : null}

      {Array.from({ length: sections }, (_, sectionIndex) => (
        <div key={sectionIndex} className={cn(cardClass, "p-5 md:p-6")}>
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: items }, (_, index) => (
              <div key={index} className="grid gap-2 rounded-xl border border-line bg-field px-4 py-3">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** Form page: header, a two-column grid of label + input placeholders, and the action bar. */
export function FormSkeleton({
  fields = 8,
  textareas = 1,
  label = "Loading form...",
}: {
  fields?: number;
  /** Full-width tall fields at the end (descriptions, summaries). */
  textareas?: number;
  label?: string;
}) {
  return (
    <SkeletonRegion label={label} className={cn(cardClass, "grid gap-6 p-5 md:p-6")}>
      <div className="flex items-center justify-between gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: fields }, (_, index) => (
          <div key={index} className="grid gap-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
        {Array.from({ length: textareas }, (_, index) => (
          <div key={`textarea-${index}`} className="grid gap-2 md:col-span-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 border-t border-line pt-4">
        <Skeleton className="h-11 w-24 rounded-xl" />
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>
    </SkeletonRegion>
  );
}

/** Grid of media cards (thumbnail, title, meta lines, footer buttons). */
export function CardGridSkeleton({ cards = 6, label = "Loading..." }: { cards?: number; label?: string }) {
  return (
    <SkeletonRegion label={label} className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: cards }, (_, index) => (
        <div key={index} className={cn(cardClass, "overflow-hidden")}>
          <div className="grid gap-3 p-5">
            <div className="flex items-center gap-2">
              <Skeleton className="size-9 rounded-xl" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[0, 1, 2, 3].map((tile) => (
                <Skeleton key={tile} className="h-14 rounded-xl" />
              ))}
            </div>
            <div className="flex justify-end border-t border-line pt-3">
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** Dashboard: hero band, KPI cards and two panels. */
export function DashboardSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <SkeletonRegion label="Loading dashboard..." className="grid gap-5">
      <div className={cn(cardClass, "flex flex-wrap items-center justify-between gap-4 p-5 md:p-6")}>
        <div className="grid gap-2.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-7 w-72 max-w-full" />
          <Skeleton className="h-3.5 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-28 rounded-xl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className={cn(cardClass, "grid gap-3 p-5")}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="size-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {[0, 1].map((panel) => (
          <div key={panel} className={cn(cardClass, "grid gap-4 p-5 md:p-6")}>
            <Skeleton className="h-5 w-40" />
            {Array.from({ length: 4 }, (_, row) => (
              <div key={row} className="flex items-center justify-between gap-4">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}

/** Whole portal shell (sidebar + header + content) — shown while the session is being restored. */
export function AppShellSkeleton({ label = "Opening CRM portal..." }: { label?: string }) {
  return (
    <SkeletonRegion label={label} className="min-h-screen bg-soft">
      <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col gap-6 border-r border-line bg-white p-4 lg:flex">
        <div className="flex items-center gap-2.5 border-b border-line pb-4">
          <Skeleton className="size-9 rounded-lg" />
          <div className="grid gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
        {[3, 3, 2].map((count, section) => (
          <div key={section} className="grid gap-2.5">
            <Skeleton className="h-2.5 w-16" />
            {Array.from({ length: count }, (_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            ))}
          </div>
        ))}
      </aside>

      <div className="lg:pl-[260px]">
        <div className="flex h-16 items-center gap-4 border-b border-line bg-white px-4 sm:px-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="hidden h-9 w-full max-w-md rounded-md md:block" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="size-9 rounded-lg" />
          </div>
        </div>
        <div className="grid gap-5 p-4 md:p-6">
          <Skeleton className="h-28 w-full rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-32 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </SkeletonRegion>
  );
}
