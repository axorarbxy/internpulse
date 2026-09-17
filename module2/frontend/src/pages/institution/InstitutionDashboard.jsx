import { IconBuilding } from '../../components/common/Icons';

export default function InstitutionDashboard() {
  return (
    <div className="page-container institution-dashboard">
      <div className="page-header">
        <h2>Institution Dashboard</h2>
        <p>Institutional oversight of student placements, faculty advisors, and industry partners.</p>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          <IconBuilding size={28} />
        </div>
        <h3 className="placeholder-title">Institution Overview & Department KPIs</h3>
        <p className="placeholder-desc">
          Total student enrollment, active internship monitoring, MOU tracking, and academic credit verification will be implemented in Phase 4.
        </p>
      </div>
    </div>
  );
}
