import { useEffect, useMemo, useState } from 'react';
import { IconCheckCircle, IconSearch } from '../../components/common/Icons';
import apiRequest from '../../services/api';

export default function StudentMonitoring() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    apiRequest('/institutions/students')
      .then((response) => {
        if (isActive) setStudents(response.students || []);
      })
      .catch(() => {
        if (isActive) setError('The institution roster could not be loaded.');
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchText = search.toLowerCase();
      const applicationStatus = student.application_status || 'Unassigned';

      const matchesSearch =
        student.name.toLowerCase().includes(searchText) ||
        String(student.student_id).toLowerCase().includes(searchText) ||
        (student.company_name || '').toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && applicationStatus === 'ONGOING') ||
        (statusFilter === 'Awaiting Placement' && !['ONGOING', 'COMPLETED'].includes(applicationStatus)) ||
        (statusFilter === 'Completed' && applicationStatus === 'COMPLETED');

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  const activeInterns = students.filter((student) => student.application_status === 'ONGOING').length;
  const awaitingPlacement = students.filter((student) => !['ONGOING', 'COMPLETED'].includes(student.application_status)).length;
  const completedPlacements = students.filter((student) => student.application_status === 'COMPLETED').length;

  return (
    <div className="page-container institution-dashboard student-monitoring">
      <div className="page-header">
        <div>
          <h2>Student Monitoring</h2>
            <p>Review students assigned to your institution, their progress, and latest internship status.</p>
        </div>
      </div>

      {/* Header */}
      <div className="profile-card">
        <div className="profile-avatar">
          <IconCheckCircle size={34} />
        </div>

        <div className="profile-heading">
          <h3>Faculty Advisor Supervision</h3>
          <p>View only the student records assigned to this institution.</p>
          <span className="profile-status">Monitoring Active</span>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Students Monitored</span>
          <strong className="stat-value">{students.length}</strong>
          <span className="stat-subtitle">Assigned to this institution</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Active Internships</span>
          <strong className="stat-value">{activeInterns}</strong>
          <span className="stat-subtitle">Currently in progress</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <strong className="stat-value">{completedPlacements}</strong>
          <span className="stat-subtitle">Completed internships</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Awaiting Placement</span>
          <strong className="stat-value">{awaitingPlacement}</strong>
          <span className="stat-subtitle">No active internship</span>
        </div>
      </div>

      {error && <p className="monitoring-empty-state" role="alert">{error}</p>}

      <div className="profile-section">
        <div className="section-title">
          <h3>Student Internship Records</h3>
          <p>Search the institution-assigned roster and view each student’s latest application.</p>
        </div>

        <div className="monitoring-controls">
          <label className="monitoring-search">
            <IconSearch size={17} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search student, ID or company..."
            aria-label="Search students by name, ID, or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          </label>

          <select
            aria-label="Filter students by monitoring status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active internships</option>
            <option value="Awaiting Placement">Awaiting placement</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Student Table */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Program</th>
                <th>Internship</th>
                <th>Company</th>
                <th>Progress</th>
                <th>Application Status</th>
              </tr>
            </thead>

            <tbody>
              {!loading && !error && filteredStudents.map((student) => (
                <tr key={student.student_id}>
                  <td>
                    <strong>{student.name}</strong>
                    <small>STU-{student.student_id}</small>
                  </td>

                  <td>{student.branch || student.course || 'Not specified'}</td>

                  <td>{student.internship_title || 'No internship linked'}</td>

                  <td>{student.company_name || '—'}</td>

                  <td>
                    {student.internship_title ? (
                      <div className="table-progress">
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${student.progress_data?.progress ?? (student.application_status === 'COMPLETED' ? 100 : 0)}%` }}
                          />
                        </div>
                        <span>{student.progress_data?.progress ?? (student.application_status === 'COMPLETED' ? 100 : 0)}%</span>
                      </div>
                    ) : '—'}
                  </td>

                  <td>
                    <span className={`monitoring-application-status status-${(student.application_status || 'unassigned').toLowerCase()}`}>
                      {student.application_status || 'Unassigned'}
                    </span>
                  </td>
                </tr>
              ))}
              {loading && <tr><td colSpan="6" className="monitoring-table-message">Loading institution roster...</td></tr>}
              {!loading && !error && filteredStudents.length === 0 && <tr><td colSpan="6" className="monitoring-table-message">{students.length ? 'No students match these filters.' : 'No students have been assigned to this institution.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}