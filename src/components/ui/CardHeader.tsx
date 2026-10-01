import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/libs/utils/cn";
import { Icon, type IconName } from "./Icon";

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
    <div className={cn("relative overflow-hidden border-b border-white/10 bg-white/5 px-4 py-3", className)}>
      <div className={cn("relative z-10 flex items-center justify-between gap-3", wrap && "flex-wrap")}>
        <div className="flex min-w-0 items-center gap-3">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              title="Go back"
              className="grid size-8 shrink-0 place-items-center rounded-md border border-white/12 bg-white/8 text-white/55 transition-colors hover:border-brand/35 hover:bg-white/12 hover:text-brand"
            >
              <Icon icon="solar:arrow-left-linear" className="size-4" />
            </button>
          ) : null}
          {icon ? (
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-dark to-brand text-portal shadow-sm shadow-brand/20">
              <Icon icon={icon} className="size-5" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-white">{title}</h2>
            {description ? <p className="truncate text-xs text-white/55">{description}</p> : null}
          </div>
        </div>

        {content ? <div className="flex flex-none flex-wrap items-center gap-2">{content}</div> : null}
      </div>
    </div>
  );
}
