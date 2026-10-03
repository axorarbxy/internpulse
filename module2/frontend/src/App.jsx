import { useEffect, useState } from 'react';
import { NavigationProvider, useNavigation } from './context';
import DashboardLayout from './layouts/DashboardLayout';
import {
  StudentDashboard,
  BrowseInternships,
  MyInternships,
  StudentAnalytics,
  StudentProfile,
  ResumeBuilder,
  Certificates,
  Recommendations,
  InstitutionDashboard,
  StudentMonitoring,
  InstitutionAnalytics,
  CompanyDashboard,
  ManageInternships,
  Applicants,
  InternshipProgress,
} from './pages';
import AuthPage from '../../../sign-in/frontend/AuthPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import { apiRequest, getAuthToken, setAuthToken } from './services/api';
import { SocketProvider } from '../../../Module-04/frontend/src/context/SocketContext';
import MessagesPage from '../../../Module-04/frontend/src/pages/Messages';
import NotificationsPage from '../../../Module-04/frontend/src/pages/Notifications';
import VerifyCertificatePage from '../../../Module-04/frontend/src/pages/VerifyCertificate';
import './App.css';

function MainAppContent() {
  const { role, activeTab } = useNavigation();

  const user = (() => {
    try {
      const userData = window.localStorage.getItem('internpulse_user');
      const parsedUser = userData ? JSON.parse(userData) : null;

      return parsedUser && typeof parsedUser === 'object'
        ? parsedUser
        : null;
    } catch {
      return null;
    }
  })();

  const renderContent = () => {
    if (role === 'admin') return <AdminDashboard />;

    if (role === 'student') {
      switch (activeTab) {
        case 'messages':
          return <MessagesPage currentUserId={String(user?.id || '')} />;
        case 'notifications':
          return <NotificationsPage />;
        case 'dashboard':
          return <StudentDashboard />;
        case 'browse':
          return <BrowseInternships />;
        case 'my-internships':
          return <MyInternships />;
        case 'analytics':
          return <StudentAnalytics />;
        case 'profile':
          return <StudentProfile />;
        case 'resume':
          return <ResumeBuilder />;
        case 'certificates':
          return <Certificates />;
        case 'recommendations':
          return <Recommendations />;
        default:
          return <StudentDashboard />;
      }
    }

    if (role === 'institution') {
      switch (activeTab) {
        case 'messages':
          return <MessagesPage currentUserId={String(user?.id || '')} />;
        case 'notifications':
          return <NotificationsPage />;
        case 'dashboard':
          return <InstitutionDashboard />;
        case 'monitoring':
          return <StudentMonitoring />;
        case 'analytics':
          return <InstitutionAnalytics />;
        default:
          return <InstitutionDashboard />;
      }
    }

    if (role === 'company') {
      switch (activeTab) {
        case 'messages':
          return <MessagesPage currentUserId={String(user?.id || '')} />;
        case 'notifications':
          return <NotificationsPage />;
        case 'dashboard':
          return <CompanyDashboard />;
        case 'manage':
          return <ManageInternships />;
        case 'applicants':
          return <Applicants />;
        case 'progress':
          return <InternshipProgress />;
        default:
          return <CompanyDashboard />;
      }
    }

    return <StudentDashboard />;
  };

  return <DashboardLayout>{renderContent()}</DashboardLayout>;
}

export default function App() {
  const [sessionUser, setSessionUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(Boolean(getAuthToken()));
  const verificationMatch = window.location.hash.match(/^#\/?verify\/([^/]+)$/);

  useEffect(() => {
    if (!getAuthToken()) return undefined;

    let isActive = true;
    apiRequest('/auth/me')
      .then(({ user }) => {
        if (!isActive) return;
        window.localStorage.setItem('internpulse_user', JSON.stringify(user));
        setSessionUser(user);
      })
      .catch(() => {
        if (!isActive) return;
        setAuthToken(null);
        window.localStorage.removeItem('internpulse_user');
        window.localStorage.removeItem('internpulse_student_id');
        setSessionUser(null);
      })
      .finally(() => {
        if (isActive) setCheckingSession(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (verificationMatch) {
    return <VerifyCertificatePage certificateId={decodeURIComponent(verificationMatch[1])} />;
  }

  if (checkingSession) {
    return <div className="loading-container" role="status"><div className="spinner" /><p>Verifying your account...</p></div>;
  }

  if (!sessionUser) {
    return <AuthPage onAuthenticated={setSessionUser} />;
  }

  if (!['STUDENT', 'COMPANY', 'INSTITUTION', 'ADMIN'].includes(sessionUser.role)) {
    return (
      <main className="role-workspace-unavailable">
        <h1>Workspace unavailable</h1>
        <p>This account does not have a configured portal workspace.</p>
        <button type="button" className="btn btn-secondary" onClick={() => {
          setAuthToken(null);
          window.localStorage.removeItem('internpulse_user');
          setSessionUser(null);
        }}>Sign out</button>
      </main>
    );
  }

  return (
    <SocketProvider token={getAuthToken()}>
      <NavigationProvider user={sessionUser}>
        <MainAppContent />
      </NavigationProvider>
    </SocketProvider>
  );
}