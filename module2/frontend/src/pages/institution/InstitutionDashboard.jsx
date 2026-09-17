import { IconBuilding } from '../../components/common/Icons';

const kpis = [
  {
    title: 'Total Students',
    value: '1,248',
    subtitle: 'Across all departments',
  },
  {
    title: 'Active Internships',
    value: '186',
    subtitle: 'Currently in progress',
  },
  {
    title: 'Students Placed',
    value: '892',
    subtitle: 'Current academic year',
  },
  {
    title: 'Industry Partners',
    value: '74',
    subtitle: 'Active organizations',
  },
];

const departmentData = [
  {
    department: 'CSE - AIML',
    students: 320,
    internships: 58,
    completion: 82,
  },
  {
    department: 'Computer Engineering',
    students: 285,
    internships: 46,
    completion: 78,
  },
  {
    department: 'Mechanical Engineering',
    students: 240,
    internships: 31,
    completion: 71,
  },
  {
    department: 'Electronics & Communication',
    students: 215,
    internships: 28,
    completion: 75,
  },
];

const activities = [
  {
    title: '12 students submitted internship reports',
    time: 'Today, 10:30 AM',
  },
  {
    title: 'New industry partner registered',
    time: 'Today, 09:15 AM',
  },
  {
    title: '8 students completed internships',
    time: 'Yesterday, 04:20 PM',
  },
  {
    title: 'Faculty advisor review completed',
    time: 'Yesterday, 02:45 PM',
  },
];

export default function InstitutionDashboard() {
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
          <h3>Institution Overview</h3>
          <p>
            Monitor internships, student progress and industry partnerships
            from one dashboard.
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
              {departmentData.map((item) => (
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
            <strong>186</strong>
            <span>Active Internships</span>
            <small>Students currently working</small>
          </div>

          <div className="monitoring-card">
            <strong>94</strong>
            <span>Reports Submitted</span>
            <small>Awaiting faculty review</small>
          </div>

          <div className="monitoring-card">
            <strong>38</strong>
            <span>Pending Reviews</span>
            <small>Faculty action required</small>
          </div>

          <div className="monitoring-card">
            <strong>74</strong>
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
          <button className="primary-button">
            Monitor Students
          </button>

          <button className="secondary-button">
            View Analytics
          </button>

          <button className="secondary-button">
            Manage Industry Partners
          </button>
        </div>
      </div>
    </div>
  );
}