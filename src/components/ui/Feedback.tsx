import type { ReactNode } from "react";
import { cn } from "@/libs/utils/cn";
import { AppShellSkeleton, SkeletonText } from "./Skeleton";

/** Full-screen loader while the session is restored (app boot) — a skeleton of the portal shell. */
export function LoadingScreen({ message = "Opening CRM portal..." }: { message?: string }) {
  return <AppShellSkeleton label={message} />;
}

/**
 * Generic skeleton block for a small section. Prefer the shaped skeletons
 * (`TableRowsSkeleton`, `DetailSkeleton`, `FormSkeleton`, ...) for whole pages.
 */
export function LoadingState({ message = "Loading...", className }: { message?: string; className?: string }) {
  return (
    <div role="status" className={cn("animate-delayed-fade-in py-6", className)}>
      <span className="sr-only">{message}</span>
      <SkeletonText lines={3} />
    </div>
  );
}

type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("grid justify-items-center gap-2 rounded-xl border border-dashed border-line bg-field px-6 py-12 text-center", className)}>
      <p className="font-extrabold text-ink">{title}</p>
      {description ? <p className="max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
