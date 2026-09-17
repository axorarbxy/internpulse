// INTERNAL MODULE 4 FUNCTIONALITY
import { useCallback, useEffect, useState } from 'react';
import { notificationsApi } from '../services/api';
import { useSocket } from '../context/SocketContext';

export function useNotifications() {
  const { socket } = useSocket() || {};
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        notificationsApi.list({ page: 1, limit: 20 }),
        notificationsApi.unreadCount(),
      ]);
      setNotifications(listRes.data.data.items);
      setUnreadCount(countRes.data.data.count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!socket) return undefined;

    const onNew = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);
    };
    const onUpdated = (payload) => {
      if (payload.all) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } else {
        setNotifications((prev) => prev.map((n) => (n.id === payload.id ? { ...n, isRead: payload.isRead } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    };

    socket.on('notification:new', onNew);
    socket.on('notification:updated', onUpdated);
    return () => {
      socket.off('notification:new', onNew);
      socket.off('notification:updated', onUpdated);
    };
  }, [socket]);

  const markRead = useCallback(async (id) => {
    await notificationsApi.markRead(id);
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead();
  }, []);

  return { notifications, unreadCount, loading, markRead, markAllRead, refresh };
}
