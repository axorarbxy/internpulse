import { useState } from 'react';
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
import AuthPage from './pages/AuthPage';
import { getAuthToken } from './services/api';
import { SocketProvider } from '../../../Module-04/frontend/src/context/SocketContext';
import MessagesPage from '../../../Module-04/frontend/src/pages/Messages';
import NotificationsPage from '../../../Module-04/frontend/src/pages/Notifications';
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
  const [authenticated, setAuthenticated] = useState(Boolean(getAuthToken()));

  if (!authenticated) {
    return <AuthPage onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <SocketProvider token={getAuthToken()}>
      <NavigationProvider>
        <MainAppContent />
      </NavigationProvider>
    </SocketProvider>
  );
}