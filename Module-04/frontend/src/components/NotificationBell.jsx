// INTERNAL MODULE 4 FUNCTIONALITY — Module 2 mounts this in its top nav
import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationPanel from './NotificationPanel';
import UnreadBadge from './UnreadBadge';

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, loading } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Notifications"
      >
        <BellIcon />
        <UnreadBadge count={unreadCount} />
      </button>
      {open && (
        <NotificationPanel
          notifications={notifications}
          loading={loading}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}
