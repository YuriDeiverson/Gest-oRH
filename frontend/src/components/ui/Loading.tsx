import React from "react";

export interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots";
  fullScreen?: boolean;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = "md",
  variant = "spinner",
  fullScreen = false,
  text,
}) => {
  const loadingClasses = [
    "loading",
    `loading--${size}`,
    fullScreen && "loading--fullscreen",
  ]
    .filter(Boolean)
    .join(" ");

  const renderLoading = () => {
    if (variant === "dots") {
      return (
        <div className={`loading-dots loading-dots--${size}`}>
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
        </div>
      );
    }

    return <div className={`loading-spinner loading-spinner--${size}`}></div>;
  };

  return (
    <div className={loadingClasses}>
      <div className="loading-content">
        {renderLoading()}
        {text && <p className="loading-text">{text}</p>}
      </div>
    </div>
  );
};
