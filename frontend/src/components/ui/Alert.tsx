import React, { type HTMLAttributes } from "react";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  onClose,
  className = "",
  children,
  ...props
}) => {
  const alertClasses = ["alert", `alert--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className={alertClasses} role="alert" {...props}>
      <div className="alert-icon">{icons[variant]}</div>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        {children && <div className="alert-message">{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Fechar alerta"
        >
          ✕
        </button>
      )}
    </div>
  );
};
