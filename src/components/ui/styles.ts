import { cn } from "@/libs/utils/cn";

export type ButtonVariant = "primary" | "ghost" | "danger" | "soft" | "export";
export type ButtonSize = "sm" | "md";
export type IconButtonVariant = "default" | "danger" | "complete";

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 rounded-md font-semibold whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55";

const buttonSizes: Record<ButtonSize, string> = {
  sm: "min-h-8 px-2.5 text-xs",
  md: "min-h-9 px-3.5 text-sm",
};

const buttonVariants: Record<ButtonVariant, string> = {
  /** Main call to action (New, Save). */
  primary: "bg-brand text-ink shadow-sm hover:bg-[#78bf3b]",
  /** Secondary / cancel. */
  ghost: "border border-line bg-white text-ink hover:border-brand-dark/40 hover:bg-mint",
  /** Destructive confirm. */
  danger: "bg-danger text-white shadow-sm hover:bg-[#bf3a3a]",
  /** Low-emphasis tinted button. */
  soft: "bg-mint text-brand-dark hover:bg-brand/25",
  /** Export / download (warm gradient like the design reference). */
  export:
    "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-white shadow-sm hover:from-amber-500 hover:via-yellow-600 hover:to-amber-600",
};

export function buttonClass(variant: ButtonVariant = "primary", className?: string, size: ButtonSize = "md") {
  return cn(buttonBase, buttonSizes[size], buttonVariants[variant], className);
}

const iconButtonBase =
  "inline-grid size-8 shrink-0 place-items-center rounded-md border bg-white transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40";

const iconButtonVariants: Record<IconButtonVariant, string> = {
  default: "border-line text-muted hover:border-brand-dark/40 hover:bg-mint hover:text-brand-dark",
  danger: "border-line text-danger hover:border-danger/30 hover:bg-danger-soft",
  complete: "border-line text-success hover:border-success/30 hover:bg-success-soft",
};

export function iconButtonClass(variant: IconButtonVariant = "default", className?: string) {
  return cn(iconButtonBase, iconButtonVariants[variant], className);
}

/** Shared look for input / select / textarea. */
export const fieldControlClass =
  "w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition duration-150 placeholder:text-muted/60 focus:border-brand-dark focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:bg-soft disabled:opacity-70";

/** Outer page card (header + body + footer live inside). */
export const cardClass = "rounded-xl border border-line bg-white";
