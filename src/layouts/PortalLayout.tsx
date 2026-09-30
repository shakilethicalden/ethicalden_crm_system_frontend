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
    <div className="min-h-screen bg-soft">
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

        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
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
