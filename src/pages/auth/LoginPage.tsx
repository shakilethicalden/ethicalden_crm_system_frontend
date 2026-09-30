import { useState, type FormEvent } from "react";
import { Alert, Button, Checkbox, Field, Input } from "@/components/ui";
import { useAuth } from "@/libs/auth";
import { readError } from "@/libs/utils/errors";

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
      // <GuestOnly> redirects as soon as the auth status becomes "authenticated".
      await login(email, password);
    } catch (err) {
      setError(readError(err));
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-5 rounded-xl border border-white/70 bg-white/76 p-6 shadow-xl shadow-ink/10 backdrop-blur-md">
      <div className="grid gap-1 text-center">
        <p className="text-[11px] font-bold tracking-wide text-brand-dark uppercase">Welcome back</p>
        <h2 id="login-title" className="text-lg leading-tight font-bold text-ink">
          Sign in to your portal
        </h2>
        <p className="text-xs text-muted">Use your Ethical Den employee email and password.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3.5" aria-labelledby="login-title">
        <Field label="Email address" className="text-xs">
          <Input
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-9 text-xs"
            required
          />
        </Field>

        <Field label="Password" className="text-xs">
          <Input
            type="password"
            name="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-h-9 text-xs"
            required
          />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Checkbox label="Remember me" defaultChecked className="text-xs text-muted" />
        </div>

        <Alert>{error}</Alert>

        <Button type="submit" className="mt-0.5 w-full" isLoading={isLoading} loadingText="Signing in...">
          Login
        </Button>
      </form>
    </div>
  );
}
