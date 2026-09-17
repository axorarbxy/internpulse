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
import './App.css';

function MainAppContent() {
  const { role, activeTab } = useNavigation();

  // Render view depending on active role and tab
  const renderContent = () => {
    if (role === 'student') {
      switch (activeTab) {
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
  return (
    <NavigationProvider>
      <MainAppContent />
    </NavigationProvider>
  );
}
