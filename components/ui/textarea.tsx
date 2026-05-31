import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[140px] w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";