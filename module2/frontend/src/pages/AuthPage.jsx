import { useState } from 'react';
import { apiRequest, setAuthToken } from '../services/api';

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSuccess = (response) => {
    setAuthToken(response.token);
    window.localStorage.setItem('internpulse_user', JSON.stringify(response.user));
    if (response.user.role === 'STUDENT') {
      window.localStorage.setItem('internpulse_student_id', String(response.user.id));
    }
    onAuthenticated(response.user);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const response = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        handleAuthSuccess(response);
      } else {
        const response = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
          }),
        });
        handleAuthSuccess(response);
      }
    } catch (requestError) {
      setError(requestError.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      });
      handleAuthSuccess(response);
    } catch (requestError) {
      setError(requestError.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">InternPulse</p>
        <h1>{mode === 'login' ? 'Sign in to your workspace' : 'Create an account'}</h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Use your platform account to access internships, applications, and intelligence tools.'
            : 'Join InternPulse as a student, company, or educational institution.'}
        </p>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <button
            type="button"
            className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {mode === 'register' && (
          <label>
            Full Name
            <input
              type="text"
              placeholder="e.g. Bhakti Kadam"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            placeholder="e.g. student@internpulse.com"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>

        {mode === 'register' && (
          <label>
            Account Role
            <select
              style={{
                width: '100%',
                padding: '11px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-page)',
                color: 'var(--text-main)',
              }}
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
            >
              <option value="STUDENT">Student</option>
              <option value="COMPANY">Company / Employer</option>
              <option value="INSTITUTION">Educational Institution</option>
            </select>
          </label>
        )}

        {error && (
          <p className="auth-error" style={{ color: 'var(--color-danger)', fontWeight: 600 }} role="alert">
            {error}
          </p>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign in' : 'Create Account')}
        </button>

        {/* Demo Fast Login Pills */}
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border-color)' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quick Demo Sign-In (1-Click):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '6px 4px', fontSize: '11px', textAlign: 'center' }}
              onClick={() => handleDemoLogin('student@internpulse.com', '123456')}
            >
              🎓 Student
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '6px 4px', fontSize: '11px', textAlign: 'center' }}
              onClick={() => handleDemoLogin('company@technova.com', '123456')}
            >
              🏢 Company
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '6px 4px', fontSize: '11px', textAlign: 'center' }}
              onClick={() => handleDemoLogin('institution@apex.edu', '123456')}
            >
              🏫 Institution
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
