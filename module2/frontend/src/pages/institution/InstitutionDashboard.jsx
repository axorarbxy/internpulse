import { useEffect, useState } from 'react';
import { IconBuilding } from '../../components/common/Icons';
import { useNavigation } from '../../context';
import institutionService from '../../services/institutionService';

export default function InstitutionDashboard() {
  const { setActiveTab } = useNavigation();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    institutionService.getOverview()
      .then((data) => { if (isActive) setOverview(data); })
      .catch((requestError) => { if (isActive) setError(requestError.message || 'Unable to load institution overview.'); })
      .finally(() => { if (isActive) setLoading(false); });
    return () => { isActive = false; };
  }, []);

  if (loading) return <div className="loading-container" role="status"><div className="spinner" /><p>Loading institution overview...</p></div>;
  if (!overview) return <div className="alert alert-danger" role="alert">{error || 'Institution overview is unavailable.'}</div>;

  const { institution, summary, departments, activities } = overview;
  const kpis = [
    { title: 'Total Students', value: summary.totalStudents, subtitle: 'Assigned to this institution' },
    { title: 'Active Internships', value: summary.activeInternships, subtitle: 'Currently in progress' },
    { title: 'Students Placed', value: summary.studentsPlaced, subtitle: 'Active or completed placements' },
    { title: 'Industry Partners', value: summary.industryPartners, subtitle: 'Represented in this cohort' },
  ];

  return (
    <div className="page-container institution-dashboard">
      <div className="page-header">
        <div>
          <h2>Institution Dashboard</h2>
          <p>
            Institutional oversight of student placements, faculty advisors,
            and industry partners.
          </p>
        </div>
      </div>

      {/* Institution Header */}
      <div className="profile-card">
        <div className="profile-avatar">
          <IconBuilding size={34} />
        </div>

        <div className="profile-heading">
          <h3>{institution?.institution_name || 'Institution Overview'}</h3>
          <p>
            {institution?.address || 'Institutional oversight for student placements, progress, and industry partners.'}
          </p>
          <span className="profile-status">Monitoring Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        {kpis.map((item) => (
          <div className="stat-card" key={item.title}>
            <span className="stat-label">{item.title}</span>
            <strong className="stat-value">{item.value}</strong>
            <span className="stat-subtitle">{item.subtitle}</span>
          </div>
        ))}
      </div>

      {/* Department Overview */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Department Overview</h3>
          <p>Internship activity and completion across departments</p>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Students</th>
                <th>Internships</th>
                <th>Completion</th>
              </tr>
            </thead>

            <tbody>
              {departments.map((item) => (
                <tr key={item.department}>
                  <td>
                    <strong>{item.department}</strong>
                  </td>
                  <td>{item.students}</td>
                  <td>{item.internships}</td>
                  <td>
                    <div className="table-progress">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${item.completion}%` }}
                        />
                      </div>
                      <span>{item.completion}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monitoring Summary */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Internship Monitoring</h3>
          <p>Current institution-wide internship status</p>
        </div>

        <div className="monitoring-grid">
          <div className="monitoring-card">
            <strong>{summary.activeInternships}</strong>
            <span>Active Internships</span>
            <small>Students currently working</small>
          </div>

          <div className="monitoring-card">
            <strong>{summary.reportsSubmitted}</strong>
            <span>Reports Submitted</span>
            <small>Awaiting faculty review</small>
          </div>

          <div className="monitoring-card">
            <strong>{summary.pendingReviews}</strong>
            <span>Pending Reviews</span>
            <small>Faculty action required</small>
          </div>

          <div className="monitoring-card">
            <strong>{summary.industryPartners}</strong>
            <span>Industry Partners</span>
            <small>Active organizations</small>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Recent Activity</h3>
          <p>Latest internship management activities</p>
        </div>

        <div className="activity-list">
          {activities.map((activity) => (
            <div className="activity-item" key={activity.title}>
              <div className="activity-dot" />

              <div>
                <strong>{activity.title}</strong>
                <p>{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Quick Actions</h3>
          <p>Frequently used institution management functions</p>
        </div>

        <div className="quick-actions">
          <button className="primary-button" onClick={() => setActiveTab('monitoring')}>
            Monitor Students
          </button>

          <button className="secondary-button" onClick={() => setActiveTab('analytics')}>
            View Analytics
          </button>

          <button className="secondary-button" onClick={() => setActiveTab('monitoring')}>
            Review Pending Students
          </button>
        </div>
      </div>
    </div>
  );
}