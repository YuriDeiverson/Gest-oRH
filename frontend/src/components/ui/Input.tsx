import React, {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
} from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      icon,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const wrapperClasses = [
      "input-wrapper",
      fullWidth && "input-wrapper--full-width",
      hasError && "input-wrapper--error",
    ]
      .filter(Boolean)
      .join(" ");

    const inputClasses = ["input", icon && "input--with-icon", className]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {props.required && <span className="input-required">*</span>}
          </label>
        )}
        <div className="input-field-wrapper">
          {icon && <span className="input-icon">{icon}</span>}
          <input ref={ref} id={inputId} className={inputClasses} {...props} />
        </div>
        {error && <span className="input-error">{error}</span>}
        {!error && helperText && (
          <span className="input-helper">{helperText}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const wrapperClasses = [
      "input-wrapper",
      fullWidth && "input-wrapper--full-width",
      hasError && "input-wrapper--error",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={textareaId} className="input-label">
            {label}
            {props.required && <span className="input-required">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`textarea ${className}`}
          {...props}
        />
        {error && <span className="input-error">{error}</span>}
        {!error && helperText && (
          <span className="input-helper">{helperText}</span>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
