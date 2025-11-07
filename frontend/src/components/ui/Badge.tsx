import React, { type HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "md",
  dot = false,
  className = "",
  children,
  ...props
}) => {
  const badgeClasses = [
    "badge",
    `badge--${variant}`,
    `badge--${size}`,
    dot && "badge--dot",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};
