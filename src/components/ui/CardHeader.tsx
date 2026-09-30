import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/libs/utils/cn";
import { Icon, type IconName } from "./Icon";

/** Faded brand-green grid in the header corners (decorative). */
const gridPattern =
  "pointer-events-none absolute top-0 bottom-0 w-[28rem] opacity-[0.12] bg-[linear-gradient(to_right,var(--color-brand-dark)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-brand-dark)_1px,transparent_1px)] bg-[size:12px_12px]";

type CardHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Optional Solar icon badge before the title. */
  icon?: IconName;
  /** Show a back button (goes to `backTo`, or browser history when omitted). */
  showBack?: boolean;
  backTo?: string;
  onBack?: () => void;
  /** Let the actions wrap under the title on narrow screens. */
  wrap?: boolean;
  /** Action buttons on the right. */
  children?: ReactNode;
  /** Alias of `children`. */
  actions?: ReactNode;
  className?: string;
};

/** Top bar of a `PageCard`: title + description on the left, actions on the right. */
export function CardHeader({
  title,
  description,
  icon,
  showBack = false,
  backTo,
  onBack,
  wrap = true,
  children,
  actions,
  className,
}: CardHeaderProps) {
  const navigate = useNavigate();
  const content = children ?? actions;

  function handleBack() {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  }

  return (
    <div className={cn("relative overflow-hidden border-b border-line px-4 py-3", className)}>
      <span
        aria-hidden="true"
        className={cn(gridPattern, "left-0 [mask-image:radial-gradient(ellipse_90%_100%_at_0%_0%,black_60%,transparent_100%)]")}
      />
      <span
        aria-hidden="true"
        className={cn(gridPattern, "right-0 [mask-image:radial-gradient(ellipse_90%_100%_at_100%_0%,black_60%,transparent_100%)]")}
      />

      <div className={cn("relative z-10 flex items-center justify-between gap-3", wrap && "flex-wrap")}>
        <div className="flex min-w-0 items-center gap-3">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              title="Go back"
              className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-white text-muted transition-colors hover:border-brand-dark/40 hover:bg-mint hover:text-brand-dark"
            >
              <Icon icon="solar:arrow-left-linear" className="size-4" />
            </button>
          ) : null}
          {icon ? (
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mint text-brand-dark">
              <Icon icon={icon} className="size-5" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-ink">{title}</h2>
            {description ? <p className="truncate text-xs text-muted">{description}</p> : null}
          </div>
        </div>

        {content ? <div className="flex flex-none flex-wrap items-center gap-2">{content}</div> : null}
      </div>
    </div>
  );
}
