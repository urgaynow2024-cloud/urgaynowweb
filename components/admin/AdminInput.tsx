import { InputHTMLAttributes, forwardRef } from "react";

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="field-label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600 dark:focus:border-red-600/20" : ""} ${className}`}
          {...props}
        />
        {error && <p className="field-error">{error}</p>}
        {helperText && !error && (
          <p className="field-help">{helperText}</p>
        )}
      </div>
    );
  }
);

AdminInput.displayName = "AdminInput";
