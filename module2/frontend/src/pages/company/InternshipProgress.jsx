import { useState } from 'react';
import { IconCheckCircle } from '../../components/common/Icons';

const initialInterns = [
  {
    id: 1,
    name: 'Aarav Patil',
    role: 'Machine Learning Intern',
    mentor: 'Rahul Mehta',
    startDate: '01 Aug 2026',
    progress: 82,
    hours: 142,
    tasks: 18,
    completedTasks: 15,
    evaluation: 'Excellent',
    status: 'On Track',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Frontend Developer Intern',
    mentor: 'Neha Joshi',
    startDate: '05 Aug 2026',
    progress: 74,
    hours: 128,
    tasks: 20,
    completedTasks: 15,
    evaluation: 'Good',
    status: 'On Track',
  },
  {
    id: 3,
    name: 'Rohan Deshmukh',
    role: 'Data Analytics Intern',
    mentor: 'Amit Kulkarni',
    startDate: '10 Aug 2026',
    progress: 61,
    hours: 104,
    tasks: 18,
    completedTasks: 11,
    evaluation: 'Needs Review',
    status: 'Attention',
  },
  {
    id: 4,
    name: 'Sneha Kulkarni',
    role: 'AI Research Intern',
    mentor: 'Priya Nair',
    startDate: '01 Aug 2026',
    progress: 91,
    hours: 158,
    tasks: 22,
    completedTasks: 20,
    evaluation: 'Excellent',
    status: 'On Track',
  },
];

export default function InternshipProgress() {
  const [interns, setInterns] = useState(initialInterns);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIntern, setSelectedIntern] = useState(null);

  const filteredInterns =
    statusFilter === 'All'
      ? interns
      : interns.filter((intern) => intern.status === statusFilter);

  const updateEvaluation = (id, evaluation) => {
    setInterns(
      interns.map((intern) =>
        intern.id === id
          ? { ...intern, evaluation }
          : intern
      )
    );

    alert(`Evaluation updated to ${evaluation}.`);
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
    <div className="page-container internship-progress">
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

      {/* Overview */}
      <div className="profile-card">
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
      <div className="stats-grid">
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
        <div className="profile-section">
          <div className="section-title">
            <h3>Monitoring Alerts</h3>
            <p>Interns requiring additional attention</p>
          </div>

          <div className="activity-list">
            {interns
              .filter((intern) => intern.status === 'Attention')
              .map((intern) => (
                <div className="activity-item" key={intern.id}>
                  <div className="activity-dot" />

                  <div>
                    <strong>{intern.name}</strong>
                    <p>
                      Progress is {intern.progress}%. Supervisor review is
                      recommended.
                    </p>
                  </div>

                  <button
                    className="secondary-button"
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
      <div className="profile-section">
        <div className="section-title">
          <h3>Intern Monitoring</h3>
          <p>Track progress and evaluation status for active interns</p>
        </div>

        <div className="filter-row">
          {['All', 'On Track', 'Attention'].map((status) => (
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

        {/* Intern Table */}
        <div className="table-wrapper">
          <table className="data-table">
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
                    <strong>{intern.progress}%</strong>
                  </td>

                  <td>{intern.hours}</td>

                  <td>
                    {intern.completedTasks}/{intern.tasks}
                  </td>

                  <td>
                    <span className="status-badge">
                      {intern.evaluation}
                    </span>
                  </td>

                  <td>
                    <span className="status-badge">
                      {intern.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="secondary-button"
                      onClick={() => setSelectedIntern(intern)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evaluation Summary */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Evaluation Summary</h3>
          <p>Current supervisor assessment distribution</p>
        </div>

        <div className="stats-grid">
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
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3>{selectedIntern.name}</h3>
                <p>{selectedIntern.role}</p>
              </div>

              <button
                className="secondary-button"
                onClick={() => setSelectedIntern(null)}
              >
                Close
              </button>
            </div>

            <div className="profile-section">
              <div className="section-title">
                <h3>Internship Details</h3>
              </div>

              <div className="detail-grid">
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

            <div className="profile-section">
              <div className="section-title">
                <h3>Supervisor Evaluation</h3>
                <p>Update the intern's current evaluation</p>
              </div>

              <div className="filter-row">
                {['Excellent', 'Good', 'Needs Review'].map(
                  (evaluation) => (
                    <button
                      key={evaluation}
                      className={
                        selectedIntern.evaluation === evaluation
                          ? 'primary-button'
                          : 'secondary-button'
                      }
                      onClick={() => {
                        updateEvaluation(
                          selectedIntern.id,
                          evaluation
                        );

                        setSelectedIntern({
                          ...selectedIntern,
                          evaluation,
                        });
                      }}
                    >
                      {evaluation}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="button-row">
              <button
                className="primary-button"
                onClick={() =>
                  alert('Weekly task approval opened.')
                }
              >
                Approve Weekly Tasks
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  alert('Completion certificate review opened.')
                }
              >
                Certificate Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}