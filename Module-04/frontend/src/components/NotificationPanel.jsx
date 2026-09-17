// INTERNAL MODULE 4 FUNCTIONALITY
import NotificationItem from './NotificationItem';

export default function NotificationPanel({ notifications, loading, onMarkRead, onMarkAllRead, onClose }) {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex gap-3 items-center">
          <button onClick={onMarkAllRead} className="text-xs text-blue-600 hover:underline">
            Mark all read
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading && <p className="text-sm text-gray-400 p-4">Loading…</p>}
        {!loading && notifications.length === 0 && (
          <p className="text-sm text-gray-400 p-4 text-center">No notifications yet</p>
        )}
        {notifications.map((n) => (
          <NotificationItem key={n.id || n._id} notification={n} onMarkRead={onMarkRead} />
        ))}
      </div>
    </div>
  );
}
