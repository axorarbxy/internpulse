import { useEffect, useState } from 'react';
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
import institutionService from '../../services/institutionService';

export default function InstitutionAnalytics() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    institutionService.getOverview()
      .then((data) => { if (isActive) setOverview(data); })
      .catch((requestError) => { if (isActive) setError(requestError.message || 'Unable to load institution analytics.'); })
      .finally(() => { if (isActive) setLoading(false); });
    return () => { isActive = false; };
  }, []);

  const downloadReport = (title) => {
    if (!overview) return;
    const rows = [
      ['Institution', overview.institution?.institution_name || 'Institution'],
      ['Report', title],
      ['Students', overview.summary.totalStudents],
      ['Placed students', overview.summary.studentsPlaced],
      ['Active internships', overview.summary.activeInternships],
      ['Industry partners', overview.summary.industryPartners],
      [],
      ['Student', 'Program', 'Internship', 'Company', 'Status', 'Progress'],
      ...overview.students.map((student) => [student.name, student.branch || student.course, student.internship_title || '', student.company_name || '', student.application_status, `${student.progress}%`]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="loading-container" role="status"><div className="spinner" /><p>Loading institutional analytics...</p></div>;
  if (!overview) return <div className="alert alert-danger" role="alert">{error || 'Institution analytics are unavailable.'}</div>;

  const { summary, departments, monthlyApplications, internshipStatus, evaluations } = overview;

  return (
    <div className="page-container institution-dashboard institution-analytics">
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
            <h3>{overview.institution?.institution_name || 'Institutional Intelligence & Reports'}</h3>
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
          <strong className="stat-value">{summary.placementRate}%</strong>
          <span className="stat-subtitle">Active or completed placements</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Internship Completion</span>
          <strong className="stat-value">{summary.completionRate}%</strong>
          <span className="stat-subtitle">Across all departments</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Evaluation Score</span>
          <strong className="stat-value">{summary.employerSatisfaction}%</strong>
          <span className="stat-subtitle">Current supervisor evaluations</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Industry Partners</span>
          <strong className="stat-value">{summary.industryPartners}</strong>
          <span className="stat-subtitle">Represented in this cohort</span>
        </div>
      </div>

      <div className="analytics-chart-grid">
      {/* Placement Trend */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Application Activity</h3>
          <p>Recent applications and active/completed placements</p>
        </div>

        <div className="analytics-chart analytics-chart-wide">
          <ResponsiveContainer>
            <LineChart data={monthlyApplications}>
              <CartesianGrid stroke="#f8edbd" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#5d7184', fontSize: 11 }} axisLine={{ stroke: '#e8ddb0' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#5d7184', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: '1px solid #e8ddb0', borderRadius: 9, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#5d7184' }} />
              <Line
                type="monotone"
                dataKey="applications"
                name="Applications"
                stroke="#0f3c65"
                strokeWidth={3}
                dot={{ r: 4, fill: '#ffffff', strokeWidth: 2, stroke: '#0f3c65' }}
                activeDot={{ r: 6, fill: '#0f3c65' }}
              />
              <Line type="monotone" dataKey="placed" name="Placed" stroke="#d18b49" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Comparison */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Department Placement Comparison</h3>
          <p>Assigned students and active/completed internships by program</p>
        </div>

        <div className="analytics-chart">
          <ResponsiveContainer>
            <BarChart data={departments}>
              <CartesianGrid stroke="#f8edbd" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="department" tick={{ fill: '#5d7184', fontSize: 10 }} axisLine={{ stroke: '#e8ddb0' }} tickLine={false} />
              <YAxis tick={{ fill: '#5d7184', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: '1px solid #e8ddb0', borderRadius: 9, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#5d7184' }} />
              <Bar dataKey="students" name="Total Students" fill="#90aaa1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="internships" name="Active / Completed" fill="#245c84" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Internship Status */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Internship Status Distribution</h3>
          <p>Latest application status for assigned students</p>
        </div>

        <div className="analytics-chart analytics-chart-pie">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={internshipStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={88}
                paddingAngle={3}
                label={{ fill: '#365570', fontSize: 10 }}
              >
                {internshipStatus.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip contentStyle={{ border: '1px solid #e8ddb0', borderRadius: 9, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#5d7184' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employer Satisfaction */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Supervisor Evaluation Distribution</h3>
          <p>Evaluation levels recorded for active internship progress</p>
        </div>

        <div className="analytics-chart">
          <ResponsiveContainer>
            <BarChart
              data={evaluations}
              layout="vertical"
              margin={{ left: 8, right: 12 }}
            >
              <CartesianGrid stroke="#f8edbd" strokeDasharray="3 3" horizontal={false} />

              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fill: '#5d7184', fontSize: 10 }}
                axisLine={{ stroke: '#e8ddb0' }}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="category"
                width={116}
                tick={{ fill: '#49647a', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip contentStyle={{ border: '1px solid #e8ddb0', borderRadius: 9, fontSize: 12 }} />

              <Bar
                dataKey="count"
                name="Students"
                fill="#d18b49"
                radius={[0, 5, 5, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
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

              <button className="secondary-button" onClick={() => downloadReport('Annual Placement Report')}>
              View Report
            </button>
          </div>

          <div className="activity-item">
            <div className="activity-dot" />

            <div>
              <strong>Internship Outcome Report</strong>
              <p>Internship completion and student performance</p>
            </div>

              <button className="secondary-button" onClick={() => downloadReport('Internship Outcome Report')}>
              View Report
            </button>
          </div>

          <div className="activity-item">
            <div className="activity-dot" />

            <div>
              <strong>Employer Feedback Report</strong>
              <p>Industry partner satisfaction and feedback</p>
            </div>

              <button className="secondary-button" onClick={() => downloadReport('Supervisor Evaluation Report')}>
              View Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}