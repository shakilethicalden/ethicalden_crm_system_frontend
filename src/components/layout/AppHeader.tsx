import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/libs/auth";
import { cn } from "@/libs/utils/cn";
import { getNavLabel, getVisibleNavLinks } from "@/routes/navigation";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import { useDismiss } from "./useDismiss";
import { Icon } from "@/components/ui";

type AppHeaderProps = {
  onToggleSidebar: () => void;
};

function HeaderIconButton({ label, children, onClick }: { label: string; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="hidden size-9 items-center justify-center rounded-lg border border-white/12 bg-white/8 text-white/65 transition-colors hover:border-brand/35 hover:bg-white/14 hover:text-brand sm:inline-flex"
    >
      {children}
    </button>
  );
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/10 bg-portal/78 px-4 text-white shadow-lg shadow-black/10 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="flex size-9 items-center justify-center rounded-md text-white/65 hover:bg-white/10 hover:text-brand lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Icon icon="solar:hamburger-menu-linear" className="size-5" />
      </button>

      <PageSearch />

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <HeaderIconButton label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
          {isFullscreen ? <Icon icon="solar:minimize-square-minimalistic-linear" className="size-[18px]" /> : <Icon icon="solar:maximize-square-minimalistic-linear" className="size-[18px]" />}
        </HeaderIconButton>

        <NotificationDropdown />

        <ProfileDropdown />
      </div>
    </header>
  );
}

/** "Jump to page" search over the menu items the current role can see. Ctrl/⌘ + K focuses it. */
function PageSearch() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(wrapperRef, open, close);

  const links = useMemo(() => getVisibleNavLinks(role), [role]);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = term
      ? links.filter((link) => `${getNavLabel(link, role)} ${link.section}`.toLowerCase().includes(term))
      : links;
    return matches.slice(0, 8);
  }, [links, query, role]);

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function go(href: string) {
    navigate(href);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlight((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[highlight]) {
      event.preventDefault();
      go(results[highlight].href);
    }
  }

  return (
    <div ref={wrapperRef} className="relative hidden max-w-md flex-1 md:block">
      <Icon icon="solar:magnifer-linear" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/45" />
      <input
        ref={inputRef}
        type="search"
        placeholder="Search pages"
        aria-label="Search pages"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setHighlight(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-md border border-white/12 bg-white/8 py-2 pr-16 pl-9 text-sm text-white placeholder:text-white/45 focus:border-brand/45 focus:bg-white/12 focus:ring-2 focus:ring-brand/20 focus:outline-none"
      />
      <span className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 items-center rounded border border-white/12 px-1.5 py-0.5 text-[11px] font-semibold text-white/45">
        Ctrl K
      </span>

      {open ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-white/12 bg-portal/95 py-1 shadow-xl shadow-black/25 backdrop-blur-xl">
          {results.length ? (
            <ul role="listbox" aria-label="Pages">
              {results.map((link, index) => {

                return (
                  <li key={link.href} role="option" aria-selected={index === highlight}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlight(index)}
                      onClick={() => go(link.href)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm",
                        index === highlight ? "bg-white/12 text-white" : "text-white/62",
                      )}
                    >
                      <span className="grid size-7 place-items-center rounded-md bg-white/10 text-brand ring-1 ring-white/10">
                        {link.icon ? <Icon icon={link.icon} className="size-4" /> : null}
                      </span>
                      <span className="flex-1 font-semibold">{getNavLabel(link, role)}</span>
                      <span className="text-xs text-white/42">{link.section}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-muted">No pages match “{query}”.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
