import type { ComponentProps } from "react";
import { cn } from "@/libs/utils/cn";
import { cardClass } from "./styles";

export function PageCard({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn(cardClass, "overflow-hidden", className)} {...props} />;
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("grid gap-5 px-4 py-4", className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn(cardClass, "p-4", className)} {...props} />;
}
