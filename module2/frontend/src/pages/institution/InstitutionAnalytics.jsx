import { IconAnalytics } from '../../components/common/Icons';

export default function InstitutionAnalytics() {
  return (
    <div className="page-container institution-analytics">
      <div className="page-header">
        <h2>Institution Analytics</h2>
        <p>College placement statistics, departmental trends, and employer satisfaction rates.</p>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          <IconAnalytics size={28} />
        </div>
        <h3 className="placeholder-title">Institutional Intelligence & Reports</h3>
        <p className="placeholder-desc">
          Placement percentage analytics, cohort progress charts, and accreditation reports will be implemented in Phase 4.
        </p>
      </div>
    </div>
  );
}
