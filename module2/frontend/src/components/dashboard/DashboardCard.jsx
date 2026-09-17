export default function DashboardCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  footer,
}) {
  return (
    <div className={`dashboard-card ${className}`.trim()}>
      {(title || subtitle || action) && (
        <div className="dashboard-card-header">
          <div className="dashboard-card-titles">
            {title && <h3 className="dashboard-card-title">{title}</h3>}
            {subtitle && <p className="dashboard-card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="dashboard-card-action">{action}</div>}
        </div>
      )}
      <div className="dashboard-card-body">{children}</div>
      {footer && <div className="dashboard-card-footer">{footer}</div>}
    </div>
  );
}
