import { useNavigation } from '../../context';
import {
  IconDashboard,
  IconBriefcase,
  IconFolderCheck,
  IconAnalytics,
  IconUser,
  IconFileText,
  IconAward,
  IconSparkles,
  IconBuilding,
  IconUsers,
  IconCheckCircle,
  IconBell,
} from './Icons';

export default function Sidebar() {
  const { role, activeTab, setActiveTab, isMobileMenuOpen } = useNavigation();

  // Navigation schema per role
  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
    { id: 'browse', label: 'Browse Internships', icon: IconBriefcase },
    { id: 'my-internships', label: 'My Internships', icon: IconFolderCheck, badge: '1 Active' },
    { id: 'analytics', label: 'Student Analytics', icon: IconAnalytics },
    { id: 'profile', label: 'Student Profile', icon: IconUser },
    { id: 'resume', label: 'Resume Builder', icon: IconFileText },
    { id: 'certificates', label: 'Certificates', icon: IconAward, badge: '2 Verified' },
    { id: 'recommendations', label: 'Recommendations', icon: IconSparkles, badge: 'New' },
    { id: 'messages', label: 'Messages', icon: IconFileText },
    { id: 'notifications', label: 'Notifications', icon: IconBell },
  ];

  const institutionNav = [
    { id: 'dashboard', label: 'Institution Dashboard', icon: IconDashboard },
    { id: 'monitoring', label: 'Student Monitoring', icon: IconCheckCircle },
    { id: 'analytics', label: 'Institution Analytics', icon: IconAnalytics },
    { id: 'messages', label: 'Messages', icon: IconFileText },
    { id: 'notifications', label: 'Notifications', icon: IconBell },
  ];

  const companyNav = [
    { id: 'dashboard', label: 'Company Dashboard', icon: IconDashboard },
    { id: 'manage', label: 'Manage Internships', icon: IconBriefcase },
    { id: 'applicants', label: 'Applicants', icon: IconUsers, badge: '4 New' },
    { id: 'progress', label: 'Internship Progress', icon: IconCheckCircle },
    { id: 'messages', label: 'Messages', icon: IconFileText },
    { id: 'notifications', label: 'Notifications', icon: IconBell },
  ];

  const currentNav =
    role === 'institution' ? institutionNav : role === 'company' ? companyNav : studentNav;

  return (
    <aside className={`sidebar-container ${isMobileMenuOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon-wrap">
            <IconBuilding size={20} />
          </div>
          <div className="brand-text">
            <h2>SmartIntern</h2>
            <span className="brand-badge">Module 2 • Portal</span>
          </div>
        </div>
      </div>

      {/* Role Indicator */}
      <div className="sidebar-role-indicator">
        <div className="role-badge-pill">
          <span className="pulse-indicator" />
          <span>{role} workspace</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="sidebar-nav-section" aria-label="Main Navigation">
        <span className="nav-section-label">Navigation</span>
        {currentNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer User Card */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt="Alex Morgan"
            className="sidebar-user-avatar"
          />
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">Alex Morgan</p>
            <p className="sidebar-user-role">Apex Institute • Year 4</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
