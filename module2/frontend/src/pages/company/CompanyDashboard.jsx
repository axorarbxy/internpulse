import { useEffect, useMemo, useState } from 'react';
import {
  IconBriefcase,
  IconUsers,
  IconCheckCircle,
  IconClock,
  IconCalendar,
  IconArrowRight,
} from '../../components/common/Icons';
import { useNavigation } from '../../context';
import companyService from '../../services/companyService';

export default function CompanyDashboard() {
  const { setActiveTab } = useNavigation();
  const [candidateFilter, setCandidateFilter] = useState('All');
  const [postings, setPostings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [companyName, setCompanyName] = useState('TechNova Solutions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    Promise.all([
      companyService.getProfile(),
      companyService.getInternships(),
      companyService.getApplications(),
    ]).then(([profile, internships, applications]) => {
      if (!isActive) return;
      setCompanyName(profile?.company_name || 'Company Workspace');
      setPostings(internships);
      setCandidates(applications);
    }).catch((requestError) => {
      if (isActive) setError(requestError.message || 'Unable to load company dashboard.');
    }).finally(() => {
      if (isActive) setLoading(false);
    });

    return () => { isActive = false; };
  }, []);

  const filteredCandidates = useMemo(() => {
    if (candidateFilter === 'All') return candidates;

    return candidates.filter(
      (candidate) => candidate.status === candidateFilter
    );
  }, [candidateFilter, candidates]);

  const totalApplicants = candidates.length;
  const totalShortlisted = candidates.filter((candidate) => ['Shortlisted', 'Interview', 'Active'].includes(candidate.status)).length;
  const totalInterviews = candidates.filter((candidate) => candidate.status === 'Interview').length;
  const activePostings = postings.filter((posting) => posting.status === 'Published');

  return (
    <div className="page-container company-dashboard">
      <div className="page-header">
        <h2>Company Dashboard</h2>
        <p>
          Manage employer postings, candidate pipelines, and active
          internship cohorts.
        </p>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {loading && <div className="company-dashboard-loading" role="status">Loading company workspace...</div>}

      {/* KPI Cards */}
      <div className="company-kpi-grid">
        <div className="company-kpi-card">
          <div className="company-kpi-icon icon-teal"><IconBriefcase size={21} /></div>
          <span className="company-kpi-label">Active Postings</span>
          <strong className="company-kpi-value">{activePostings.length}</strong>
          <small>Currently published</small>
        </div>

        <div className="company-kpi-card">
          <div className="company-kpi-icon icon-blue"><IconUsers size={21} /></div>
          <span className="company-kpi-label">Total Applicants</span>
          <strong className="company-kpi-value">{totalApplicants}</strong>
          <small>Across all postings</small>
        </div>

        <div className="company-kpi-card">
          <div className="company-kpi-icon icon-amber"><IconCheckCircle size={21} /></div>
          <span className="company-kpi-label">Shortlisted</span>
          <strong className="company-kpi-value">{totalShortlisted}</strong>
          <small>Candidates shortlisted</small>
        </div>

        <div className="company-kpi-card">
          <div className="company-kpi-icon icon-coral"><IconCalendar size={21} /></div>
          <span className="company-kpi-label">Interviews</span>
          <strong className="company-kpi-value">{totalInterviews}</strong>
          <small>Scheduled interviews</small>
        </div>
      </div>

      {/* Company Overview */}
      <div className="company-overview">
        <div className="company-overview-mark"><IconBriefcase size={23} /></div>
        <div className="company-overview-copy">
          <h3>{companyName}</h3>
          <p>Technology company focused on AI, software engineering, and data-driven solutions.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary company-post-action"
          onClick={() => setActiveTab('manage')}
        >
          + Post Internship
        </button>
      </div>

      {/* Quick Actions */}
      <div className="company-quick-actions">
        <button
          type="button"
          className="company-quick-action"
          onClick={() => setActiveTab('applicants')}
        >
          <div className="company-action-icon icon-blue"><IconUsers size={20} /></div>
          <div>
            <h4>View Applicants</h4>
            <p>Review and shortlist candidates.</p>
          </div>
          <IconArrowRight size={16} className="company-action-arrow" />
        </button>

        <button
          type="button"
          className="company-quick-action"
          onClick={() => setActiveTab('applicants')}
        >
          <div className="company-action-icon icon-amber"><IconCalendar size={20} /></div>
          <div>
            <h4>Schedule Interviews</h4>
            <p>Manage upcoming candidate interviews.</p>
          </div>
          <IconArrowRight size={16} className="company-action-arrow" />
        </button>

        <button
          type="button"
          className="company-quick-action"
          onClick={() => setActiveTab('progress')}
        >
          <div className="company-action-icon icon-coral"><IconClock size={20} /></div>
          <div>
            <h4>Monitor Interns</h4>
            <p>Track progress and evaluations.</p>
          </div>
          <IconArrowRight size={16} className="company-action-arrow" />
        </button>
      </div>

      {/* Internship Postings */}
      <section className="company-section-card">
        <div className="company-section-header">
            <div>
              <h3>Active Internship Postings</h3>
              <p>Monitor applications for each opportunity.</p>
            </div>
        </div>

          <div className="company-postings-table-wrap">
            <table className="company-postings-table">
              <thead>
                <tr>
                  <th>Internship</th>
                  <th>Location</th>
                  <th>Applicants</th>
                  <th>Shortlisted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {activePostings.map((posting) => (
                  <tr key={posting.id}>
                    <td>
                      <strong>{posting.title}</strong>
                      <small>{posting.department}</small>
                    </td>

                    <td>{posting.location}</td>

                    <td>{posting.applicants}</td>

                    <td>{candidates.filter((candidate) => candidate.internship_id === posting.id && ['Shortlisted', 'Interview', 'Active'].includes(candidate.status)).length}</td>

                    <td>
                      <span className="company-published-badge">{posting.status}</span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="company-manage-button"
                        onClick={() => setActiveTab('manage')}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && activePostings.length === 0 && (
                  <tr><td colSpan="6">No published postings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
      </section>

      {/* Candidate Pipeline */}
      <section className="company-section-card">
        <div className="company-section-header">
            <div>
              <h3>Candidate Pipeline</h3>
              <p>Track candidates through the hiring process.</p>
            </div>

            <div className="company-pipeline-filters" role="group" aria-label="Filter candidates by stage">
              {['All', 'New', 'Shortlisted', 'Interview', 'Active'].map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`company-pipeline-filter${candidateFilter === filter ? ' active' : ''}`}
                    onClick={() => setCandidateFilter(filter)}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
        </div>

          <div className="company-candidate-list">
            {filteredCandidates.map((candidate) => (
              <article className="company-candidate-row" key={candidate.id}>
                <div className="company-candidate-info">
                  <span className="company-candidate-avatar" aria-hidden="true">{candidate.name.split(' ').map((part) => part[0]).join('')}</span>
                  <div>
                  <strong>{candidate.name}</strong>
                    <p>{candidate.role}</p>
                    <small>Applied {candidate.date}</small>
                  </div>
                </div>

                <div className="company-candidate-actions">
                  <span className="company-match-badge">{candidate.match}% match</span>

                  <span className={`company-candidate-status status-${candidate.status.toLowerCase()}`}>
                    {candidate.status}
                  </span>

                  <button
                    type="button"
                    className="company-manage-button"
                    onClick={() => setActiveTab('applicants')}
                  >
                    View <IconArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}

            {filteredCandidates.length === 0 && (
              <div className="company-pipeline-empty">
                <p>No candidates in this stage.</p>
              </div>
            )}
          </div>
      </section>
    </div>
  );
}