import { useCallback, useRef, useState } from "react";
import { Link } from "react-router";
import { Icon, type IconName } from "@/components/ui";
import { formatRoleLabel, useAuth } from "@/libs/auth";
import { cn } from "@/libs/utils/cn";
import { useDismiss } from "./useDismiss";

const MENU: Array<{ label: string; href: string; icon: IconName }> = [
  { label: "Dashboard", href: "/dashboard", icon: "solar:widget-2-linear" },
  { label: "Members", href: "/members", icon: "solar:users-group-rounded-linear" },
  { label: "Leads", href: "/leads", icon: "solar:case-round-minimalistic-linear" },
  { label: "Followup", href: "/follow-ups", icon: "solar:calendar-mark-linear" },
];

function getInitials(name: string) {
  return (
    name
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const name = user?.username || user?.email || "Portal user";
  const email = user?.email ?? "";
  const initials = getInitials(name);

  async function handleLogout() {
    setIsLoggingOut(true);
    setOpen(false);
    await logout();
  }

  const avatar = (sizeClass: string, textClass: string) =>
    <span
      className={cn(
        sizeClass,
        textClass,
        "flex items-center justify-center bg-gradient-to-br from-brand to-brand-dark font-extrabold text-white",
      )}
    >
      {initials}
    </span>;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex size-9 items-center justify-center overflow-hidden rounded-lg border border-white/12 bg-white/8 transition-colors hover:border-brand/35 hover:bg-white/14"
        aria-label="Profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatar("size-full rounded-[7px]", "text-xs")}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/12 bg-portal/95 text-white shadow-xl shadow-black/25 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            {avatar("size-10 shrink-0 rounded-full", "text-sm")}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{name}</p>
              <p className="truncate text-xs text-white/50">{email}</p>
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-brand">
                {formatRoleLabel(user)}
              </span>
              <span className={cn("ml-auto size-2 rounded-full", user.is_active ? "bg-brand" : "bg-line")} />
              <span className="text-xs text-white/50">{user.is_active ? "Active" : "Inactive"}</span>
            </div>
          ) : null}

          <ul className="py-1">
            {MENU.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  role="menuitem"
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-white/62 hover:bg-white/8 hover:text-white"
                >
                  <Icon icon={item.icon} className="size-4 text-brand" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-white/10 p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-bold text-danger hover:bg-danger-soft disabled:opacity-60"
            >
              <Icon icon="solar:logout-2-linear" className="size-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
