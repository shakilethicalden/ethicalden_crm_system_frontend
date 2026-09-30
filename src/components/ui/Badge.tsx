import type { ReactNode } from "react";
import { cn } from "@/libs/utils/cn";

export type BadgeTone = "brand" | "muted" | "danger" | "success" | "strong";

const tones: Record<BadgeTone, string> = {
  brand: "bg-mint text-ink",
  muted: "bg-[#f2f4f0] text-muted",
  danger: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
  strong: "bg-brand text-ink",
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
