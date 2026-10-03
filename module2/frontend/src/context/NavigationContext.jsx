import { useState, useEffect, useCallback, useMemo } from 'react';
import { NavigationContext } from './navigation-context';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'You have been shortlisted',
    description: 'TechNova Solutions moved your Frontend Developer Intern application to the next stage.',
    time: 'Today',
    unread: true,
    type: 'success',
  },
  {
    id: 'n2',
    title: 'Weekly report due soon',
    description: 'Submit your Machine Learning Engineer Intern progress report by Friday, 5:00 PM.',
    time: 'Today',
    unread: true,
    type: 'warning',
  },
  {
    id: 'n3',
    title: 'Certificate verified',
    description: 'Your AI Research Intern completion certificate from TechNova Solutions is verified.',
    time: 'Yesterday',
    unread: false,
    type: 'info',
  },
  {
    id: 'n4',
    title: 'A role matches your skills',
    description: 'Data Analytics Intern at TechNova Solutions matches your Python and SQL profile.',
    time: 'Yesterday',
    unread: false,
    type: 'purple',
  },
];

const COMPANY_DEFAULT_NOTIFICATIONS = [
  {
    id: 'company-n1',
    title: 'New applicants to review',
    description: 'Aditya Joshi and Meera Iyer applied to your Backend Engineering and Cloud & DevOps roles.',
    time: 'Today',
    unread: true,
    type: 'info',
  },
  {
    id: 'company-n2',
    title: 'Interview stage updated',
    description: 'Priya Sharma is ready for an interview for Frontend Developer Intern.',
    time: 'Today',
    unread: true,
    type: 'success',
  },
  {
    id: 'company-n3',
    title: 'Intern progress needs review',
    description: 'Sneha Kulkarni’s AI Research internship has been flagged for a supervisor check-in.',
    time: 'Yesterday',
    unread: false,
    type: 'warning',
  },
];

const tabsByRole = {
  student: ['dashboard', 'browse', 'my-internships', 'analytics', 'profile', 'resume', 'certificates', 'recommendations', 'messages', 'notifications'],
  institution: ['dashboard', 'monitoring', 'analytics', 'messages', 'notifications'],
  company: ['dashboard', 'manage', 'applicants', 'progress', 'messages', 'notifications'],
  admin: ['dashboard'],
};
const noAllowedTabs = Object.freeze([]);

export default function NavigationProvider({ children, user }) {
  const candidateRole = String(user?.role || '').toLowerCase();
  const role = Object.hasOwn(tabsByRole, candidateRole) ? candidateRole : 'unavailable';
  const allowedTabs = tabsByRole[role] || noAllowedTabs;
  const getInitialTab = () => {
    const [requestedRole, requestedTab] = window.location.hash.replace(/^#\/?/, '').split('/');
    return requestedRole === role && allowedTabs.includes(requestedTab) ? requestedTab : 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => (
    role === 'company' ? COMPANY_DEFAULT_NOTIFICATIONS : DEFAULT_NOTIFICATIONS
  ));

  useEffect(() => {
    const expectedHash = `#${role}/${activeTab}`;
    if (window.location.hash !== expectedHash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${expectedHash}`);
    }
  }, [activeTab, role]);

  // Sync state to URL hash
  const setActiveTab = useCallback((newTab) => {
    if (!allowedTabs.includes(newTab)) return;
    setActiveTabState(newTab);
    window.location.hash = `#${role}/${newTab}`;
    setIsMobileMenuOpen(false);
  }, [allowedTabs, role]);

  // Listen to browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const [requestedRole, requestedTab] = window.location.hash.replace(/^#\/?/, '').split('/');
      if (requestedRole !== role || !allowedTabs.includes(requestedTab)) {
        setActiveTabState('dashboard');
        window.location.hash = `#${role}/dashboard`;
        return;
      }
      setActiveTabState(requestedTab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [allowedTabs, role]);

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
      setActiveTab,
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
      setActiveTab,
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
