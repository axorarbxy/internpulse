import { useState, useEffect, useCallback, useMemo } from 'react';
import { NavigationContext } from './navigation-context';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Application Shortlisted! 🎉',
    description: 'CloudScale Technologies shortlisted your profile for Frontend Developer Intern.',
    time: '25m ago',
    unread: true,
    type: 'success',
  },
  {
    id: 'n2',
    title: 'Weekly Report Due Soon',
    description: 'Week 6 progress timesheet must be submitted by Friday, 6:00 PM.',
    time: '2h ago',
    unread: true,
    type: 'warning',
  },
  {
    id: 'n3',
    title: 'Mentor Feedback Received',
    description: 'Dr. Sarah Jenkins approved your Milestone 2 deliverables with comments.',
    time: 'Yesterday',
    unread: false,
    type: 'info',
  },
  {
    id: 'n4',
    title: 'New Recommended Role',
    description: 'AI Research Intern @ DeepVision matches 94% of your verified skills.',
    time: '2 days ago',
    unread: false,
    type: 'purple',
  },
];

export default function NavigationProvider({ children }) {
  // Parse initial state from hash if present: e.g. #student/dashboard
  const parseHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const storedUser = JSON.parse(window.localStorage.getItem('internpulse_user') || 'null');
    const storedRole = storedUser?.role?.toLowerCase();
    if (!hash) return { role: ['student', 'institution', 'company'].includes(storedRole) ? storedRole : 'student', tab: 'dashboard' };
    const parts = hash.split('/');
    const role = ['student', 'institution', 'company'].includes(parts[0]) ? parts[0] : 'student';
    const tab = parts[1] || 'dashboard';
    return { role, tab };
  };

  const initial = parseHash();
  const [role, setRoleState] = useState(initial.role);
  const [activeTab, setActiveTabState] = useState(initial.tab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  // Sync state to URL hash
  const syncHash = useCallback((newRole, newTab) => {
    window.location.hash = `#${newRole}/${newTab}`;
  }, []);

  const navigate = useCallback((newRole, newTab) => {
    setRoleState(newRole);
    setActiveTabState(newTab);
    syncHash(newRole, newTab);
    setIsMobileMenuOpen(false);
  }, [syncHash]);

  const setRole = useCallback((newRole) => {
    navigate(newRole, 'dashboard');
  }, [navigate]);

  const setActiveTab = useCallback((newTab) => {
    setActiveTabState(newTab);
    syncHash(role, newTab);
    setIsMobileMenuOpen(false);
  }, [role, syncHash]);

  // Listen to browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHash();
      setRoleState(parsed.role);
      setActiveTabState(parsed.tab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Notifications helpers
  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const value = useMemo(
    () => ({
      role,
      activeTab,
      setRole,
      setActiveTab,
      navigate,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      isNotificationsOpen,
      setIsNotificationsOpen,
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
    }),
    [
      role,
      activeTab,
      setRole,
      setActiveTab,
      navigate,
      isMobileMenuOpen,
      isNotificationsOpen,
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
    ]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}
