import { useEffect, useState } from 'react';
import apiRequest from '../../services/api';

async function loadAdminData() {
  const [registrationResult, grievanceResult, flagResult, healthResult] = await Promise.allSettled([
    apiRequest('/auth/organization-registrations'),
    apiRequest('/intelligence/admin/grievances'),
    apiRequest('/intelligence/fraud/flags?status=pending'),
    apiRequest('/admin/system-health'),
  ]);
  return {
    registrations: registrationResult.status === 'fulfilled' ? registrationResult.value.registrations || [] : [],
    grievances: grievanceResult.status === 'fulfilled' ? grievanceResult.value.grievances || [] : [],
    flags: flagResult.status === 'fulfilled' ? flagResult.value.flags || [] : [],
    services: healthResult.status === 'fulfilled' ? healthResult.value.services || [] : [],
    unavailable: [registrationResult, grievanceResult, flagResult, healthResult].filter((result) => result.status === 'rejected').length,
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [verification, setVerification] = useState(null);

  const refresh = async () => {
    const result = await loadAdminData();
    setData(result);
    setError('');
    if (result.unavailable) setError(`${result.unavailable} review or monitoring source(s) are unavailable.`);
    setLoading(false);
  };

  useEffect(() => {
    let isActive = true;
    loadAdminData().then((result) => {
      if (!isActive) return;
      setData(result);
      if (result.unavailable) setError(`${result.unavailable} review or monitoring source(s) are unavailable.`);
    }).catch((requestError) => {
      if (isActive) setError(requestError.message || 'Unable to load administrator review queues.');
    }).finally(() => {
      if (isActive) setLoading(false);
    });
    return () => { isActive = false; };
  }, []);

  const reviewRegistration = async (registrationId, status) => {
    setBusyKey(`registration-${registrationId}`);
    setError('');
    setNotice('');
    try {
      await apiRequest(`/auth/organization-registrations/${registrationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setNotice(`Organization request ${status.toLowerCase()}.`);
      await refresh();
    } catch (requestError) {
      setError(requestError.message || 'Unable to review organization request.');
    } finally {
      setBusyKey('');
    }
  };

  const updateGrievance = async (grievanceId, status) => {
    setBusyKey(`grievance-${grievanceId}`);
    setError('');
    setNotice('');
    try {
      await apiRequest(`/intelligence/grievances/${encodeURIComponent(grievanceId)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, resolution_note: status === 'resolved' ? 'Reviewed by institution administrator.' : null }),
      });
      setNotice(`Grievance moved to ${status.replace('_', ' ')}.`);
      await refresh();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update grievance.');
    } finally {
      setBusyKey('');
    }
  };

  const resolveFlag = async (flagId, outcome) => {
    setBusyKey(`flag-${flagId}`);
    setError('');
    setNotice('');
    try {
      await apiRequest(`/intelligence/fraud/flags/${encodeURIComponent(flagId)}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({
          outcome,
          resolution_note: `Reviewed by administrator ${outcome === 'cleared' ? 'and cleared' : 'and confirmed'}.`,
        }),
      });
      setNotice(`Fraud review flag ${outcome === 'cleared' ? 'cleared' : 'confirmed'}.`);
      await refresh();
    } catch (requestError) {
      setError(requestError.message || 'Unable to resolve flag.');
    } finally {
      setBusyKey('');
    }
  };

  const lookupDocument = async (event) => {
    event.preventDefault();
    setError('');
    setVerification(null);
    try {
      const response = await apiRequest(`/realtime/document-verifications/${encodeURIComponent(documentId.trim())}`);
      setVerification(response.data || response);
    } catch (requestError) {
      setError(requestError.message || 'Document verification was not found.');
    }
  };

  if (loading) return <div className="loading-container" role="status"><div className="spinner" /><p>Loading administration review queues...</p></div>;

  const registrations = data?.registrations || [];
  const grievances = data?.grievances || [];
  const flags = data?.flags || [];
  const services = data?.services || [];
  const openGrievances = grievances.filter((item) => item.status !== 'resolved').length;
  const offlineServices = services.filter((service) => service.status !== 'online').length;

  return (
    <div className="page-container institution-dashboard admin-dashboard">
      <div className="page-header">
        <h2>Administration Review Center</h2>
        <p>Review organization access, student cases, fraud alerts, and platform health.</p>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {notice && <div className="alert" role="status">{notice}</div>}

      <div className="stats-grid">
        <div className="stat-card"><span className="stat-label">Organization Requests</span><strong className="stat-value">{registrations.length}</strong><span className="stat-subtitle">Awaiting approval</span></div>
        <div className="stat-card"><span className="stat-label">Open Grievances</span><strong className="stat-value">{openGrievances}</strong><span className="stat-subtitle">Requiring human review</span></div>
        <div className="stat-card"><span className="stat-label">Fraud Review Flags</span><strong className="stat-value">{flags.length}</strong><span className="stat-subtitle">Advisory, not automatic decisions</span></div>
        <div className="stat-card"><span className="stat-label">Services Requiring Attention</span><strong className="stat-value">{offlineServices}</strong><span className="stat-subtitle">Health checks not online</span></div>
      </div>

      <section className="profile-section">
        <div className="section-title"><h3>Organization Access Requests</h3><p>New company and institution workspaces remain blocked until reviewed.</p></div>
        <div className="table-wrapper"><table className="data-table"><thead><tr><th>Organization</th><th>Contact</th><th>Type</th><th>Submitted</th><th>Action</th></tr></thead><tbody>
          {registrations.map((item) => <tr key={item.id}><td><strong>{item.organization_name}</strong></td><td>{item.name}<br /><small>{item.email}</small></td><td>{item.requested_role}</td><td>{new Date(item.created_at).toLocaleDateString()}</td><td><button className="primary-button" disabled={busyKey === `registration-${item.id}`} onClick={() => reviewRegistration(item.id, 'APPROVED')}>Approve</button> <button className="secondary-button" disabled={busyKey === `registration-${item.id}`} onClick={() => reviewRegistration(item.id, 'REJECTED')}>Reject</button></td></tr>)}
          {!registrations.length && <tr><td colSpan="5" className="monitoring-table-message">No organization requests awaiting review.</td></tr>}
        </tbody></table></div>
      </section>

      <section className="profile-section">
        <div className="section-title"><h3>Grievances</h3><p>AI triage assists routing; administrators make final decisions.</p></div>
        <div className="table-wrapper"><table className="data-table"><thead><tr><th>Case</th><th>Student</th><th>Category</th><th>Urgency</th><th>Status</th><th>Action</th></tr></thead><tbody>
          {grievances.map((item) => <tr key={item.grievance_id}><td><strong>{item.subject}</strong><small>{item.grievance_id}</small></td><td>{item.student_id}</td><td>{item.category}</td><td>{item.urgency}</td><td>{item.status}</td><td>{item.status === 'open' ? <button className="secondary-button" disabled={busyKey === `grievance-${item.grievance_id}`} onClick={() => updateGrievance(item.grievance_id, 'in_review')}>Review</button> : item.status !== 'resolved' ? <button className="primary-button" disabled={busyKey === `grievance-${item.grievance_id}`} onClick={() => updateGrievance(item.grievance_id, 'resolved')}>Resolve</button> : 'Complete'}</td></tr>)}
          {!grievances.length && <tr><td colSpan="6" className="monitoring-table-message">No grievances recorded.</td></tr>}
        </tbody></table></div>
      </section>

      <section className="profile-section">
        <div className="section-title"><h3>Fraud & Authenticity Review</h3><p>Advisory signals always require human review.</p></div>
        <div className="table-wrapper"><table className="data-table"><thead><tr><th>Flag</th><th>Student</th><th>Subject</th><th>Severity</th><th>Score</th><th>Evidence</th><th>Action</th></tr></thead><tbody>
          {flags.map((flag) => <tr key={flag.flag_id}><td><strong>{flag.flag_type}</strong><small>{flag.flag_id}</small></td><td>{flag.student_id}</td><td>{flag.subject_id}</td><td>{flag.severity}</td><td>{Math.round(flag.score * 100)}%</td><td>{(flag.evidence || []).join('; ')}</td><td><button className="primary-button" disabled={busyKey === `flag-${flag.flag_id}`} onClick={() => resolveFlag(flag.flag_id, 'cleared')}>Clear</button> <button className="secondary-button" disabled={busyKey === `flag-${flag.flag_id}`} onClick={() => resolveFlag(flag.flag_id, 'confirmed')}>Confirm</button></td></tr>)}
          {!flags.length && <tr><td colSpan="7" className="monitoring-table-message">No pending fraud review flags.</td></tr>}
        </tbody></table></div>
      </section>

      <section className="profile-section">
        <div className="section-title"><h3>Service Health</h3><p>Core database and downstream service probes.</p></div>
        <div className="table-wrapper"><table className="data-table"><thead><tr><th>Service</th><th>Status</th><th>Latency</th></tr></thead><tbody>
          {services.map((service) => <tr key={service.name}><td>{service.name}</td><td>{service.status}</td><td>{service.latency_ms === null ? '—' : `${service.latency_ms} ms`}</td></tr>)}
          {!services.length && <tr><td colSpan="3" className="monitoring-table-message">Health data is unavailable.</td></tr>}
        </tbody></table></div>
      </section>

      <section className="profile-section">
        <div className="section-title"><h3>Document Verification Lookup</h3><p>Inspect a verification result received from the document service.</p></div>
        <form className="monitoring-controls" onSubmit={lookupDocument}>
          <label className="monitoring-search"><input value={documentId} onChange={(event) => setDocumentId(event.target.value)} placeholder="Document ID" aria-label="Document ID" required /></label>
          <button className="primary-button" type="submit">Look up document</button>
        </form>
        {verification && <pre className="admin-verification-result">{JSON.stringify(verification, null, 2)}</pre>}
      </section>
    </div>
  );
}
