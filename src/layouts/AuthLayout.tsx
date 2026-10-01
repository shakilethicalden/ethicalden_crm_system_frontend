import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-portal text-white">
      <Outlet />
    </main>
  );
}
