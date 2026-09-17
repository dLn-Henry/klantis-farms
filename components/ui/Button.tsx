import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "outline";
  type?: "button" | "submit";
  className?: string;
  fullWidth?: boolean;
};

export function Button({
  children,
  href,
  variant = "solid",
  type = "button",
  className = "",
  fullWidth = false,
}: ButtonProps) {
  const base = variant === "solid" ? "btn-solid" : "btn-outline";
  const width = fullWidth ? "w-full justify-center" : "";
  const classes = `${base} ${width} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
}
