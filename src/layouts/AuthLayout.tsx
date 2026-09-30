import { Outlet } from "react-router";
import { Eyebrow } from "@/components/ui";

const HIGHLIGHTS = ["Lead Pipeline", "Follow-up Tracking", "Employee CRM"];

/** Split screen for public pages: brand panel on the left, the page (<Outlet />) on the right. */
export function AuthLayout() {
  return (
    <main className="grid min-h-screen bg-mint bg-[radial-gradient(circle_at_11%_18%,rgba(255,255,255,0.96),transparent_24%),radial-gradient(circle_at_82%_24%,rgba(255,255,255,0.82),transparent_30%),linear-gradient(115deg,rgba(166,255,88,0.5),rgba(255,255,255,0.78)_48%,rgba(166,255,88,0.28))] lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.75fr)]">
      <section className="grid content-center p-8 sm:p-12 xl:p-24">
        <div className="grid size-24 place-items-center overflow-hidden rounded-[18px] border border-ink/10 bg-ink text-2xl font-black text-brand">
          ED
        </div>
        <Eyebrow className="mt-6">Ethical Den</Eyebrow>
        <h1 className="my-5 max-w-3xl text-4xl leading-[0.98] font-extrabold tracking-tight sm:text-5xl xl:text-7xl">
          Client relationships, followed through with focus.
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted">
          Manage employees, leads, and follow-up activity from one clean CRM workspace.
        </p>
        <div className="mt-8 flex flex-wrap gap-3" aria-label="Portal highlights">
          {HIGHLIGHTS.map((item) => (
            <span key={item} className="rounded-full border border-ink/10 bg-white/70 px-3.5 py-2.5 text-sm font-bold">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="flex flex-col justify-center p-7 sm:p-12 xl:p-16">
        <Outlet />
      </section>
    </main>
  );
}
