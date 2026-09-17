import { useMemo, useState } from 'react';
import { IconCheckCircle } from '../../components/common/Icons';

const students = [
  {
    id: 'STU001',
    name: 'Aarav Patil',
    department: 'CSE - AIML',
    company: 'TechNova Solutions',
    attendance: 94,
    hours: 128,
    progress: 82,
    evaluation: 'Excellent',
    status: 'On Track',
  },
  {
    id: 'STU002',
    name: 'Priya Sharma',
    department: 'Computer Engineering',
    company: 'WebCraft Technologies',
    attendance: 89,
    hours: 112,
    progress: 74,
    evaluation: 'Good',
    status: 'On Track',
  },
  {
    id: 'STU003',
    name: 'Rohan Deshmukh',
    department: 'CSE - AIML',
    company: 'DataSphere Labs',
    attendance: 76,
    hours: 96,
    progress: 61,
    evaluation: 'Needs Review',
    status: 'Attention Required',
  },
  {
    id: 'STU004',
    name: 'Sneha Kulkarni',
    department: 'Electronics & Communication',
    company: 'Innovate Systems',
    attendance: 92,
    hours: 120,
    progress: 79,
    evaluation: 'Excellent',
    status: 'On Track',
  },
];

export default function StudentMonitoring() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        student.name.toLowerCase().includes(searchText) ||
        student.id.toLowerCase().includes(searchText) ||
        student.company.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === 'All' || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="page-container student-monitoring">
      <div className="page-header">
        <div>
          <h2>Student Monitoring</h2>
          <p>
            Real-time attendance logs, mentor evaluations, and weekly
            timesheet approvals.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="profile-card">
        <div className="profile-avatar">
          <IconCheckCircle size={34} />
        </div>

        <div className="profile-heading">
          <h3>Faculty Advisor Supervision</h3>
          <p>
            Monitor student internship progress, attendance and evaluations.
          </p>
          <span className="profile-status">Monitoring Active</span>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Students Monitored</span>
          <strong className="stat-value">248</strong>
          <span className="stat-subtitle">Currently enrolled</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">On Track</span>
          <strong className="stat-value">218</strong>
          <span className="stat-subtitle">88% of students</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Reports Pending</span>
          <strong className="stat-value">24</strong>
          <span className="stat-subtitle">Faculty review required</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Attention Required</span>
          <strong className="stat-value">6</strong>
          <span className="stat-subtitle">Need follow-up</span>
        </div>
      </div>

      {/* Filters */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Student Internship Records</h3>
          <p>Search and monitor individual student progress</p>
        </div>

        <div className="recommendation-controls">
          <input
            type="text"
            placeholder="Search student, ID or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="On Track">On Track</option>
            <option value="Attention Required">
              Attention Required
            </option>
          </select>
        </div>

        {/* Student Table */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Company</th>
                <th>Attendance</th>
                <th>Hours</th>
                <th>Progress</th>
                <th>Evaluation</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <strong>{student.name}</strong>
                    <small>{student.id}</small>
                  </td>

                  <td>{student.department}</td>

                  <td>{student.company}</td>

                  <td>{student.attendance}%</td>

                  <td>{student.hours} hrs</td>

                  <td>
                    <div className="table-progress">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>

                      <span>{student.progress}%</span>
                    </div>
                  </td>

                  <td>{student.evaluation}</td>

                  <td>
                    <span
                      className={
                        student.status === 'On Track'
                          ? 'profile-status'
                          : 'warning-badge'
                      }
                    >
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <p className="placeholder-desc">
            No students found matching your search.
          </p>
        )}
      </div>

      {/* Attendance & Evaluation */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Monitoring Alerts</h3>
          <p>Students requiring faculty attention</p>
        </div>

        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-dot" />
            <div>
              <strong>Rohan Deshmukh has attendance below 80%</strong>
              <p>Faculty follow-up recommended</p>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-dot" />
            <div>
              <strong>24 weekly reports are awaiting review</strong>
              <p>Review pending internship submissions</p>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-dot" />
            <div>
              <strong>6 students need progress monitoring</strong>
              <p>Check internship milestones and mentor feedback</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}