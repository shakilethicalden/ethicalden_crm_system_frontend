import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { AppHeader, AppSidebar, DashboardFooter, NavigationProgress } from "@/components/layout";
import { cn } from "@/libs/utils/cn";
import { preloadPages } from "@/routes/preload";

const COLLAPSED_KEY = "ethicalden_crm_sidebar_collapsed";

/** Authenticated shell: AppSidebar + AppHeader + page (<Outlet />) + footer. */
export function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  // Once signed in, fetch all page chunks in the background so menu clicks open instantly.
  useEffect(() => {
    preloadPages();
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;

      try {
        localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // Storage unavailable (private mode) — keep the in-memory state only.
      }

      return next;
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-portal text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-40 left-1/4 h-96 w-96 rounded-full bg-brand-dark/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-0 bottom-0 h-[32rem] w-[32rem] rounded-full bg-brand/10 blur-3xl"
      />
      <NavigationProgress />
      <AppSidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={toggleCollapsed}
      />

      <div
        className={cn(
          "flex min-h-screen min-w-0 flex-col transition-[padding] duration-300 ease-in-out",
          collapsed ? "lg:pl-[70px]" : "lg:pl-[260px]",
        )}
      >
        <AppHeader onToggleSidebar={() => setSidebarOpen((open) => !open)} />

        <main className="relative z-10 flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="flex-1">
            <Outlet />
          </div>
          <DashboardFooter />
        </main>
      </div>
    </div>
  );
}

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}
