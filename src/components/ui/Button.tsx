import type { ComponentProps, ReactNode } from "react";
import { Link, type LinkProps } from "react-router";
import { buttonClass, iconButtonClass, type ButtonSize, type ButtonVariant, type IconButtonVariant } from "./styles";

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  className,
  disabled,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, className, size)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      ) : null}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}

type ButtonLinkProps = LinkProps & { variant?: ButtonVariant; size?: ButtonSize };

export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, className, size)} {...props} />;
}

type IconButtonProps = ComponentProps<"button"> & {
  variant?: IconButtonVariant;
  label: string;
};

export function IconButton({ variant = "default", label, className, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      title={label}
      aria-label={label}
      className={iconButtonClass(variant, className)}
      {...props}
    />
  );
}
