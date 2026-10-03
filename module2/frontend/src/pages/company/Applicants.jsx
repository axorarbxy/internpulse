import { useEffect, useState } from 'react';
import { IconSearch, IconUsers } from '../../components/common/Icons';
import companyService from '../../services/companyService';

export default function Applicants() {
  const [applicants, setApplicants] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    companyService.getApplications()
      .then((records) => { if (isActive) setApplicants(records); })
      .catch((requestError) => { if (isActive) setError(requestError.message || 'Unable to load applicants.'); })
      .finally(() => { if (isActive) setLoading(false); });
    return () => { isActive = false; };
  }, []);

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    setError('');
    try {
      await companyService.updateApplicationStatus(id, newStatus);
      setApplicants((previous) => previous.map((applicant) => (
        applicant.id === id ? { ...applicant, status: newStatus } : applicant
      )));
      setSelectedApplicant((previous) => previous?.id === id ? { ...previous, status: newStatus } : previous);
    } catch (requestError) {
      setError(requestError.message || 'Unable to update candidate stage.');
    } finally {
      setUpdatingId(null);
    }
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
    <div className="page-container company-dashboard applicants">
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

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {/* Overview */}
      <div className="profile-card applicant-overview">
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
      <div className="stats-grid applicant-kpi-grid">
        <div className="stat-card applicant-stat-card">
          <span className="stat-label">Total Applicants</span>
          <strong className="stat-value">{applicants.length}</strong>
          <span className="stat-subtitle">Received applications</span>
        </div>

        <div className="stat-card applicant-stat-card">
          <span className="stat-label">New</span>
          <strong className="stat-value">{countByStatus('New')}</strong>
          <span className="stat-subtitle">Awaiting review</span>
        </div>

        <div className="stat-card applicant-stat-card">
          <span className="stat-label">Shortlisted</span>
          <strong className="stat-value">
            {countByStatus('Shortlisted')}
          </strong>
          <span className="stat-subtitle">Selected for next stage</span>
        </div>

        <div className="stat-card applicant-stat-card">
          <span className="stat-label">Interviews</span>
          <strong className="stat-value">
            {countByStatus('Interview')}
          </strong>
          <span className="stat-subtitle">Interview stage</span>
        </div>
      </div>

      {/* Pipeline */}
      <div className="profile-section applicants-section-card">
        <div className="section-title">
          <h3>Candidate Pipeline</h3>
          <p>Current recruitment stage distribution</p>
        </div>

        <div className="applicant-stage-grid" role="group" aria-label="Filter candidates by pipeline stage">
          <button
            type="button"
            className={`applicant-stage-card${statusFilter === 'New' ? ' active' : ''}`}
            aria-pressed={statusFilter === 'New'}
            onClick={() => setStatusFilter('New')}
          >
            New — {countByStatus('New')}
          </button>

          <button
            type="button"
            className={`applicant-stage-card${statusFilter === 'Shortlisted' ? ' active' : ''}`}
            aria-pressed={statusFilter === 'Shortlisted'}
            onClick={() => setStatusFilter('Shortlisted')}
          >
            Shortlisted — {countByStatus('Shortlisted')}
          </button>

          <button
            type="button"
            className={`applicant-stage-card${statusFilter === 'Interview' ? ' active' : ''}`}
            aria-pressed={statusFilter === 'Interview'}
            onClick={() => setStatusFilter('Interview')}
          >
            Interview — {countByStatus('Interview')}
          </button>

          <button
            type="button"
            className={`applicant-stage-card${statusFilter === 'All' ? ' active' : ''}`}
            aria-pressed={statusFilter === 'All'}
            onClick={() => setStatusFilter('All')}
          >
            All Candidates — {applicants.length}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="profile-section applicants-section-card">
        <div className="section-title">
          <h3>Applicant Review</h3>
          <p>Search candidates by name, role or skills</p>
        </div>

        <div className="applicant-filter-row">
          <label className="applicant-search-field">
            <IconSearch size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search candidates"
              aria-label="Search candidates by name, role, or skills"
            />
          </label>

          <div className="applicant-filter-tabs" role="group" aria-label="Filter applicants by status">
            {['All', 'New', 'Shortlisted', 'Interview', 'Active', 'Rejected'].map((status) => (
              <button
                key={status}
                type="button"
                className={`applicant-filter-tab${statusFilter === status ? ' active' : ''}`}
                aria-pressed={statusFilter === status}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Applicant Table */}
        <div className="table-wrapper applicant-table-wrap">
          <table className="data-table applicant-table">
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
              {loading && <tr><td colSpan="7">Loading applicant pipeline...</td></tr>}
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
                      <span className={`applicant-status-badge status-${applicant.status.toLowerCase()}`}>
                        {applicant.status}
                      </span>
                    </td>

                    <td>
                      <div className="button-row">
                        <button
                          type="button"
                          className="applicant-row-button secondary"
                          onClick={() => setSelectedApplicant(applicant)}
                        >
                          Review
                        </button>

                        {applicant.status === 'New' && (
                          <button
                            type="button"
                            className="applicant-row-button primary"
                            onClick={() =>
                              updateStatus(applicant.id, 'Shortlisted')
                            }
                            disabled={updatingId === applicant.id}
                          >
                            Shortlist
                          </button>
                        )}

                        {applicant.status === 'Shortlisted' && (
                          <button
                            type="button"
                            className="applicant-row-button primary"
                            onClick={() =>
                              updateStatus(applicant.id, 'Interview')
                            }
                            disabled={updatingId === applicant.id}
                          >
                            Interview
                          </button>
                        )}

                        {applicant.status === 'Interview' && (
                          <button
                            type="button"
                            className="applicant-row-button primary"
                            onClick={() => updateStatus(applicant.id, 'Active')}
                            disabled={updatingId === applicant.id}
                          >
                            Start Internship
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : !loading && (
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
        <div className="applicant-modal-overlay" onClick={() => setSelectedApplicant(null)}>
          <div className="applicant-modal" role="dialog" aria-modal="true" aria-labelledby="applicant-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 id="applicant-modal-title">{selectedApplicant.name}</h3>
                <p>{selectedApplicant.email}</p>
              </div>

              <button
                type="button"
                className="applicant-row-button secondary"
                onClick={() => setSelectedApplicant(null)}
              >
                Close
              </button>
            </div>

            <div className="review-detail-card">
              <div className="section-title">
                <h3>Application Details</h3>
              </div>

              <div className="applicant-detail-grid">
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

              <div className="applicant-skills-list">
                <span className="detail-label">Skills</span>
                <p>{selectedApplicant.skills}</p>
              </div>
            </div>

            <div className="applicant-modal-actions">
              <button
                type="button"
                className="applicant-row-button primary"
                onClick={() => {
                  updateStatus(selectedApplicant.id, 'Shortlisted');
                }}
                disabled={updatingId === selectedApplicant.id}
              >
                Shortlist Candidate
              </button>

              <button
                type="button"
                className="applicant-row-button secondary"
                onClick={() => updateStatus(selectedApplicant.id, 'Interview')}
                disabled={updatingId === selectedApplicant.id}
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