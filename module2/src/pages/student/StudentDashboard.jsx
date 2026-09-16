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
          value="8"
          icon={<FileText size={25} />}
        />

        <StatCard
          title="Active Internships"
          value="2"
          icon={<Briefcase size={25} />}
        />

        <StatCard
          title="Completed"
          value="3"
          icon={<CheckCircle size={25} />}
        />

        <StatCard
          title="Pending"
          value="4"
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

    </DashboardLayout>
  );
}

export default StudentDashboard;
