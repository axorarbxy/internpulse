import { IconCheckCircle } from '../../components/common/Icons';

export default function StudentMonitoring() {
  return (
    <div className="page-container student-monitoring">
      <div className="page-header">
        <h2>Student Monitoring</h2>
        <p>Real-time attendance logs, mentor evaluations, and weekly timesheet approvals.</p>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          <IconCheckCircle size={28} />
        </div>
        <h3 className="placeholder-title">Faculty Advisor Supervision</h3>
        <p className="placeholder-desc">
          Weekly log verification, mid-term evaluation reports, and student attendance alerts will be implemented in Phase 4.
        </p>
      </div>
    </div>
  );
}
