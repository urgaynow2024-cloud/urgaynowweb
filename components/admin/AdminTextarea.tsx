import { TextareaHTMLAttributes, forwardRef } from "react";

interface AdminTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const textareaId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="field-label" htmlFor={textareaId}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`textarea ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600 dark:focus:border-red-600/20" : ""} ${className}`}
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

AdminTextarea.displayName = "AdminTextarea";
