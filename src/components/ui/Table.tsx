import type { ComponentProps } from "react";
import { cn } from "@/libs/utils/cn";

export function Table({ className, minWidth = 640, ...props }: ComponentProps<"table"> & { minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-portal shadow-sm shadow-black/20 [scrollbar-width:thin] [&_.text-ink]:!text-white [&_.text-muted]:!text-white/50 [&_button:hover]:!text-white">
      <table style={{ minWidth }} className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("bg-white/8 text-xs font-semibold text-white/60", className)} {...props} />;
}

export function TH({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn("border-r border-b border-white/10 px-3 py-2.5 font-semibold whitespace-nowrap last:border-r-0", className)}
      {...props}
    />
  );
}

export function TR({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("group transition-colors hover:bg-white/6", className)} {...props} />;
}

export function TD({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn("border-r border-b border-white/10 px-3 py-2.5 align-middle text-white/78 last:border-r-0 group-last:border-b-0", className)}
      {...props}
    />
  );
}
