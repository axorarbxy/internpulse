import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { IconAnalytics } from '../../components/common/Icons';

const placementData = [
  { year: '2022', placement: 72 },
  { year: '2023', placement: 78 },
  { year: '2024', placement: 82 },
  { year: '2025', placement: 87 },
  { year: '2026', placement: 91 },
];

const departmentData = [
  { department: 'CSE-AIML', students: 320, placed: 292 },
  { department: 'Computer', students: 285, placed: 251 },
  { department: 'Mechanical', students: 240, placed: 198 },
  { department: 'E&TC', students: 215, placed: 184 },
];

const internshipStatusData = [
  { name: 'Completed', value: 58 },
  { name: 'In Progress', value: 31 },
  { name: 'Pending', value: 11 },
];

const satisfactionData = [
  { category: 'Technical Skills', score: 88 },
  { category: 'Communication', score: 84 },
  { category: 'Professionalism', score: 91 },
  { category: 'Problem Solving', score: 86 },
];

export default function InstitutionAnalytics() {
  return (
    <div className="page-container institution-analytics">
      <div className="page-header">
        <div>
          <h2>Institution Analytics</h2>
          <p>
            College placement statistics, departmental trends, and employer
            satisfaction rates.
          </p>
        </div>
      </div>

      {/* Analytics Header */}
      <div className="profile-card">
        <div className="profile-avatar">
          <IconAnalytics size={34} />
        </div>

        <div className="profile-heading">
          <h3>Institutional Intelligence & Reports</h3>
          <p>
            Analyze placement performance, internship outcomes and employer
            feedback.
          </p>
          <span className="profile-status">Analytics Active</span>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Placement Rate</span>
          <strong className="stat-value">91%</strong>
          <span className="stat-subtitle">Current academic year</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Internship Completion</span>
          <strong className="stat-value">89%</strong>
          <span className="stat-subtitle">Across all departments</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Employer Satisfaction</span>
          <strong className="stat-value">87%</strong>
          <span className="stat-subtitle">Based on feedback</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Industry Partners</span>
          <strong className="stat-value">74</strong>
          <span className="stat-subtitle">Active organizations</span>
        </div>
      </div>

      {/* Placement Trend */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Placement Trend</h3>
          <p>Placement percentage over recent academic years</p>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={placementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="placement"
                name="Placement %"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Comparison */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Department Placement Comparison</h3>
          <p>Students versus placed students by department</p>
        </div>

        <div style={{ width: '100%', height: 340 }}>
          <ResponsiveContainer>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" name="Total Students" />
              <Bar dataKey="placed" name="Placed Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Internship Status */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Internship Status Distribution</h3>
          <p>Current internship lifecycle status</p>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={internshipStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {internshipStatusData.map((entry) => (
                  <Cell key={entry.name} />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employer Satisfaction */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Employer Satisfaction</h3>
          <p>Employer feedback across key student competencies</p>
        </div>

        <div style={{ width: '100%', height: 340 }}>
          <ResponsiveContainer>
            <BarChart
              data={satisfactionData}
              layout="vertical"
              margin={{ left: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                type="number"
                domain={[0, 100]}
              />

              <YAxis
                type="category"
                dataKey="category"
                width={130}
              />

              <Tooltip />

              <Bar
                dataKey="score"
                name="Satisfaction %"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Institution Reports</h3>
          <p>Available analytics and accreditation reports</p>
        </div>

        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-dot" />

            <div>
              <strong>Annual Placement Report</strong>
              <p>Placement performance and department-wise statistics</p>
            </div>

            <button className="secondary-button">
              View Report
            </button>
          </div>

          <div className="activity-item">
            <div className="activity-dot" />

            <div>
              <strong>Internship Outcome Report</strong>
              <p>Internship completion and student performance</p>
            </div>

            <button className="secondary-button">
              View Report
            </button>
          </div>

          <div className="activity-item">
            <div className="activity-dot" />

            <div>
              <strong>Employer Feedback Report</strong>
              <p>Industry partner satisfaction and feedback</p>
            </div>

            <button className="secondary-button">
              View Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}