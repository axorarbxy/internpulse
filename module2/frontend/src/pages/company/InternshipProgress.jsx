import { useEffect, useState } from 'react';
import { IconCheckCircle } from '../../components/common/Icons';
import companyService from '../../services/companyService';

export default function InternshipProgress() {
  const [interns, setInterns] = useState([]);
  const [completedInterns, setCompletedInterns] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [issuingCertificateId, setIssuingCertificateId] = useState('');

  useEffect(() => {
    let isActive = true;
    companyService.getApplications().then((applications) => {
      if (!isActive) return;
      const mapIntern = (application) => {
        const tracking = application.progressData || {};
        const progress = Number(tracking.progress || 0);
        const tasks = Number(tracking.tasks || 18);
        return {
          id: application.id,
          name: application.name,
          role: application.title,
          mentor: tracking.mentor || 'Mentor to be assigned',
          startDate: application.start_date
            ? new Date(application.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Not specified',
          progress,
          hours: Number(tracking.hours || 0),
          tasks,
          completedTasks: Number(tracking.completedTasks ?? Math.round((progress / 100) * tasks)),
          evaluation: tracking.evaluation || (progress < 50 ? 'Needs Review' : 'Good'),
          status: tracking.status || (progress < 50 ? 'Attention' : 'On Track'),
          applicationStatus: application.status,
          certificateId: tracking.certificateId || '',
        };
      };
      setInterns(applications.filter((application) => application.status === 'Active').map(mapIntern));
      setCompletedInterns(applications.filter((application) => application.status === 'Completed').map(mapIntern));
    }).catch((requestError) => {
      if (isActive) setError(requestError.message || 'Unable to load intern progress.');
    }).finally(() => {
      if (isActive) setLoading(false);
    });
    return () => { isActive = false; };
  }, []);

  const filteredInterns =
    statusFilter === 'All'
      ? interns
      : interns.filter((intern) => intern.status === statusFilter);

  const updateEvaluation = async (id, evaluation) => {
    setError('');
    try {
      await companyService.updateProgress(id, { evaluation });
      setInterns((previous) => previous.map((intern) => (
        intern.id === id ? { ...intern, evaluation } : intern
      )));
      setSelectedIntern((previous) => previous?.id === id ? { ...previous, evaluation } : previous);
      setNotice(`Evaluation saved as ${evaluation}.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to save evaluation.');
    }
  };

  const approveNextTask = async (intern) => {
    const completedTasks = Math.min(intern.tasks, intern.completedTasks + 1);
    setError('');
    try {
      await companyService.updateProgress(intern.id, { completedTasks });
      const updated = { ...intern, completedTasks };
      setInterns((previous) => previous.map((item) => item.id === intern.id ? updated : item));
      setSelectedIntern(updated);
      setNotice(`Weekly task approved for ${intern.name}.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to approve weekly task.');
    }
  };

  const completeInternship = async (intern) => {
    setError('');
    try {
      await companyService.updateApplicationStatus(intern.id, 'Completed');
      const completed = { ...intern, applicationStatus: 'Completed' };
      setInterns((previous) => previous.filter((item) => item.id !== intern.id));
      setCompletedInterns((previous) => [completed, ...previous.filter((item) => item.id !== intern.id)]);
      setSelectedIntern(null);
      setNotice(`Internship marked complete for ${intern.name}.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to complete this internship.');
    }
  };

  const issueCertificate = async (intern) => {
    setIssuingCertificateId(intern.id);
    setError('');
    setNotice('');
    try {
      const response = await companyService.issueCertificate(intern.id);
      const certificate = response.data || response.certificate || response;
      setCompletedInterns((previous) => previous.map((item) => (
        item.id === intern.id ? { ...item, certificateId: certificate.certificateId } : item
      )));
      setNotice(`Signed certificate ${certificate.certificateId} is ready for ${intern.name}.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to issue signed certificate.');
    } finally {
      setIssuingCertificateId('');
    }
  };

  const onTrackCount = interns.filter(
    (intern) => intern.status === 'On Track'
  ).length;

  const attentionCount = interns.filter(
    (intern) => intern.status === 'Attention'
  ).length;

  const averageProgress =
    interns.length > 0
      ? Math.round(
          interns.reduce((total, intern) => total + intern.progress, 0) /
            interns.length
        )
      : 0;

  const totalHours = interns.reduce(
    (total, intern) => total + intern.hours,
    0
  );

  return (
    <div className="page-container company-dashboard internship-progress">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Internship Progress & Evaluations</h2>
          <p>
            Track active student intern cohorts, sprint tasks, and supervisor
            evaluations.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {notice && <div className="alert" role="status">{notice}</div>}

      {/* Overview */}
      <div className="profile-card intern-progress-overview">
        <div className="profile-avatar">
          <IconCheckCircle size={34} />
        </div>

        <div className="profile-heading">
          <h3>Company Intern Monitoring & Evaluation</h3>
          <p>
            Monitor intern progress, review tasks and record supervisor
            evaluations.
          </p>
          <span className="profile-status">Intern Monitoring Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid intern-progress-kpis">
        <div className="stat-card">
          <span className="stat-label">Active Interns</span>
          <strong className="stat-value">{interns.length}</strong>
          <span className="stat-subtitle">Currently working</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Average Progress</span>
          <strong className="stat-value">{averageProgress}%</strong>
          <span className="stat-subtitle">Across active interns</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">On Track</span>
          <strong className="stat-value">{onTrackCount}</strong>
          <span className="stat-subtitle">Progressing normally</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Hours</span>
          <strong className="stat-value">{totalHours}</strong>
          <span className="stat-subtitle">Logged internship hours</span>
        </div>
      </div>

      {/* Monitoring Alerts */}
      {attentionCount > 0 && (
        <div className="profile-section intern-progress-section">
          <div className="section-title">
            <h3>Monitoring Alerts</h3>
            <p>Interns requiring additional attention</p>
          </div>

          <div className="activity-list">
            {interns
              .filter((intern) => intern.status === 'Attention')
              .map((intern) => (
                <div className="activity-item intern-alert-item" key={intern.id}>
                  <div className="activity-dot" />

                  <div>
                    <strong>{intern.name}</strong>
                    <p>
                      Progress is {intern.progress}%. Supervisor review is
                      recommended.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="intern-review-button"
                    onClick={() => setSelectedIntern(intern)}
                  >
                    Review
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="profile-section intern-progress-section">
        <div className="section-title">
          <h3>Intern Monitoring</h3>
          <p>Track progress and evaluation status for active interns</p>
        </div>

        <div className="intern-status-filters" role="group" aria-label="Filter interns by status">
          {['All', 'On Track', 'Attention'].map((status) => (
            <button
              key={status}
              type="button"
              className={`intern-status-filter${statusFilter === status ? ' active' : ''}`}
              aria-pressed={statusFilter === status}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Intern Table */}
        <div className="table-wrapper intern-progress-table-wrap">
          <table className="data-table intern-progress-table">
            <thead>
              <tr>
                <th>Intern</th>
                <th>Role</th>
                <th>Mentor</th>
                <th>Progress</th>
                <th>Hours</th>
                <th>Tasks</th>
                <th>Evaluation</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && <tr><td colSpan="9">Loading active interns...</td></tr>}
              {filteredInterns.map((intern) => (
                <tr key={intern.id}>
                  <td>
                    <strong>{intern.name}</strong>
                    <br />
                    <small>{intern.startDate}</small>
                  </td>

                  <td>{intern.role}</td>

                  <td>{intern.mentor}</td>

                  <td>
                    <div className="intern-progress-cell">
                      <div className="intern-progress-track" aria-label={`${intern.progress}% complete`}>
                        <span style={{ width: `${intern.progress}%` }} />
                      </div>
                      <strong>{intern.progress}%</strong>
                    </div>
                  </td>

                  <td>{intern.hours}</td>

                  <td>
                    {intern.completedTasks}/{intern.tasks}
                  </td>

                  <td>
                    <span className={`intern-evaluation-badge evaluation-${intern.evaluation.toLowerCase().replaceAll(' ', '-')}`}>
                      {intern.evaluation}
                    </span>
                  </td>

                  <td>
                    <span className={`intern-status-badge status-${intern.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {intern.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="intern-review-button"
                      onClick={() => setSelectedIntern(intern)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredInterns.length === 0 && (
                <tr>
                  <td colSpan="9" className="intern-empty-cell">No interns match this status.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="profile-section intern-progress-section">
        <div className="section-title">
          <h3>Completed Internships</h3>
          <p>Issue a signed certificate after the application is marked complete.</p>
        </div>
        <div className="activity-list">
          {completedInterns.map((intern) => (
            <div className="activity-item" key={intern.id}>
              <div className="activity-dot" />
              <div>
                <strong>{intern.name}</strong>
                <p>{intern.role}</p>
                {intern.certificateId && (
                  <a href={`/#/verify/${encodeURIComponent(intern.certificateId)}`} target="_blank" rel="noreferrer">
                    Verify {intern.certificateId}
                  </a>
                )}
              </div>
              <button
                type="button"
                className="intern-action-button primary"
                onClick={() => issueCertificate(intern)}
                disabled={issuingCertificateId === intern.id}
              >
                {issuingCertificateId === intern.id ? 'Issuing...' : intern.certificateId ? 'Reopen Certificate' : 'Issue Signed Certificate'}
              </button>
            </div>
          ))}
          {!completedInterns.length && <p className="monitoring-table-message">No completed internships yet.</p>}
        </div>
      </div>

      {/* Evaluation Summary */}
      <div className="profile-section intern-progress-section">
        <div className="section-title">
          <h3>Evaluation Summary</h3>
          <p>Current supervisor assessment distribution</p>
        </div>

        <div className="stats-grid evaluation-summary-grid">
          <div className="stat-card">
            <span className="stat-label">Excellent</span>
            <strong className="stat-value">
              {interns.filter((i) => i.evaluation === 'Excellent').length}
            </strong>
            <span className="stat-subtitle">
              Strong performance
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Good</span>
            <strong className="stat-value">
              {interns.filter((i) => i.evaluation === 'Good').length}
            </strong>
            <span className="stat-subtitle">
              Meeting expectations
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Needs Review</span>
            <strong className="stat-value">
              {
                interns.filter(
                  (i) => i.evaluation === 'Needs Review'
                ).length
              }
            </strong>
            <span className="stat-subtitle">
              Additional feedback required
            </span>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedIntern && (
        <div className="intern-review-overlay" onClick={() => setSelectedIntern(null)}>
          <div className="intern-review-modal" role="dialog" aria-modal="true" aria-labelledby="intern-review-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 id="intern-review-title">{selectedIntern.name}</h3>
                <p>{selectedIntern.role}</p>
              </div>

              <button
                type="button"
                className="intern-review-button"
                onClick={() => setSelectedIntern(null)}
              >
                Close
              </button>
            </div>

            <div className="intern-review-detail-card">
              <div className="section-title">
                <h3>Internship Details</h3>
              </div>

              <div className="intern-detail-grid">
                <div>
                  <span className="detail-label">Mentor</span>
                  <strong>{selectedIntern.mentor}</strong>
                </div>

                <div>
                  <span className="detail-label">Start Date</span>
                  <strong>{selectedIntern.startDate}</strong>
                </div>

                <div>
                  <span className="detail-label">Progress</span>
                  <strong>{selectedIntern.progress}%</strong>
                </div>

                <div>
                  <span className="detail-label">Hours Logged</span>
                  <strong>{selectedIntern.hours}</strong>
                </div>

                <div>
                  <span className="detail-label">Tasks Completed</span>
                  <strong>
                    {selectedIntern.completedTasks}/
                    {selectedIntern.tasks}
                  </strong>
                </div>

                <div>
                  <span className="detail-label">Current Status</span>
                  <strong>{selectedIntern.status}</strong>
                </div>
              </div>
            </div>

            <div className="intern-review-detail-card">
              <div className="section-title">
                <h3>Supervisor Evaluation</h3>
                <p>Update the intern's current evaluation</p>
              </div>

              <div className="intern-evaluation-options" role="group" aria-label="Supervisor evaluation">
                {['Excellent', 'Good', 'Needs Review'].map(
                  (evaluation) => (
                    <button
                      key={evaluation}
                      type="button"
                      className={`intern-evaluation-option${selectedIntern.evaluation === evaluation ? ' active' : ''}`}
                      aria-pressed={selectedIntern.evaluation === evaluation}
                      onClick={() => {
                        updateEvaluation(selectedIntern.id, evaluation);
                      }}
                    >
                      {evaluation}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="intern-review-actions">
              <button
                type="button"
                className="intern-action-button primary"
                onClick={() => approveNextTask(selectedIntern)}
                disabled={selectedIntern.completedTasks >= selectedIntern.tasks}
              >
                Approve Weekly Tasks
              </button>

              <button
                type="button"
                className="intern-action-button secondary"
                onClick={() => completeInternship(selectedIntern)}
              >
                Mark Internship Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}