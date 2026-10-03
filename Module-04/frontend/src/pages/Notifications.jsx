// INTERNAL MODULE 4 FUNCTIONALITY — route: /notifications
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/NotificationItem';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  return (
    <div className="notifications-page">
      <header className="notifications-page-header">
        <div>
          <span className="notifications-eyebrow">Activity</span>
          <h1>Notifications</h1>
          <p>Updates about your applications and workspace.</p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="notifications-mark-all"
          disabled={loading || unreadCount === 0}
        >
          Mark all read
        </button>
      </header>
      <section className="notifications-feed" aria-label="Notifications" aria-live="polite">
        {loading && (
          <div className="notifications-state">
            <span className="notifications-spinner" />
            <p>Loading notifications</p>
          </div>
        )}
        {!loading && notifications.length === 0 && (
          <div className="notifications-state notifications-empty-state">
            <span className="notifications-empty-icon" aria-hidden="true">✓</span>
            <h2>You’re all caught up</h2>
            <p>New activity will appear here.</p>
          </div>
        )}
        {!loading && notifications.map((notification) => (
          <NotificationItem key={notification.id || notification._id} notification={notification} onMarkRead={markRead} />
        ))}
      </section>
    </div>
  );
}
