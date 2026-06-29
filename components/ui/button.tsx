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
        "inline-flex min-w-0 max-w-full items-center justify-center gap-3 rounded-[9999px] text-center font-bold leading-none transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-60 [&_svg]:shrink-0",
        variant === "default" &&
          "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-glow-strong hover:scale-[1.02]",

        variant === "outline" &&
          "border border-white/20 bg-white/5 text-white hover:border-orange-500 hover:text-orange-500",

        size === "lg" &&
          "min-h-[56px] px-6 py-3 text-sm uppercase tracking-[0.12em] sm:px-[32px]",

        className
      )}
      {...rest}
      type={asChild ? undefined : type ?? "button"}
    />
  );
}
