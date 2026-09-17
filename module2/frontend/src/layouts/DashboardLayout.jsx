import { useNavigation } from '../context';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

export default function DashboardLayout({ children }) {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useNavigation();

  return (
    <div className="app-shell">
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Responsive Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Navbar />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
