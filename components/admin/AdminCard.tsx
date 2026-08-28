import { ReactNode } from "react";

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function AdminCard({ children, className = "", title, description, actions }: AdminCardProps) {
  return (
    <div className={`card ${className}`}>
      {(title || description || actions) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {description && <p className="card-subtitle">{description}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}
