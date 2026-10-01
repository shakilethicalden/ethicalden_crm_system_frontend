import { useState, type FormEvent } from "react";
import { Alert, Button, Field, Icon, Input } from "@/components/ui";
import { useAuth } from "@/libs/auth";
import { readError } from "@/libs/utils/errors";

const highlights = [
  { label: "Leads", value: "Pipeline" },
  { label: "Follow ups", value: "Scheduled" },
  { label: "Team", value: "Tracked" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(readError(err));
      setIsLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,0.72fr)] xl:grid-cols-[minmax(0,1fr)_minmax(580px,0.7fr)]">
      <section className="relative hidden overflow-hidden bg-ink p-9 text-white lg:grid lg:content-between xl:p-14">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(rgba(134,206,71,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(134,206,71,0.13)_1px,transparent_1px)] bg-[size:48px_48px]"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(134,206,71,0.18))]" aria-hidden="true" />

        <div className="relative z-10">
          <img src="/edn_logo.png" alt="Ethical Den" className="h-14 w-auto object-contain" />
          <p className="mt-2 text-xs font-semibold tracking-wide text-white/55 uppercase">CRM Workspace</p>
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-bold text-brand">
            <Icon icon="solar:shield-check-linear" className="size-4" />
            Secure employee access
          </div>
          <h1 className="max-w-2xl text-5xl leading-[0.98] font-black tracking-tight xl:text-7xl">
            Close every conversation with context.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/65">
            Ethical Den CRM keeps employees, leads, and follow-up activity in one focused operating view.
          </p>
        </div>

        <div className="relative z-10 grid gap-3 sm:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/7 p-4 backdrop-blur">
              <p className="text-2xl font-black text-brand">{item.value}</p>
              <p className="mt-1 text-xs font-bold tracking-wide text-white/55 uppercase">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid content-center px-5 py-8 sm:px-10 lg:bg-white xl:px-16">
        <div className="mx-auto grid w-full max-w-[500px] gap-8">
          <div className="lg:hidden">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl border border-line bg-white p-1.5">
                <img src="/edn_icon.png" alt="" className="size-full object-contain" />
              </span>
              <span>
                <span className="block text-lg font-extrabold text-ink">Ethical Den</span>
                <span className="block text-xs font-semibold tracking-wide text-muted uppercase">CRM Workspace</span>
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-xs font-bold tracking-[0.16em] text-brand-dark uppercase">Employee Portal</p>
            <h2 id="login-title" className="text-3xl leading-tight font-black tracking-tight text-ink">
              Sign in to CRM
            </h2>
            <p className="text-sm leading-6 text-muted">Enter your employee credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4" aria-labelledby="login-title">
            <Field label="Email address">
              <Input
                type="email"
                name="email"
                placeholder="employee@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-12 bg-field"
                required
              />
            </Field>

            <Field label="Password">
              <Input
                type="password"
                name="password"
                placeholder="Enter password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-12 bg-field"
                required
              />
            </Field>

            <Alert>{error}</Alert>

            <Button type="submit" className="mt-1 min-h-12 w-full text-base" isLoading={isLoading} loadingText="Signing in...">
              Sign in
              <Icon icon="solar:alt-arrow-right-linear" className="size-4" />
            </Button>
          </form>

         
        </div>
      </section>
    </div>
  );
}
