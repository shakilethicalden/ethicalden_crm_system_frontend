import { Outlet, ScrollRestoration } from "react-router";

/** Top-level route element: renders the matched branch and restores scroll on navigation. */
export function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
