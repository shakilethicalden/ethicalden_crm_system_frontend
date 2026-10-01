import { useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/libs/utils/cn";
import { fieldControlClass } from "./styles";
import { Icon } from "./Icon";

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  full?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({ label, hint, full, className, children }: FieldProps) {
  return (
    <label className={cn("grid content-start gap-1.5 text-sm font-semibold text-white", full && "col-span-full", className)}>
      <span>{label}</span>
      {children}
      {hint ? <small className="text-xs font-medium text-white/55">{hint}</small> : null}
    </label>
  );
}

const gridCols = {
  2: "grid-cols-1 md:grid-cols-2",
  4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
} as const;

type FormGridProps = ComponentProps<"div"> & {
  cols?: keyof typeof gridCols;
};

export function FormGrid({ cols = 2, className, ...props }: FormGridProps) {
  return <div className={cn("grid gap-4", gridCols[cols], className)} {...props} />;
}

export function Input({ className, type, ...props }: ComponentProps<"input">) {
  const [showPassword, setShowPassword] = useState(false);

  if (type === "password") {
    return (
      <span className="relative block">
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          className={cn(fieldControlClass, "min-h-10", className, "pr-10")}
        />
        <button
          type="button"
          disabled={props.disabled}
          onClick={() => setShowPassword((value) => !value)}
          className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-white/55 transition-colors hover:bg-white/10 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={showPassword ? "Hide password" : "Show password"}
          title={showPassword ? "Hide password" : "Show password"}
        >
          <Icon icon={showPassword ? "solar:eye-closed-linear" : "solar:eye-linear"} className="size-4" />
        </button>
      </span>
    );
  }

  return <input type={type} className={cn(fieldControlClass, "min-h-10", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(fieldControlClass, "min-h-10 [&_optgroup]:bg-portal [&_optgroup]:text-white [&_option]:bg-portal [&_option]:text-white", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(fieldControlClass, "min-h-24 resize-y py-2.5 leading-relaxed", className)}
      {...props}
    />
  );
}

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & { label: ReactNode };

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn("inline-flex items-center gap-2 text-sm font-semibold text-white", className)}>
      <input type="checkbox" className="size-4 accent-brand-dark" {...props} />
      <span>{label}</span>
    </label>
  );
}
