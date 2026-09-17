import { useState } from 'react';
import { apiRequest, setAuthToken } from '../services/api';

export default function AuthPage({ onAuthenticated }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setAuthToken(response.token);
      window.localStorage.setItem('internpulse_user', JSON.stringify(response.user));
      if (response.user.role === 'STUDENT') {
        window.localStorage.setItem('internpulse_student_id', String(response.user.id));
      }
      onAuthenticated(response.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">InternPulse</p>
        <h1>Sign in to your workspace</h1>
        <p className="auth-subtitle">Use your platform account to access internships, applications, and intelligence tools.</p>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
