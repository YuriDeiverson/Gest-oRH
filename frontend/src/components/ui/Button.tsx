import React, { type ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = "left",
  className = "",
  disabled,
  ...props
}) => {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && "btn--full-width",
    loading && "btn--loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <span className="btn__loader">
          <span className="btn__loader-spinner"></span>
        </span>
      )}
      {!loading && icon && iconPosition === "left" && (
        <span className="btn__icon btn__icon--left">{icon}</span>
      )}
      <span className="btn__text">{children}</span>
      {!loading && icon && iconPosition === "right" && (
        <span className="btn__icon btn__icon--right">{icon}</span>
      )}
    </button>
  );
};
