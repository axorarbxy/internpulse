import { useMemo, useState } from 'react';
import { IconFolderCheck } from '../../components/common/Icons';

const initialInternships = [
  {
    id: 1,
    title: 'Machine Learning Intern',
    company: 'TechNova Solutions',
    location: 'Pune',
    startDate: '01 Jul 2026',
    endDate: '31 Dec 2026',
    status: 'Active',
    progress: 68,
    hours: 326,
    totalHours: 480,
    reports: 8,
    totalReports: 12,
    mentor: 'Rahul Mehta',
  },
  {
    id: 2,
    title: 'Frontend Developer Intern',
    company: 'WebCraft Technologies',
    location: 'Remote',
    startDate: '15 Jun 2026',
    endDate: '15 Oct 2026',
    status: 'Active',
    progress: 82,
    hours: 295,
    totalHours: 360,
    reports: 10,
    totalReports: 12,
    mentor: 'Sneha Joshi',
  },
  {
    id: 3,
    title: 'Data Analytics Intern',
    company: 'DataSphere Analytics',
    location: 'Mumbai',
    startDate: '01 Apr 2026',
    endDate: '30 Jun 2026',
    status: 'Completed',
    progress: 100,
    hours: 480,
    totalHours: 480,
    reports: 12,
    totalReports: 12,
    mentor: 'Amit Shah',
  },
];

export default function MyInternships() {
  const [internships, setInternships] = useState(initialInternships);
  const [filter, setFilter] = useState('All');
  const [selectedInternship, setSelectedInternship] = useState(null);

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

  const averageProgress = Math.round(
    internships.reduce((sum, internship) => sum + internship.progress, 0) /
      internships.length
  );

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

  const handleWithdraw = (id) => {
    setInternships((current) =>
      current.filter((internship) => internship.id !== id)
    );
    setSelectedInternship(null);
  };

  return (
    <div className="page-container my-internships">
      <div className="page-header">
        <h2>My Internships</h2>
        <p>
          Monitor your active internships, weekly reports, timesheets,
          and application statuses.
        </p>
      </div>

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
                  </div>
                </div>

                <div>
                  <strong>{internship.progress}%</strong>
                  <div
                    style={{
                      fontSize: '13px',
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
                    📅 {internship.startDate} - {internship.endDate}
                  </div>
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
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div className="card-body">
              <h2>{selectedInternship.title}</h2>
              <p>{selectedInternship.company}</p>

              <hr />

              <div style={{ lineHeight: '2' }}>
                <div>
                  <strong>Status:</strong>{' '}
                  {selectedInternship.status}
                </div>
                <div>
                  <strong>Location:</strong>{' '}
                  {selectedInternship.location}
                </div>
                <div>
                  <strong>Mentor:</strong>{' '}
                  {selectedInternship.mentor}
                </div>
                <div>
                  <strong>Duration:</strong>{' '}
                  {selectedInternship.startDate} -{' '}
                  {selectedInternship.endDate}
                </div>
                <div>
                  <strong>Progress:</strong>{' '}
                  {selectedInternship.progress}%
                </div>
                <div>
                  <strong>Hours:</strong>{' '}
                  {selectedInternship.hours} /{' '}
                  {selectedInternship.totalHours}
                </div>
                <div>
                  <strong>Reports:</strong>{' '}
                  {selectedInternship.reports} /{' '}
                  {selectedInternship.totalReports}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginTop: '24px',
                }}
              >
                {selectedInternship.status === 'Active' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      handleSubmitReport(selectedInternship)
                    }
                  >
                    Submit Report
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedInternship(null)}
                >
                  Close
                </button>

                {selectedInternship.status === 'Active' && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() =>
                      handleWithdraw(selectedInternship.id)
                    }
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}