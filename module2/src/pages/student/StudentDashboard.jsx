import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  Briefcase,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>

      <div className="stat-icon">
        {icon}
      </div>
    </div>
  );
}

function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const studentId = localStorage.getItem("studentId") || "student-1";
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/intelligence/dashboard/${studentId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((response) => {
        if (!response.ok) throw new Error("Dashboard services are unavailable");
        return response.json();
      })
      .then(setDashboard)
      .catch((requestError) => setError(requestError.message));
  }, []);

  const recommendations = dashboard?.recommendations?.recommendations || [];
  const grievances = dashboard?.grievances?.total || 0;
  const fraudFlags = dashboard?.fraud_flags?.total || 0;

  return (
    <DashboardLayout>

      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome back! Track your internship journey here.</p>
        </div>
      </div>

      <div className="stats-grid">

        <StatCard
          title="Applications"
          value={recommendations.length || "-"}
          icon={<FileText size={25} />}
        />

        <StatCard
          title="Active Internships"
          value={dashboard ? "1" : "-"}
          icon={<Briefcase size={25} />}
        />

        <StatCard
          title="Completed"
          value={grievances}
          icon={<CheckCircle size={25} />}
        />

        <StatCard
          title="Pending"
          value={fraudFlags}
          icon={<Clock size={25} />}
        />

      </div>

      <div className="dashboard-grid">

        <section className="dashboard-card">
          <h2>Current Internship</h2>

          <h3>Machine Learning Intern</h3>

          <p>ABC Technologies</p>

          <div className="progress-info">
            <span>Progress</span>
            <span>75%</span>
          </div>

          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>

          <p className="hours">
            Hours completed: 90 / 120
          </p>

        </section>


        <section className="dashboard-card">
          <h2>Quick Actions</h2>

          <button className="dashboard-button">
            Search Internships
          </button>

          <button className="dashboard-button">
            View My Internships
          </button>

          <button className="dashboard-button">
            View Certificates
          </button>

        </section>

      </div>

      <section className="dashboard-card recommendations-card">
        <h2>Recommended Internships</h2>
        {error && <p>{error}</p>}
        {!error && recommendations.length === 0 && <p>Recommendations will appear here once your profile is analyzed.</p>}
        {recommendations.slice(0, 3).map((recommendation) => (
          <p key={recommendation.internship_id}>
            <strong>{recommendation.title}</strong> at {recommendation.company}
          </p>
        ))}
      </section>

    </DashboardLayout>
  );
}

export default StudentDashboard;
