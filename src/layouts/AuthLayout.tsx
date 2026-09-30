import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-[#f3f7ef] text-ink">
      <Outlet />
    </main>
  );
}
