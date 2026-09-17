import { useMemo, useState } from 'react';
import {
  IconBriefcase,
  IconUsers,
  IconCheckCircle,
  IconClock,
  IconCalendar,
  IconArrowRight,
} from '../../components/common/Icons';

const initialPostings = [
  {
    id: 1,
    title: 'Machine Learning Intern',
    department: 'AI / ML',
    location: 'Pune',
    applicants: 64,
    shortlisted: 18,
    interviews: 8,
    status: 'Published',
  },
  {
    id: 2,
    title: 'Frontend Developer Intern',
    department: 'Engineering',
    location: 'Remote',
    applicants: 52,
    shortlisted: 12,
    interviews: 6,
    status: 'Published',
  },
  {
    id: 3,
    title: 'Data Analytics Intern',
    department: 'Analytics',
    location: 'Mumbai',
    applicants: 40,
    shortlisted: 9,
    interviews: 4,
    status: 'Published',
  },
];

const candidates = [
  {
    id: 1,
    name: 'Aarav Patil',
    role: 'Machine Learning Intern',
    match: 94,
    status: 'Shortlisted',
    date: '15 Sep 2026',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Frontend Developer Intern',
    match: 89,
    status: 'Interview',
    date: '14 Sep 2026',
  },
  {
    id: 3,
    name: 'Rohan Deshmukh',
    role: 'Data Analytics Intern',
    match: 86,
    status: 'New',
    date: '13 Sep 2026',
  },
  {
    id: 4,
    name: 'Sneha Kulkarni',
    role: 'Machine Learning Intern',
    match: 82,
    status: 'New',
    date: '12 Sep 2026',
  },
];

export default function CompanyDashboard() {
  const [candidateFilter, setCandidateFilter] = useState('All');

  const filteredCandidates = useMemo(() => {
    if (candidateFilter === 'All') return candidates;

    return candidates.filter(
      (candidate) => candidate.status === candidateFilter
    );
  }, [candidateFilter]);

  const totalApplicants = initialPostings.reduce(
    (sum, posting) => sum + posting.applicants,
    0
  );

  const totalShortlisted = initialPostings.reduce(
    (sum, posting) => sum + posting.shortlisted,
    0
  );

  const totalInterviews = initialPostings.reduce(
    (sum, posting) => sum + posting.interviews,
    0
  );

  const handleAction = (message) => {
    alert(message);
  };

  return (
    <div className="page-container company-dashboard">
      <div className="page-header">
        <h2>Company Dashboard</h2>
        <p>
          Manage employer postings, candidate pipelines, and active
          internship cohorts.
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="card">
          <div className="card-body">
            <IconBriefcase size={24} />
            <div className="stat-label">Active Postings</div>
            <div className="stat-value">{initialPostings.length}</div>
            <small>Currently published</small>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <IconUsers size={24} />
            <div className="stat-label">Total Applicants</div>
            <div className="stat-value">{totalApplicants}</div>
            <small>Across all postings</small>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <IconCheckCircle size={24} />
            <div className="stat-label">Shortlisted</div>
            <div className="stat-value">{totalShortlisted}</div>
            <small>Candidates shortlisted</small>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <IconCalendar size={24} />
            <div className="stat-label">Interviews</div>
            <div className="stat-value">{totalInterviews}</div>
            <small>Scheduled interviews</small>
          </div>
        </div>
      </div>

      {/* Company Overview */}
      <div
        className="card"
        style={{ marginBottom: '24px' }}
      >
        <div className="card-body">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3>TechNova Solutions</h3>
              <p>
                Technology company focused on AI, software engineering,
                and data-driven solutions.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                handleAction('Opening internship posting form...')
              }
            >
              + Post Internship
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <button
          type="button"
          className="card"
          style={{
            textAlign: 'left',
            cursor: 'pointer',
            border: 'none',
          }}
          onClick={() =>
            handleAction('Opening applicant management...')
          }
        >
          <div className="card-body">
            <IconUsers size={22} />
            <h4>View Applicants</h4>
            <p>Review and shortlist candidates.</p>
          </div>
        </button>

        <button
          type="button"
          className="card"
          style={{
            textAlign: 'left',
            cursor: 'pointer',
            border: 'none',
          }}
          onClick={() =>
            handleAction('Opening interview scheduler...')
          }
        >
          <div className="card-body">
            <IconCalendar size={22} />
            <h4>Schedule Interviews</h4>
            <p>Manage upcoming candidate interviews.</p>
          </div>
        </button>

        <button
          type="button"
          className="card"
          style={{
            textAlign: 'left',
            cursor: 'pointer',
            border: 'none',
          }}
          onClick={() =>
            handleAction('Opening active intern monitoring...')
          }
        >
          <div className="card-body">
            <IconClock size={22} />
            <h4>Monitor Interns</h4>
            <p>Track progress and evaluations.</p>
          </div>
        </button>
      </div>

      {/* Internship Postings */}
      <div
        className="card"
        style={{ marginBottom: '24px' }}
      >
        <div className="card-body">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
            }}
          >
            <div>
              <h3>Active Internship Postings</h3>
              <p>Monitor applications for each opportunity.</p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px' }}>
                    Internship
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>
                    Location
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>
                    Applicants
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>
                    Shortlisted
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>
                    Status
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {initialPostings.map((posting) => (
                  <tr key={posting.id}>
                    <td style={{ padding: '12px' }}>
                      <strong>{posting.title}</strong>
                      <div>
                        <small>{posting.department}</small>
                      </div>
                    </td>

                    <td style={{ padding: '12px' }}>
                      {posting.location}
                    </td>

                    <td style={{ padding: '12px' }}>
                      {posting.applicants}
                    </td>

                    <td style={{ padding: '12px' }}>
                      {posting.shortlisted}
                    </td>

                    <td style={{ padding: '12px' }}>
                      <span className="badge">
                        {posting.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          handleAction(
                            `Managing ${posting.title}...`
                          )
                        }
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Candidate Pipeline */}
      <div className="card">
        <div className="card-body">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '15px',
              flexWrap: 'wrap',
              marginBottom: '18px',
            }}
          >
            <div>
              <h3>Candidate Pipeline</h3>
              <p>Track candidates through the hiring process.</p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              {['All', 'New', 'Shortlisted', 'Interview'].map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={
                      candidateFilter === filter
                        ? 'btn btn-primary'
                        : 'btn btn-secondary'
                    }
                    onClick={() =>
                      setCandidateFilter(filter)
                    }
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '12px',
            }}
          >
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '14px',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  borderRadius: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <strong>{candidate.name}</strong>
                  <div>{candidate.role}</div>
                  <small>Applied: {candidate.date}</small>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span className="badge">
                    {candidate.match}% Match
                  </span>

                  <span className="badge">
                    {candidate.status}
                  </span>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      handleAction(
                        `Opening ${candidate.name}'s profile...`
                      )
                    }
                  >
                    View <IconArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))}

            {filteredCandidates.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '30px',
                }}
              >
                <p>No candidates in this stage.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}