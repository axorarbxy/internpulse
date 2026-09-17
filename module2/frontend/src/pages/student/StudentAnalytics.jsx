import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { studentService } from '../../services';
import StatCard from '../../components/dashboard/StatCard';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Badge from '../../components/common/Badge';
import {
  IconBriefcase,
  IconSparkles,
  IconClock,
  IconAlertCircle,
  IconCheckCircle,
  IconAnalytics,
} from '../../components/common/Icons';

export default function StudentAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('6m');

  useEffect(() => {
    let isMounted = true;

    studentService
      .getStudentAnalytics()
      .then((data) => {
        if (isMounted) {
          setAnalytics(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Failed to load analytics.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    studentService
      .getStudentAnalytics()
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load analytics.');
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Loading student analytics & visualizations...
        </p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="loading-container">
        <p style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{error || 'Error loading analytics'}</p>
        <button type="button" className="btn btn-primary" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    );
  }

  const {
    summary,
    applicationsOverTime,
    statusDistribution,
    weeklyHoursProgress,
    skillsProficiency,
    domainDistribution,
  } = analytics;

  // Filter application trends based on active period tab
  const filteredTimeline =
    timeRange === '30d'
      ? applicationsOverTime.slice(-2)
      : timeRange === '6m'
      ? applicationsOverTime.slice(-6)
      : applicationsOverTime;

  return (
    <div className="dashboard-page student-analytics">
      {/* Page Header with Period Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div className="page-header">
          <h2>Student Analytics & Insights</h2>
          <p>Real-time analytics on application volume, conversion funnel, hours logged, and skill benchmarks.</p>
        </div>

        <div className="analytics-filter-group" role="group" aria-label="Timeframe Filter">
          <button
            type="button"
            className={`analytics-filter-btn ${timeRange === '30d' ? 'active' : ''}`}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button
            type="button"
            className={`analytics-filter-btn ${timeRange === '6m' ? 'active' : ''}`}
            onClick={() => setTimeRange('6m')}
          >
            6 Months
          </button>
          <button
            type="button"
            className={`analytics-filter-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* 1. Summary / StatCards Row */}
      <section className="stats-grid">
        <StatCard
          title="Total Applications"
          value={summary.totalApplications}
          icon={IconBriefcase}
          trend={summary.applicationsTrend}
          trendType="up"
          accent="primary"
          subtitle="All platform submissions"
        />

        <StatCard
          title="Shortlisted"
          value={summary.shortlisted}
          icon={IconSparkles}
          trend={summary.shortlistedTrend}
          trendType="up"
          accent="purple"
          subtitle="Interview invitations"
        />

        <StatCard
          title="Pending Review"
          value={summary.pending}
          icon={IconClock}
          trend={summary.pendingTrend}
          trendType="neutral"
          accent="warning"
          subtitle="Under recruiter evaluation"
        />

        <StatCard
          title="Rejected / Archived"
          value={summary.rejected}
          icon={IconAlertCircle}
          trend={summary.rejectedTrend}
          trendType="down"
          accent="danger"
          subtitle="Not selected"
        />
      </section>

      {/* Additional Quick Metric Pills */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '-8px' }}>
        <Badge variant="success" size="md">
          <IconCheckCircle size={14} /> Total Hours: {summary.totalHoursLogged} / {summary.requiredHours} hrs ({summary.hoursCompletionPercent}% completed)
        </Badge>
        <Badge variant="info" size="md">
          <IconClock size={14} /> Average Recruiter Response: {summary.avgResponseDays} Days
        </Badge>
        <Badge variant="purple" size="md">
          <IconSparkles size={14} /> Total Offers Extended: {summary.offers}
        </Badge>
      </div>

      {/* 2. Primary Charts Row: Applications Over Time & Status Distribution */}
      <div className="analytics-grid-two-col">
        {/* Applications Over Time (Area Chart) */}
        <DashboardCard
          title="Applications Over Time"
          subtitle="Monthly volume of submitted applications vs shortlists & interviews"
          action={
            <Badge variant="primary" size="sm">
              <IconAnalytics size={12} /> Trend Analysis
            </Badge>
          }
        >
          <div className="chart-card-body" style={{ height: 320 }}>
            {filteredTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredTimeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorShortlist" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="custom-chart-tooltip">
                            <span className="tooltip-title">{label} Activity</span>
                            {payload.map((entry) => (
                              <div key={entry.name} className="tooltip-item">
                                <span style={{ color: entry.color }}>{entry.name}:</span>
                                <strong>{entry.value}</strong>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    name="Applications"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorApps)"
                  />
                  <Area
                    type="monotone"
                    dataKey="shortlisted"
                    name="Shortlisted"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorShortlist)"
                  />
                  <Area
                    type="monotone"
                    dataKey="interviews"
                    name="Interviews"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="#10b981"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state-box">No application records found for this timeframe.</div>
            )}
          </div>
        </DashboardCard>

        {/* Application Status Distribution (Donut Chart) */}
        <DashboardCard
          title="Application Status Distribution"
          subtitle="Current breakdown of all submitted internship applications"
          action={
            <Badge variant="purple" size="sm">
              24 Total
            </Badge>
          }
        >
          <div className="chart-card-body" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const dataItem = payload[0];
                      const total = summary.totalApplications;
                      const percent = ((dataItem.value / total) * 100).toFixed(1);
                      return (
                        <div className="custom-chart-tooltip">
                          <span className="tooltip-title">{dataItem.name}</span>
                          <div className="tooltip-item">
                            <span>Count:</span>
                            <strong>{dataItem.value} applications</strong>
                          </div>
                          <div className="tooltip-item">
                            <span>Share:</span>
                            <strong>{percent}%</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  layout="horizontal"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>

      {/* 3. Secondary Row: Weekly Hours Progress & Skills Benchmark */}
      <div className="analytics-grid-two-col">
        {/* Weekly Internship Hours Progress */}
        <DashboardCard
          title="Internship Hours Progress"
          subtitle="Weekly verified hours logged vs weekly institutional target"
          action={
            <Badge variant="success" size="sm">
              195 / 320 hrs
            </Badge>
          }
        >
          <div className="chart-card-body" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHoursProgress} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-chart-tooltip">
                          <span className="tooltip-title">{label} Hours</span>
                          {payload.map((entry) => (
                            <div key={entry.name} className="tooltip-item">
                              <span style={{ color: entry.color }}>{entry.name}:</span>
                              <strong>{entry.value} hrs</strong>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar
                  dataKey="loggedHours"
                  name="Hours Logged"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="targetHours"
                  name="Weekly Target"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Skills Proficiency vs Benchmark (Bar Chart) */}
        <DashboardCard
          title="Skills Assessment vs Benchmark"
          subtitle="Student verified skill ratings compared against industry benchmark (0-100)"
          action={
            <Badge variant="primary" size="sm">
              Assessment
            </Badge>
          }
        >
          <div className="chart-card-body" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={skillsProficiency}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="skill"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-chart-tooltip">
                          <span className="tooltip-title">{label}</span>
                          {payload.map((entry) => (
                            <div key={entry.name} className="tooltip-item">
                              <span style={{ color: entry.color }}>{entry.name}:</span>
                              <strong>{entry.value} / 100</strong>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar
                  dataKey="studentScore"
                  name="Student Rating"
                  fill="#4f46e5"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                />
                <Bar
                  dataKey="benchmark"
                  name="Industry Benchmark"
                  fill="#94a3b8"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>

      {/* 4. Domain / Category Breakdown */}
      <DashboardCard
        title="Internship Domain Distribution"
        subtitle="Distribution of applications across technical specializations and roles"
      >
        <div className="domain-progress-list">
          {domainDistribution.map((item) => (
            <div key={item.domain} className="domain-progress-row">
              <div className="domain-progress-label">
                <span>{item.domain}</span>
                <span>
                  {item.applications} applications ({item.percentage}%)
                </span>
              </div>
              <div className="domain-progress-bar-bg">
                <div className="domain-progress-bar-fill" style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
