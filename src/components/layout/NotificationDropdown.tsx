import { useCallback, useRef, useState } from "react";
import { cn } from "@/libs/utils/cn";
import { useDismiss } from "./useDismiss";
import { Icon } from "@/components/ui";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  unread?: boolean;
};

type NotificationDropdownProps = {
  /** No notifications API exists yet; pass items here once one does. */
  notifications?: AppNotification[];
  onMarkAllRead?: () => void;
};

export function NotificationDropdown({ notifications = [], onMarkAllRead }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex size-9 items-center justify-center rounded-lg border border-line bg-white text-muted transition-colors hover:border-brand-dark/40 hover:bg-mint hover:text-brand-dark"
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Icon icon="solar:bell-linear" className="size-[18px]" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute top-full right-0 z-50 mt-2 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-white shadow-xl shadow-ink/10">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-bold text-ink">Notifications</p>
            {unreadCount > 0 && onMarkAllRead ? (
              <button type="button" onClick={onMarkAllRead} className="text-xs font-bold text-brand-dark hover:underline">
                Mark all as read
              </button>
            ) : null}
          </div>

          {notifications.length ? (
            <ul className="max-h-[360px] overflow-y-auto">
              {notifications.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 border-b border-line/70 px-4 py-3 last:border-b-0 hover:bg-soft"
                >
                  <span className="flex size-10 flex-none items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-extrabold text-white">
                    {item.title.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">
                      <span className="font-bold">{item.title}</span> {item.message}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{item.time}</p>
                  </div>
                  <span className={cn("mt-1 size-2 flex-none rounded-full", item.unread ? "bg-brand-dark" : "bg-transparent")} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid justify-items-center gap-2 px-6 py-10 text-center">
              <span className="grid size-11 place-items-center rounded-full bg-mint text-brand-dark">
                <Icon icon="solar:bell-off-linear" className="size-5" />
              </span>
              <p className="text-sm font-bold text-ink">You're all caught up</p>
              <p className="text-xs text-muted">New notifications will appear here.</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
