import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";