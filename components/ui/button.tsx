import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "default" | "lg";
  asChild?: boolean;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";
  const { type, ...rest } = props;

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-3 rounded-[9999px] font-bold leading-none transition-all duration-300",
        variant === "default" &&
          "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-glow-strong hover:scale-[1.02]",

        variant === "outline" &&
          "border border-white/20 bg-white/5 text-white hover:border-orange-500 hover:text-orange-500",

        size === "lg" &&
          "h-[56px] px-[32px] text-sm uppercase tracking-[0.12em]",

        className
      )}
      {...rest}
      type={asChild ? undefined : type ?? "button"}
    />
  );
}