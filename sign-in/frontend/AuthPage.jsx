import { useState } from 'react';
import { apiRequest, setAuthToken } from '../../module2/frontend/src/services/api';

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSuccess = (response) => {
    setAuthToken(response.token);
    window.localStorage.setItem('internpulse_user', JSON.stringify(response.user));
    if (response.user.role === 'STUDENT') {
      window.localStorage.setItem('internpulse_student_id', String(response.user.id));
    }
    onAuthenticated(response.user);
  };

  const login = async (email = form.email, password = form.password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    handleAuthSuccess(response);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      if (mode === 'login') {
        await login();
      } else {
        const response = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        if (response.token) handleAuthSuccess(response);
        else {
          setNotice(response.message || 'Registration submitted for review.');
          setMode('login');
        }
      }
    } catch (requestError) {
      setError(requestError.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (email) => {
    setLoading(true);
    setError('');
    try {
      await login(email, '123456');
    } catch (requestError) {
      setError(requestError.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (event) => {
    setNotice('');
    setForm({ ...form, [event.target.name]: event.target.value });
  };
  const isCompany = form.role === 'COMPANY';
  const isInstitution = form.role === 'INSTITUTION';

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">InternPulse</p>
        <h1>{mode === 'login' ? 'Sign in to your workspace' : 'Create an account'}</h1>
        <p className="auth-subtitle">{mode === 'login' ? 'Use your platform account to access internships, applications, and intelligence tools.' : 'Create a student account or submit an organization workspace request for administrator approval.'}</p>

        <div className="auth-mode-tabs">
          <button type="button" className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
          <button type="button" className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setMode('register'); setError(''); }}>Register</button>
        </div>

        {mode === 'register' && <label>Full Name<input name="name" placeholder="e.g. Bhakti Kadam" value={form.name} onChange={updateField} required /></label>}
        {mode === 'register' && (
          <label htmlFor="registration-role">Workspace type
            <select id="registration-role" name="role" value={form.role} onChange={updateField}>
              <option value="STUDENT">Student</option>
              <option value="COMPANY">Company</option>
              <option value="INSTITUTION">Institution</option>
            </select>
          </label>
        )}
        {mode === 'register' && isCompany && <>
          <label>Company name<input name="company_name" placeholder="Organization name" value={form.company_name || ''} onChange={updateField} required /></label>
          <label>Industry<input name="industry" placeholder="Industry" value={form.industry || ''} onChange={updateField} /></label>
          <label>Location<input name="location" placeholder="City or remote" value={form.location || ''} onChange={updateField} /></label>
          <label>Website<input name="website" type="url" placeholder="https://example.com" value={form.website || ''} onChange={updateField} /></label>
        </>}
        {mode === 'register' && isInstitution && <>
          <label>Institution name<input name="institution_name" placeholder="Institution name" value={form.institution_name || ''} onChange={updateField} required /></label>
          <label>Address<input name="address" placeholder="Campus address" value={form.address || ''} onChange={updateField} /></label>
          <label>Contact number<input name="contact_number" type="tel" placeholder="Contact number" value={form.contact_number || ''} onChange={updateField} /></label>
        </>}
        <label>Email<input name="email" type="email" placeholder="e.g. student@internpulse.com" value={form.email} onChange={updateField} required /></label>
        <label>Password<input name="password" type="password" placeholder="At least 6 characters" value={form.password} onChange={updateField} required /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {notice && <p className="auth-notice" role="status">{notice}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create Account'}</button>

        <div className="auth-demo-login">
          <p>Quick Demo Sign-In</p>
          <div><button type="button" className="btn btn-secondary" onClick={() => handleDemoLogin('student@internpulse.com')}>Student</button><button type="button" className="btn btn-secondary" onClick={() => handleDemoLogin('company@technova.com')}>Company</button><button type="button" className="btn btn-secondary" onClick={() => handleDemoLogin('institution@apex.edu')}>Institution</button><button type="button" className="btn btn-secondary" onClick={() => handleDemoLogin('admin@internpulse.com')}>Admin</button></div>
        </div>
      </form>
    </main>
  );
}