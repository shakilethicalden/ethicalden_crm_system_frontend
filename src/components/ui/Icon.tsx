import { Icon as IconifyIcon, type IconProps as IconifyIconProps } from "@iconify/react";
import { cn } from "@/libs/utils/cn";

/**
 * Solar icon name, e.g. `solar:eye-linear` / `solar:widget-2-bold-duotone`.
 * Browse: https://icon-sets.iconify.design/solar/ — new names are bundled automatically
 * by `scripts/generate-icons.mjs` on the next `npm run dev` / `npm run build` (or `npm run icons`).
 */
export type IconName = `solar:${string}`;

type IconProps = Omit<IconifyIconProps, "icon" | "ref" | "width" | "height"> & {
  icon: IconName;
  /** Accessible label. Without it the icon is decorative (`aria-hidden`). */
  label?: string;
};

/**
 * Usage: `<Icon icon="solar:home-linear" className="size-5 text-brand-dark" />`
 * Size and color come from `className` (defaults to 1em and `currentColor`).
 */
export function Icon({ icon, label, className, ...props }: IconProps) {
  return (
    <IconifyIcon
      icon={icon}
      className={cn("shrink-0", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      {...props}
    />
  );
}
