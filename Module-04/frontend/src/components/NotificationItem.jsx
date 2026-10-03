// INTERNAL MODULE 4 FUNCTIONALITY
export default function NotificationItem({ notification, onMarkRead }) {
  return (
    <button
      type="button"
      onClick={() => !notification.isRead && onMarkRead(notification.id || notification._id)}
      className={`notification-item${notification.isRead ? ' is-read' : ' is-unread'}`}
    >
      <span className="notification-item-indicator" aria-hidden="true" />
      <span className="notification-item-content">
        <span className="notification-item-heading">
          <span className="notification-item-title">{notification.title}</span>
          {!notification.isRead && <span className="notification-unread-label">New</span>}
        </span>
        <span className="notification-item-message">{notification.message}</span>
        <time className="notification-item-time" dateTime={notification.createdAt}>
          {new Date(notification.createdAt).toLocaleString()}
        </time>
      </span>
    </button>
  );
}
