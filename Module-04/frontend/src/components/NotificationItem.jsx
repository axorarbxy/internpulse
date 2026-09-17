// INTERNAL MODULE 4 FUNCTIONALITY
export default function NotificationItem({ notification, onMarkRead }) {
  return (
    <button
      onClick={() => !notification.isRead && onMarkRead(notification.id || notification._id)}
      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
        notification.isRead ? 'opacity-60' : 'bg-blue-50'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="text-sm font-medium text-gray-900">{notification.title}</span>
        {!notification.isRead && <span className="w-2 h-2 mt-1 rounded-full bg-blue-500 shrink-0" />}
      </div>
      <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
      <span className="text-xs text-gray-400 mt-1 block">
        {new Date(notification.createdAt).toLocaleString()}
      </span>
    </button>
  );
}
