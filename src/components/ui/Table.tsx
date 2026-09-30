import type { ComponentProps } from "react";
import { cn } from "@/libs/utils/cn";

export function Table({ className, minWidth = 640, ...props }: ComponentProps<"table"> & { minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line [scrollbar-width:thin]">
      <table style={{ minWidth }} className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("bg-soft text-xs font-semibold text-muted", className)} {...props} />;
}

export function TH({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn("border-r border-b border-line px-3 py-2.5 font-semibold whitespace-nowrap last:border-r-0", className)}
      {...props}
    />
  );
}

export function TR({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("group transition-colors hover:bg-soft/70", className)} {...props} />;
}

export function TD({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn("border-r border-b border-line/70 px-3 py-2.5 align-middle text-ink last:border-r-0 group-last:border-b-0", className)}
      {...props}
    />
  );
}
