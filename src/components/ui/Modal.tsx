import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/libs/utils/cn";
import { Icon, type IconName } from "./Icon";

type ModalProps = {
  isOpen: boolean;
  title: ReactNode;
  description?: ReactNode;
  /** Optional Solar icon shown in the header badge. */
  icon?: IconName;
  /** Colour of the header icon badge. */
  iconTone?: "brand" | "danger";
  onClose: () => void;
  /** Block closing (Escape / backdrop / X) while an action is running. */
  isBusy?: boolean;
  size?: "sm" | "md" | "lg";
  /** Buttons row at the bottom. */
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

/**
 * Accessible dialog: closes on Escape and backdrop click, focuses the first field,
 * restores focus afterwards and locks page scroll while open.
 */
export function Modal({
  isOpen,
  title,
  description,
  icon,
  iconTone = "brand",
  onClose,
  isBusy = false,
  size = "md",
  footer,
  children,
  className,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const isBusyRef = useRef(isBusy);

  useEffect(() => {
    onCloseRef.current = onClose;
    isBusyRef.current = isBusy;
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const firstField = panelRef.current?.querySelector<HTMLElement>(
      "input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled])",
    );
    (firstField ?? panelRef.current)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isBusyRef.current) {
        onCloseRef.current();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid animate-fade-in place-items-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "w-full overflow-hidden rounded-xl border border-line bg-white shadow-card outline-none",
          sizes[size],
          className,
        )}
      >
        <div className="flex items-start gap-3 border-b border-line px-4 py-3">
          {icon ? (
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-lg",
                iconTone === "danger" ? "bg-danger-soft text-danger" : "bg-mint text-brand-dark",
              )}
            >
              <Icon icon={icon} className="size-5" />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <h3 id={titleId} className="text-base font-bold text-ink">
              {title}
            </h3>
            {description ? (
              <p id={descriptionId} className="mt-0.5 text-sm text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-soft hover:text-ink disabled:opacity-50"
          >
            <Icon icon="solar:close-circle-linear" className="size-5" />
          </button>
        </div>

        <div className="px-4 py-4">{children}</div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-soft px-4 py-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
