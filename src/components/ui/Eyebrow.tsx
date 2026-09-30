import type { ReactNode } from "react";
import { cn } from "@/libs/utils/cn";

/** Small uppercase green label above a heading. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mb-2 text-xs font-extrabold tracking-wide text-brand-dark uppercase", className)}>
      {children}
    </p>
  );
}
