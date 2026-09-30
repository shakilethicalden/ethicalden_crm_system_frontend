import { createBrowserRouter, Navigate, type RouteObject } from "react-router";
import { AuthLayout } from "@/layouts/AuthLayout";
import { PortalLayout } from "@/layouts/PortalLayout";
import { RootLayout } from "@/layouts/RootLayout";
import { GuestOnly, RequireAuth } from "./guards";
import { registerPage, type PageModule } from "./preload";

/**
 * Code-split a page: each page file default-exports its component.
 * Pages are also registered for background preloading (see preload.ts), so after login
 * every chunk is already downloaded and navigation doesn't wait on the network.
 */
function page(load: () => Promise<PageModule>): Pick<RouteObject, "lazy"> {
  registerPage(load);
  return { lazy: async () => ({ Component: (await load()).default }) };
}

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // ---- Public -------------------------------------------------------
      {
        element: <GuestOnly />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: "login", ...page(() => import("@/pages/auth/LoginPage")) },
            ],
          },
        ],
      },

      // ---- Authenticated portal ------------------------------------------
      {
        element: <RequireAuth />,
        children: [
          {
            element: <PortalLayout />,
            children: [
              { path: "dashboard", ...page(() => import("@/pages/dashboard/DashboardPage")) },
              { path: "employees", ...page(() => import("@/pages/crm/EmployeesPage")) },
              { path: "leads", ...page(() => import("@/pages/crm/LeadsPage")) },
              { path: "follow-ups", ...page(() => import("@/pages/crm/FollowUpsPage")) },

              { path: "*", ...page(() => import("@/pages/NotFoundPage")) },
            ],
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
