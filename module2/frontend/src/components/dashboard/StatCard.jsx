import { IconTrendingUp } from '../common/Icons';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType = 'up',
  subtitle,
  accent = 'primary',
  onClick,
}) {
  const handleKeyDown = (event) => {
    if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    event.currentTarget.click();
  };

  return (
    <div
      className={`stat-card stat-card-${accent} ${onClick ? 'stat-card-clickable' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-header">
        <div className="stat-card-info">
          <span className="stat-card-title">{title}</span>
          <h3 className="stat-card-value">{value}</h3>
        </div>
        {Icon && (
          <div className={`stat-card-icon-wrap icon-bg-${accent}`}>
            <Icon size={24} className="stat-card-icon" />
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="stat-card-footer">
          {trend && (
            <span className={`stat-card-trend trend-${trendType}`}>
              {trendType !== 'neutral' && (
                <IconTrendingUp
                  size={14}
                  className={`trend-icon ${trendType === 'down' ? 'trend-icon-down' : ''}`}
                />
              )}
              {trend}
            </span>
          )}
          {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
