import { IconBriefcase } from '../../components/common/Icons';

export default function CompanyDashboard() {
  return (
    <div className="page-container company-dashboard">
      <div className="page-header">
        <h2>Company Dashboard</h2>
        <p>Manage employer postings, candidate pipelines, and active internship cohorts.</p>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          <IconBriefcase size={28} />
        </div>
        <h3 className="placeholder-title">Company Hiring & Management Hub</h3>
        <p className="placeholder-desc">
          Posting metrics, active candidate pipeline, interview scheduling, and intern monitoring will be implemented in Phase 5.
        </p>
      </div>
    </div>
  );
}
