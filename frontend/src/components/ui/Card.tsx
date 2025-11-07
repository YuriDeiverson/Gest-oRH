import React, { type HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export type CardBodyProps = HTMLAttributes<HTMLDivElement>;

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  align?: "left" | "center" | "right";
}

export const Card: React.FC<CardProps> = ({
  variant = "default",
  padding = "md",
  hoverable = false,
  className = "",
  children,
  ...props
}) => {
  const cardClasses = [
    "card",
    `card--${variant}`,
    `card--padding-${padding}`,
    hoverable && "card--hoverable",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = "",
  children,
  ...props
}) => {
  return (
    <div className={`card-header ${className}`} {...props}>
      <div className="card-header-content">
        {title && <h3 className="card-title">{title}</h3>}
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
};

export const CardBody: React.FC<CardBodyProps> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div className={`card-body ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({
  align = "right",
  className = "",
  children,
  ...props
}) => {
  return (
    <div
      className={`card-footer card-footer--${align} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
