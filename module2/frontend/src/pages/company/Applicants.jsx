import { useState } from 'react';
import { IconUsers } from '../../components/common/Icons';

const initialApplicants = [
  {
    id: 1,
    name: 'Aarav Patil',
    email: 'aarav.patil@example.com',
    role: 'Machine Learning Intern',
    skills: 'Python, Machine Learning, TensorFlow',
    match: 94,
    applied: '12 Sep 2026',
    status: 'Shortlisted',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    role: 'Frontend Developer Intern',
    skills: 'React, JavaScript, CSS',
    match: 89,
    applied: '11 Sep 2026',
    status: 'Interview',
  },
  {
    id: 3,
    name: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@example.com',
    role: 'Data Analytics Intern',
    skills: 'Python, SQL, Power BI',
    match: 86,
    applied: '10 Sep 2026',
    status: 'New',
  },
  {
    id: 4,
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@example.com',
    role: 'AI Research Intern',
    skills: 'Python, NLP, Deep Learning',
    match: 91,
    applied: '09 Sep 2026',
    status: 'Shortlisted',
  },
  {
    id: 5,
    name: 'Aditya Joshi',
    email: 'aditya.joshi@example.com',
    role: 'Backend Developer Intern',
    skills: 'Java, Spring Boot, PostgreSQL',
    match: 82,
    applied: '08 Sep 2026',
    status: 'New',
  },
];

export default function Applicants() {
  const [applicants, setApplicants] = useState(initialApplicants);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const updateStatus = (id, newStatus) => {
    setApplicants(
      applicants.map((applicant) =>
        applicant.id === id
          ? { ...applicant, status: newStatus }
          : applicant
      )
    );

    alert(`Candidate moved to ${newStatus}.`);
  };

  const filteredApplicants = applicants.filter((applicant) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      applicant.name.toLowerCase().includes(searchText) ||
      applicant.role.toLowerCase().includes(searchText) ||
      applicant.skills.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === 'All' || applicant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const countByStatus = (status) =>
    applicants.filter((applicant) => applicant.status === status).length;

  return (
    <div className="page-container applicants">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Applicants & Candidate Pipeline</h2>
          <p>
            Review incoming student applications, match scores, and interview
            stages.
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="profile-card">
        <div className="profile-avatar">
          <IconUsers size={34} />
        </div>

        <div className="profile-heading">
          <h3>Candidate Pipeline & Review</h3>
          <p>
            Search candidates, review profiles and move applicants through the
            hiring pipeline.
          </p>
          <span className="profile-status">Recruitment Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Applicants</span>
          <strong className="stat-value">{applicants.length}</strong>
          <span className="stat-subtitle">Received applications</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">New</span>
          <strong className="stat-value">{countByStatus('New')}</strong>
          <span className="stat-subtitle">Awaiting review</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Shortlisted</span>
          <strong className="stat-value">
            {countByStatus('Shortlisted')}
          </strong>
          <span className="stat-subtitle">Selected for next stage</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Interviews</span>
          <strong className="stat-value">
            {countByStatus('Interview')}
          </strong>
          <span className="stat-subtitle">Interview stage</span>
        </div>
      </div>

      {/* Pipeline */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Candidate Pipeline</h3>
          <p>Current recruitment stage distribution</p>
        </div>

        <div className="action-grid">
          <button
            className="secondary-button"
            onClick={() => setStatusFilter('New')}
          >
            New — {countByStatus('New')}
          </button>

          <button
            className="secondary-button"
            onClick={() => setStatusFilter('Shortlisted')}
          >
            Shortlisted — {countByStatus('Shortlisted')}
          </button>

          <button
            className="secondary-button"
            onClick={() => setStatusFilter('Interview')}
          >
            Interview — {countByStatus('Interview')}
          </button>

          <button
            className="secondary-button"
            onClick={() => setStatusFilter('All')}
          >
            All Candidates — {applicants.length}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Applicant Review</h3>
          <p>Search candidates by name, role or skills</p>
        </div>

        <div className="filter-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search candidates..."
          />

          {['All', 'New', 'Shortlisted', 'Interview'].map((status) => (
            <button
              key={status}
              className={
                statusFilter === status
                  ? 'primary-button'
                  : 'secondary-button'
              }
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Applicant Table */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Applied Role</th>
                <th>Skills</th>
                <th>Match</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((applicant) => (
                  <tr key={applicant.id}>
                    <td>
                      <strong>{applicant.name}</strong>
                      <br />
                      <small>{applicant.email}</small>
                    </td>

                    <td>{applicant.role}</td>

                    <td>{applicant.skills}</td>

                    <td>
                      <strong>{applicant.match}%</strong>
                    </td>

                    <td>{applicant.applied}</td>

                    <td>
                      <span className="status-badge">
                        {applicant.status}
                      </span>
                    </td>

                    <td>
                      <div className="button-row">
                        <button
                          className="secondary-button"
                          onClick={() => setSelectedApplicant(applicant)}
                        >
                          Review
                        </button>

                        {applicant.status === 'New' && (
                          <button
                            className="primary-button"
                            onClick={() =>
                              updateStatus(applicant.id, 'Shortlisted')
                            }
                          >
                            Shortlist
                          </button>
                        )}

                        {applicant.status === 'Shortlisted' && (
                          <button
                            className="primary-button"
                            onClick={() =>
                              updateStatus(applicant.id, 'Interview')
                            }
                          >
                            Interview
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    No applicants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Review Modal */}
      {selectedApplicant && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3>{selectedApplicant.name}</h3>
                <p>{selectedApplicant.email}</p>
              </div>

              <button
                className="secondary-button"
                onClick={() => setSelectedApplicant(null)}
              >
                Close
              </button>
            </div>

            <div className="profile-section">
              <div className="section-title">
                <h3>Application Details</h3>
              </div>

              <div className="detail-grid">
                <div>
                  <span className="detail-label">Applied Role</span>
                  <strong>{selectedApplicant.role}</strong>
                </div>

                <div>
                  <span className="detail-label">Match Score</span>
                  <strong>{selectedApplicant.match}%</strong>
                </div>

                <div>
                  <span className="detail-label">Applied Date</span>
                  <strong>{selectedApplicant.applied}</strong>
                </div>

                <div>
                  <span className="detail-label">Current Status</span>
                  <strong>{selectedApplicant.status}</strong>
                </div>
              </div>

              <div className="skills-list">
                <span className="detail-label">Skills</span>
                <p>{selectedApplicant.skills}</p>
              </div>
            </div>

            <div className="button-row">
              <button
                className="primary-button"
                onClick={() => {
                  updateStatus(selectedApplicant.id, 'Shortlisted');
                  setSelectedApplicant(null);
                }}
              >
                Shortlist Candidate
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  alert('Interview scheduling opened.')
                }
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}