import { useState, useEffect } from 'react';
import { useNavigation } from '../../context';
import { studentService } from '../../services';
import StatCard from '../../components/dashboard/StatCard';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Badge from '../../components/common/Badge';
import {
  IconBriefcase,
  IconCheckCircle,
  IconClock,
  IconCalendar,
  IconSparkles,
  IconArrowRight,
  IconUser,
  IconFileText,
  IconAward,
  IconMapPin,
  IconDollarSign,
  IconGraduationCap,
} from '../../components/common/Icons';

export default function StudentDashboard() {
  const { setActiveTab } = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isSubscribed = true;

    studentService
      .getStudentDashboardData()
      .then((res) => {
        if (isSubscribed) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          setError(err?.message || 'Failed to load student dashboard data.');
          setLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    studentService
      .getStudentDashboardData()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load student dashboard data.');
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Loading your student dashboard...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="loading-container">
        <p style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{error || 'Error loading dashboard'}</p>
        <button type="button" className="btn btn-primary" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    );
  }

  const { profile, stats, activeInternship, deadlines, recentApplications, recommendedInternships } = data;

  return (
    <div className="dashboard-page">
      {/* 1. Welcome Section */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-greeting-row">
            <h1 className="welcome-title">Welcome back, {profile.name}! 🎓</h1>
            <Badge variant="purple" size="md">
              <IconSparkles size={12} /> {profile.year}
            </Badge>
          </div>
          <p className="welcome-subtitle">
            You are currently on track for your graduation internship credits. Your active internship at{' '}
            <strong>{activeInternship.company}</strong> is {activeInternship.progressPercentage}% complete.
          </p>

          <div className="welcome-meta-row">
            <span className="welcome-meta-item">
              <IconGraduationCap size={15} /> {profile.degree} • {profile.department}
            </span>
            <span>•</span>
            <span className="welcome-meta-item">
              GPA: <strong>{profile.gpa} / 4.0</strong>
            </span>
            <span>•</span>
            <span className="welcome-meta-item">
              Target: <strong>{profile.targetRole}</strong>
            </span>
          </div>
        </div>

        <div className="welcome-profile-preview">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '12px' }}>
            <span>Profile Completeness</span>
            <strong>{profile.profileCompleteness}%</strong>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill progress-bar-fill-gradient"
              style={{ width: `${profile.profileCompleteness}%` }}
            />
          </div>
          <button
            type="button"
            className="btn btn-sm"
            style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', padding: '4px 10px', fontSize: '11px' }}
            onClick={() => setActiveTab('profile')}
          >
            Complete Profile →
          </button>
        </div>
      </section>

      {/* 2. Key Metric Stat Cards */}
      <section className="stats-grid">
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={IconBriefcase}
          trend={stats.applicationsTrend}
          trendType="up"
          accent="primary"
          subtitle="Applied across all portals"
          onClick={() => setActiveTab('browse')}
        />

        <StatCard
          title="Shortlisted"
          value={stats.shortlistedApplications}
          icon={IconSparkles}
          trend={stats.shortlistedRate}
          trendType="up"
          accent="purple"
          subtitle="Interview invitations"
        />

        <StatCard
          title="Active Internship"
          value={stats.activeInternshipCount}
          icon={IconClock}
          trend="In Progress"
          trendType="up"
          accent="success"
          subtitle={stats.activeInternshipCompany}
          onClick={() => setActiveTab('my-internships')}
        />

        <StatCard
          title="Completed Internships"
          value={stats.completedInternships}
          icon={IconCheckCircle}
          trend={stats.completedCertificates}
          trendType="neutral"
          accent="info"
          subtitle="Institutional credits verified"
          onClick={() => setActiveTab('certificates')}
        />
      </section>

      {/* 3. Main Two-Column Grid */}
      <div className="dashboard-main-grid">
        {/* Left Column (Wider): Active Internship Progress & Recent Applications */}
        <div className="grid-col-left">
          {/* Active Internship Progress */}
          <DashboardCard
            title="Active Internship Progress"
            subtitle={`${activeInternship.company} • ${activeInternship.role}`}
            action={
              <Badge variant="success" dot size="sm">
                Active • Week {activeInternship.currentWeek} of {activeInternship.totalDurationWeeks}
              </Badge>
            }
          >
            <div className="active-internship-header">
              <div className="internship-company-badge">
                <div className="company-logo-avatar">{activeInternship.companyLogo}</div>
                <div className="company-details">
                  <h4>{activeInternship.role}</h4>
                  <p>{activeInternship.department} • {activeInternship.location}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Stipend:</span>
                <p style={{ fontWeight: 700, color: 'var(--color-success-text)' }}>{activeInternship.stipend}</p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="internship-summary-metrics">
              <div className="metric-box">
                <span className="metric-box-label">Timeline Completion</span>
                <span className="metric-box-value">{activeInternship.progressPercentage}%</span>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{ height: '100%', width: `${activeInternship.progressPercentage}%`, background: 'var(--color-primary)' }} />
                </div>
              </div>
              <div className="metric-box">
                <span className="metric-box-label">Verified Work Hours</span>
                <span className="metric-box-value">
                  {activeInternship.totalHoursCompleted} / {activeInternship.totalHoursRequired} hrs
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>61% requirement met</span>
              </div>
              <div className="metric-box">
                <span className="metric-box-label">Industry Mentor</span>
                <span className="metric-box-value" style={{ fontSize: '14px' }}>{activeInternship.mentorName}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{activeInternship.mentorRole}</span>
              </div>
            </div>

            {/* Milestones Timeline */}
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '14px' }}>
              Project Milestones & Deliverables
            </h4>
            <div className="milestones-timeline">
              {activeInternship.milestones.map((m) => (
                <div key={m.id} className="milestone-item">
                  <div
                    className={`milestone-status-icon ${
                      m.status === 'completed'
                        ? 'milestone-completed'
                        : m.status === 'in-progress'
                        ? 'milestone-in-progress'
                        : 'milestone-upcoming'
                    }`}
                  >
                    {m.status === 'completed' ? (
                      <IconCheckCircle size={15} />
                    ) : m.status === 'in-progress' ? (
                      <IconClock size={15} />
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>•</span>
                    )}
                  </div>
                  <div className="milestone-info">
                    <div>
                      <p className="milestone-title">{m.title}</p>
                      <span className="milestone-meta">{m.week} • Est. {m.date}</span>
                    </div>
                    <div>
                      {m.status === 'completed' && <Badge variant="success" size="sm">Done</Badge>}
                      {m.status === 'in-progress' && <Badge variant="primary" size="sm">In Progress</Badge>}
                      {m.status === 'upcoming' && <Badge variant="neutral" size="sm">Upcoming</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Recent Applications Table */}
          <DashboardCard
            title="Recent Applications"
            subtitle="Track your submissions, interview invitations, and status"
            action={
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setActiveTab('browse')}
              >
                Browse More <IconArrowRight size={14} />
              </button>
            }
          >
            <div className="applications-table-wrapper">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Role & Company</th>
                    <th>Type / Location</th>
                    <th>Applied Date</th>
                    <th>Stipend</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="table-company-cell">
                          <span className="table-role-name">{app.role}</span>
                          <span className="table-company-name">{app.company}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px' }}>{app.type}</span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{app.location}</div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{app.appliedDate}</td>
                      <td style={{ fontWeight: 600 }}>{app.stipend}</td>
                      <td>
                        <Badge variant={app.statusVariant} size="sm">
                          {app.status}
                        </Badge>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => setActiveTab('my-internships')}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>

        {/* Right Column (Narrower): Quick Actions, Deadlines, Profile Summary, Recommended */}
        <div className="grid-col-right">
          {/* Quick Action Buttons */}
          <DashboardCard title="Quick Actions">
            <div className="quick-actions-grid">
              <button
                type="button"
                className="quick-action-btn"
                onClick={() => setActiveTab('browse')}
              >
                <IconBriefcase size={18} color="var(--color-primary)" />
                <span>Browse Jobs</span>
              </button>

              <button
                type="button"
                className="quick-action-btn"
                onClick={() => setActiveTab('resume')}
              >
                <IconFileText size={18} color="var(--color-purple)" />
                <span>Build Resume</span>
              </button>

              <button
                type="button"
                className="quick-action-btn"
                onClick={() => setActiveTab('analytics')}
              >
                <IconClock size={18} color="var(--color-success)" />
                <span>Analytics</span>
              </button>

              <button
                type="button"
                className="quick-action-btn"
                onClick={() => setActiveTab('certificates')}
              >
                <IconAward size={18} color="var(--color-warning)" />
                <span>Certificates</span>
              </button>
            </div>
          </DashboardCard>

          {/* Upcoming Deadlines */}
          <DashboardCard
            title="Upcoming Deadlines"
            subtitle="Don't miss mandatory milestones"
            action={
              <Badge variant="danger" size="sm">
                {deadlines.length} Due Soon
              </Badge>
            }
          >
            <div className="deadlines-list">
              {deadlines.map((item) => (
                <div key={item.id} className={`deadline-card urgent-${item.urgency}`}>
                  <div className="deadline-content">
                    <p className="deadline-title">{item.title}</p>
                    <div className="deadline-meta-row">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconCalendar size={13} /> {item.dueDate}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{item.company}</span>
                  </div>
                  <Badge
                    variant={item.urgency === 'high' ? 'danger' : item.urgency === 'medium' ? 'warning' : 'info'}
                    size="sm"
                  >
                    {item.urgency}
                  </Badge>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Student Profile Summary */}
          <DashboardCard
            title="Student Profile Summary"
            action={
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setActiveTab('profile')}
              >
                <IconUser size={13} /> View
              </button>
            }
          >
            <div className="profile-summary-header">
              <img src={profile.avatar} alt={profile.name} className="profile-avatar-lg" />
              <div className="profile-header-info">
                <h4>{profile.name}</h4>
                <p>{profile.university}</p>
                <Badge variant="primary" size="sm" style={{ marginTop: '4px' }}>
                  {profile.year}
                </Badge>
              </div>
            </div>

            <div className="profile-details-list">
              <div className="profile-detail-row">
                <span className="profile-detail-label">Student ID</span>
                <span className="profile-detail-val">{profile.id}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Email</span>
                <span className="profile-detail-val" style={{ fontSize: '12px' }}>{profile.email}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Current GPA</span>
                <span className="profile-detail-val" style={{ color: 'var(--color-primary)' }}>{profile.gpa} / 4.0</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Verified Badges</span>
                <span className="profile-detail-val">{profile.verifiedCredentials} Verified</span>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Key Verified Skills
              </span>
              <div className="skills-tags-wrap">
                {profile.skills.map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </DashboardCard>

          {/* Recommended Internships */}
          <DashboardCard
            title="Recommended For You"
            subtitle="AI skill-matched internship roles"
            action={
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setActiveTab('recommendations')}
              >
                View All <IconArrowRight size={13} />
              </button>
            }
          >
            <div className="recommended-list">
              {recommendedInternships.map((rec) => (
                <div key={rec.id} className="recommendation-card">
                  <div className="rec-card-header">
                    <div>
                      <h5 className="rec-role-title">{rec.title}</h5>
                      <span className="rec-company-name">{rec.company}</span>
                    </div>
                    <Badge variant="purple" size="sm">
                      <IconSparkles size={11} /> {rec.matchScore}% Match
                    </Badge>
                  </div>

                  <div className="rec-meta-row">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconMapPin size={13} /> {rec.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconDollarSign size={13} /> {rec.stipend}
                    </span>
                  </div>

                  <div className="skills-tags-wrap">
                    {rec.skills.map((sk) => (
                      <span key={sk} className="skill-tag" style={{ fontSize: '10px' }}>
                        {sk}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setActiveTab('browse')}
                    >
                      Quick Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
