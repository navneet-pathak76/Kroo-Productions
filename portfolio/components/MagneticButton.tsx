"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";
import { cn } from "@/lib/cn";

interface MagneticButtonProps {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
  icon?: ReactNode;
  className?: string;
}

export function MagneticButton({
  href,
  children,
  variant = "solid",
  icon,
  className,
}: MagneticButtonProps) {
  const ref = useMagnetic<HTMLAnchorElement>();

  return (
    <Link
      ref={ref}
      href={href}
      className={cn(
        "btn",
        variant === "solid" ? "btn-solid" : "btn-ghost",
        className
      )}
    >
      {children}
      {icon}
    </Link>
  );
}
