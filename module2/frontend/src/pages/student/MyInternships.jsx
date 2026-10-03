import { useEffect, useMemo, useState } from 'react';
import { IconFolderCheck } from '../../components/common/Icons';
import apiRequest from '../../services/api';

export default function MyInternships() {
  const [internships, setInternships] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/applications/my')
      .then((response) => {
        const applications = response.applications || [];
        let demoTracking = {};
        try {
          demoTracking = JSON.parse(window.localStorage.getItem('internpulse_demo_progress') || '{}');
        } catch {
          demoTracking = {};
        }
        setInternships(applications.map((application) => {
          const tracking = {
            ...(demoTracking[String(application.internship_id)] || {}),
            ...(application.demo_tracking || {}),
          };
          return {
            ...application,
            title: application.title || 'Internship',
            company: application.company_name || 'Company',
            location: application.location || 'Location not specified',
            status: application.status === 'ONGOING' ? 'Active' : application.status,
            ...tracking,
            hasDemoTracking: Boolean(tracking.demo),
            progress: tracking.progress ?? (application.status === 'COMPLETED' ? 100 : 0),
            hours: tracking.hours ?? 0,
            totalHours: tracking.totalHours ?? 0,
            reports: tracking.reports ?? 0,
            totalReports: tracking.totalReports ?? 0,
            mentor: tracking.mentor || 'Not assigned',
            startDate: application.start_date ? new Date(application.start_date).toLocaleDateString() : (application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'Not started'),
            endDate: application.end_date ? new Date(application.end_date).toLocaleDateString() : 'Not specified',
            duration: application.duration_months ? `${application.duration_months} months` : 'Not specified',
            stipend: application.stipend ? `₹${Number(application.stipend).toLocaleString('en-IN')} / month` : 'Not specified',
          };
        }));
      })
      .catch((requestError) => setError(requestError.message || 'Unable to load applications.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedInternship) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedInternship(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedInternship]);

  const filteredInternships = useMemo(() => {
    if (filter === 'All') return internships;

    return internships.filter(
      (internship) => internship.status === filter
    );
  }, [internships, filter]);

  const activeCount = internships.filter(
    (internship) => internship.status === 'Active'
  ).length;

  const completedCount = internships.filter(
    (internship) => internship.status === 'Completed'
  ).length;

  const averageProgress = internships.length
    ? Math.round(internships.reduce((sum, internship) => sum + internship.progress, 0) / internships.length)
    : 0;

  const totalHours = internships.reduce(
    (sum, internship) => sum + internship.hours,
    0
  );

  const handleSubmitReport = (internship) => {
    alert(
      `Weekly report submission opened for ${internship.title}.`
    );
  };

  const handleTimesheet = (internship) => {
    alert(
      `Timesheet opened for ${internship.title}.`
    );
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading your applications...</p></div>;
  }

  return (
    <div className="page-container my-internships">
      <div className="page-header">
        <h2>My Internships</h2>
        <p>
          Monitor your active internships, weekly reports, timesheets,
          and application statuses.
        </p>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="card">
          <div className="card-body">
            <div className="stat-label">Active Internships</div>
            <div className="stat-value">{activeCount}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{completedCount}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="stat-label">Average Progress</div>
            <div className="stat-value">{averageProgress}%</div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="stat-label">Total Hours</div>
            <div className="stat-value">{totalHours}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          padding: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          {['All', 'Active', 'Completed'].map((item) => (
            <button
              key={item}
              type="button"
              className={
                filter === item
                  ? 'btn btn-primary'
                  : 'btn btn-secondary'
              }
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Internship Cards */}
      <div
        style={{
          display: 'grid',
          gap: '20px',
        }}
      >
        {filteredInternships.map((internship) => (
          <div className="card" key={internship.id}>
            <div className="card-body">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div className="placeholder-icon-wrap">
                    <IconFolderCheck size={26} />
                  </div>

                  <div>
                    <h3>{internship.title}</h3>
                    <p style={{ marginBottom: '6px' }}>
                      {internship.company}
                    </p>
                    <span className="badge">
                      {internship.status}
                    </span>
                    {internship.hasDemoTracking && <small className="student-demo-tracking-label">Demo tracking data</small>}
                  </div>
                </div>

                <div>
                  <strong>{internship.progress}%</strong>
                  <div
                    style={{
                      fontSize: '14.3px',
                      marginTop: '4px',
                    }}
                  >
                    Overall Progress
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginTop: '20px' }}>
                <div
                  style={{
                    height: '8px',
                    background: 'var(--border-color, #e5e7eb)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${internship.progress}%`,
                      height: '100%',
                      background: 'currentColor',
                      borderRadius: '10px',
                    }}
                  />
                </div>
              </div>

              {/* Details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '14px',
                  marginTop: '20px',
                }}
              >
                <div>
                  <small>Location</small>
                  <div>📍 {internship.location}</div>
                </div>

                <div>
                  <small>Duration</small>
                  <div>
                    📅 {internship.duration} · {internship.startDate} - {internship.endDate}
                  </div>
                </div>

                <div>
                  <small>Stipend</small>
                  <div>💰 {internship.stipend}</div>
                </div>

                <div>
                  <small>Mentor</small>
                  <div>👤 {internship.mentor}</div>
                </div>

                <div>
                  <small>Hours</small>
                  <div>
                    ⏱️ {internship.hours} / {internship.totalHours}
                  </div>
                </div>

                <div>
                  <small>Weekly Reports</small>
                  <div>
                    📝 {internship.reports} / {internship.totalReports}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginTop: '20px',
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    setSelectedInternship(internship)
                  }
                >
                  View Details
                </button>

                {internship.status === 'Active' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() =>
                        handleSubmitReport(internship)
                      }
                    >
                      Submit Weekly Report
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() =>
                        handleTimesheet(internship)
                      }
                    >
                      View Timesheet
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredInternships.length === 0 && (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '40px',
            }}
          >
            <IconFolderCheck size={40} />
            <h3>No internships found</h3>
            <p>There are no internships in this category.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedInternship && (
        <div
          className="internship-details-overlay"
          onClick={() => setSelectedInternship(null)}
        >
          <div
            className="internship-details-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="internship-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="internship-details-header">
              <div>
                <h2 id="internship-details-title">{selectedInternship.title}</h2>
                <p>{selectedInternship.company}</p>
              </div>
              <button type="button" onClick={() => setSelectedInternship(null)}>Close</button>
            </header>

            <div className="internship-details-fields">
              <div><strong>Status</strong><span>{selectedInternship.status}</span></div>
              <div><strong>Location</strong><span>{selectedInternship.location}</span></div>
              <div><strong>Mentor</strong><span>{selectedInternship.mentor}</span></div>
              <div><strong>Duration</strong><span>{selectedInternship.startDate} - {selectedInternship.endDate}</span></div>
              <div><strong>Progress</strong><span>{selectedInternship.progress}%</span></div>
              <div><strong>Hours</strong><span>{selectedInternship.hours} / {selectedInternship.totalHours}</span></div>
              <div><strong>Reports</strong><span>{selectedInternship.reports} / {selectedInternship.totalReports}</span></div>
            </div>

            {selectedInternship.status === 'Active' && (
              <footer className="internship-details-actions">
                <button type="button" className="btn btn-primary" onClick={() => handleSubmitReport(selectedInternship)}>
                  Submit Report
                </button>
              </footer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}