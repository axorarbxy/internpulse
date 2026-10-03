import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import NotificationsPage from './pages/Notifications';
import MessagesPage from './pages/Messages';
import CertificatesPage from './pages/Certificates';

const getCurrentUserId = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('internpulse_user') || '{}');
    return storedUser.id || 'demo-user';
  } catch {
    return 'demo-user';
  }
};

export default function App() {
  const token = localStorage.getItem('authToken') || '';
  const currentUserId = getCurrentUserId();

  return (
    <SocketProvider token={token}>
      <BrowserRouter>
        <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f5f7fb', color: '#1f2937' }}>
          <nav style={{ display: 'flex', gap: '1rem', padding: '1rem 1.5rem', background: '#111827', color: '#fff' }}>
            <NavLink to="/" style={({ isActive }) => ({ color: isActive ? '#93c5fd' : '#fff', textDecoration: 'none', fontWeight: 600 })}>
              Notifications
            </NavLink>
            <NavLink to="/messages" style={({ isActive }) => ({ color: isActive ? '#93c5fd' : '#fff', textDecoration: 'none', fontWeight: 600 })}>
              Messages
            </NavLink>
            <NavLink to="/certificates" style={({ isActive }) => ({ color: isActive ? '#93c5fd' : '#fff', textDecoration: 'none', fontWeight: 600 })}>
              Certificates
            </NavLink>
          </nav>

          <main style={{ padding: '2rem 1.5rem' }}>
            <Routes>
              <Route path="/" element={<NotificationsPage />} />
              <Route path="/messages" element={<MessagesPage currentUserId={currentUserId} />} />
              <Route path="/messages/:conversationId" element={<MessagesPage currentUserId={currentUserId} />} />
              <Route path="/certificates" element={<CertificatesPage certificates={[]} />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </SocketProvider>
  );
}
