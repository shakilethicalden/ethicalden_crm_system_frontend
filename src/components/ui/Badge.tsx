import type { ReactNode } from "react";
import { cn } from "@/libs/utils/cn";

export type BadgeTone = "brand" | "muted" | "danger" | "success" | "strong";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand/14 text-brand ring-1 ring-brand/20",
  muted: "bg-white/10 text-white/60 ring-1 ring-white/10",
  danger: "bg-danger/14 text-danger ring-1 ring-danger/20",
  success: "bg-success/14 text-success ring-1 ring-success/20",
  strong: "bg-brand text-portal shadow-sm shadow-brand/20",
};

/** Pill-shaped status label. */
export function Badge({ tone = "brand", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-extrabold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
