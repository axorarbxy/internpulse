import { useNavigation } from '../../context';
import {
  IconMenu,
  IconSearch,
  IconBell,
  IconCheckCircle,
  IconAlertCircle,
  IconSparkles,
} from './Icons';

export default function Navbar() {
  const {
    role,
    activeTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNavigation();

  const storedUser = (() => {
    try {
      const userData = window.localStorage.getItem('internpulse_user');
      const parsedUser = userData ? JSON.parse(userData) : {};

      return parsedUser && typeof parsedUser === 'object'
        ? parsedUser
        : {};
    } catch {
      return {};
    }
  })();

  const getPageTitle = () => {
    const formattedTab = activeTab
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());

    return formattedTab;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <IconCheckCircle size={16} color="var(--color-success)" />;
      case 'warning':
        return <IconAlertCircle size={16} color="var(--color-warning)" />;
      case 'purple':
        return <IconSparkles size={16} color="var(--color-purple)" />;
      default:
        return <IconBell size={16} color="var(--color-info)" />;
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <IconMenu size={22} />
        </button>

        <div className="navbar-breadcrumb">
          <span style={{ textTransform: 'capitalize' }}>{role}</span>
          <span>/</span>
          <span className="page-title">{getPageTitle()}</span>
        </div>

        <div className="navbar-search">
          <IconSearch size={16} className="navbar-search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search internships, skills..."
            aria-label="Search"
          />
        </div>
      </div>

      <div className="navbar-right">
        <div className="notification-bell-wrap">
          <button
            type="button"
            className="notification-bell-btn"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="View notifications"
          >
            <IconBell size={20} />

            {unreadCount > 0 && (
              <span className="notification-badge-count">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-dropdown-header">
                <h4>Notifications ({unreadCount} new)</h4>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="mark-all-read-btn"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notifications-dropdown-list">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`notification-item ${
                      item.unread ? 'unread' : ''
                    }`}
                    onClick={() => markAsRead(item.id)}
                  >
                    <div className="notification-item-icon">
                      {getNotificationIcon(item.type)}
                    </div>

                    <div className="notification-item-content">
                      <p className="notification-item-title">
                        {item.title}
                      </p>

                      <p className="notification-item-desc">
                        {item.description}
                      </p>

                      <span className="notification-item-time">
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
            <div
              style={{
                fontSize: '14.3px',
                fontWeight: 600,
                color: 'var(--text-main)',
              }}
            >
              {storedUser.name || 'Demo User'}
            </div>

            <div
              style={{
                fontSize: '12.1px',
                color: 'var(--text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {storedUser.role || role}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '13.2px' }}
            onClick={() => {
              window.localStorage.removeItem('internpulse_token');
              window.localStorage.removeItem('internpulse_user');
              window.localStorage.removeItem('internpulse_student_id');
              window.location.reload();
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}