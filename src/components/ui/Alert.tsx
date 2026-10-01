import type { ReactNode } from "react";
import { cn } from "@/libs/utils/cn";
import { Icon } from "./Icon";

type AlertProps = {
  tone?: "error" | "success" | "info";
  children: ReactNode;
  /** Shows a close button when provided. */
  onClose?: () => void;
  className?: string;
};

const tones = {
  error: { box: "border-danger/25 bg-danger/12 text-danger", icon: "solar:danger-circle-linear" },
  success: { box: "border-success/25 bg-success/12 text-success", icon: "solar:check-circle-linear" },
  info: { box: "border-brand/25 bg-brand/12 text-brand", icon: "solar:info-circle-linear" },
} as const;

/** Inline status / error message. Renders nothing when `children` is empty. */
export function Alert({ tone = "error", children, onClose, className }: AlertProps) {
  if (!children) {
    return null;
  }

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2 rounded-md border px-3 py-2 text-sm", tones[tone].box, className)}
    >
      <Icon icon={tones[tone].icon} className="mt-0.5 size-4" />
      <p className="min-w-0 flex-1 font-medium">{children}</p>
      {onClose ? (
        <button type="button" onClick={onClose} aria-label="Dismiss" className="rounded p-0.5 opacity-70 hover:opacity-100">
          <Icon icon="solar:close-circle-linear" className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
