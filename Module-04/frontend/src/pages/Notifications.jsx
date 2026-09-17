// INTERNAL MODULE 4 FUNCTIONALITY — route: /notifications
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/NotificationItem';

export default function NotificationsPage() {
  const { notifications, loading, markRead, markAllRead } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
        <button onClick={markAllRead} className="text-sm text-blue-600 hover:underline">
          Mark all read
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading && <p className="p-4 text-sm text-gray-400">Loading…</p>}
        {!loading && notifications.length === 0 && (
          <p className="p-6 text-sm text-gray-400 text-center">No notifications yet</p>
        )}
        {notifications.map((n) => (
          <NotificationItem key={n.id || n._id} notification={n} onMarkRead={markRead} />
        ))}
      </div>
    </div>
  );
}
