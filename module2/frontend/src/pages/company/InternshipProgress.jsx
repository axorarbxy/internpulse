import { IconCheckCircle } from '../../components/common/Icons';

export default function InternshipProgress() {
  return (
    <div className="page-container internship-progress">
      <div className="page-header">
        <h2>Internship Progress & Evaluations</h2>
        <p>Track active student intern cohorts, sprint tasks, and supervisor evaluations.</p>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          <IconCheckCircle size={28} />
        </div>
        <h3 className="placeholder-title">Company Intern Monitoring & Evaluation</h3>
        <p className="placeholder-desc">
          Mentor reviews, weekly task approvals, and completion certificate sign-offs will be implemented in Phase 5.
        </p>
      </div>
    </div>
  );
}
