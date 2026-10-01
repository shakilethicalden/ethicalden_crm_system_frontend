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
  primary: "bg-gradient-to-r from-brand-dark to-brand text-portal shadow-sm shadow-brand/20 hover:brightness-105",
  /** Secondary / cancel. */
  ghost: "border border-white/12 bg-white/8 text-white hover:border-brand/35 hover:bg-white/12",
  /** Destructive confirm. */
  danger: "bg-danger text-white shadow-sm hover:bg-[#bf3a3a]",
  /** Low-emphasis tinted button. */
  soft: "border border-brand/20 bg-brand/12 text-brand hover:bg-brand/18",
  /** Export / download (warm gradient like the design reference). */
  export:
    "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-white shadow-sm hover:from-amber-500 hover:via-yellow-600 hover:to-amber-600",
};

export function buttonClass(variant: ButtonVariant = "primary", className?: string, size: ButtonSize = "md") {
  return cn(buttonBase, buttonSizes[size], buttonVariants[variant], className);
}

const iconButtonBase =
  "inline-grid size-8 shrink-0 place-items-center rounded-md border bg-white/8 transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40";

const iconButtonVariants: Record<IconButtonVariant, string> = {
  default: "border-white/12 text-white/58 hover:border-brand/35 hover:bg-white/12 hover:text-brand",
  danger: "border-white/12 text-danger hover:border-danger/40 hover:bg-danger/12",
  complete: "border-white/12 text-success hover:border-success/40 hover:bg-success/12",
};

export function iconButtonClass(variant: IconButtonVariant = "default", className?: string) {
  return cn(iconButtonBase, iconButtonVariants[variant], className);
}

/** Shared look for input / select / textarea. */
export const fieldControlClass =
  "w-full rounded-md border border-white/12 bg-white/8 px-3 text-sm text-white outline-none transition duration-150 placeholder:text-white/35 focus:border-brand/45 focus:bg-white/12 focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-white/5 disabled:opacity-70";

/** Outer page card (header + body + footer live inside). */
export const cardClass =
  "rounded-xl border border-white/10 bg-white/7 text-white shadow-2xl shadow-black/15 backdrop-blur [&_.text-ink]:!text-white [&_.text-muted]:!text-white/55 [&_.border-line]:!border-white/10 [&_.bg-soft]:!bg-white/6 [&_.bg-field]:!bg-white/6";
