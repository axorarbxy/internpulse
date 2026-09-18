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
    setRole,
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

  // Helper for page title
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
        {/* Role Switcher Pill Bar for Quick Demonstration */}
        <div className="role-switcher-group" role="group" aria-label="Portal Role Selector">
          <button
            type="button"
            className={`role-switch-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            Student
          </button>
          <button
            type="button"
            className={`role-switch-btn ${role === 'institution' ? 'active' : ''}`}
            onClick={() => setRole('institution')}
          >
            Institution
          </button>
          <button
            type="button"
            className={`role-switch-btn ${role === 'company' ? 'active' : ''}`}
            onClick={() => setRole('company')}
          >
            Company
          </button>
        </div>

        {/* Notification Bell with Dropdown Popover */}
        <div className="notification-bell-wrap">
          <button
            type="button"
            className="notification-bell-btn"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="View notifications"
          >
            <IconBell size={20} />
            {unreadCount > 0 && <span className="notification-badge-count">{unreadCount}</span>}
          </button>

          {isNotificationsOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-dropdown-header">
                <h4>Notifications ({unreadCount} new)</h4>
                {unreadCount > 0 && (
                  <button type="button" className="mark-all-read-btn" onClick={markAllAsRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notifications-dropdown-list">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`notification-item ${item.unread ? 'unread' : ''}`}
                    onClick={() => markAsRead(item.id)}
                  >
                    <div className="notification-item-icon">{getNotificationIcon(item.type)}</div>
                    <div className="notification-item-content">
                      <p className="notification-item-title">{item.title}</p>
                      <p className="notification-item-desc">{item.description}</p>
                      <span className="notification-item-time">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar, Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
              {JSON.parse(window.localStorage.getItem('internpulse_user') || '{}').name || 'Demo User'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {JSON.parse(window.localStorage.getItem('internpulse_user') || '{}').role || role}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '12px' }}
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
