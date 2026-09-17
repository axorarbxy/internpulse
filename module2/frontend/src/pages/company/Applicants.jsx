import { IconUsers } from '../../components/common/Icons';

export default function Applicants() {
  return (
    <div className="page-container applicants">
      <div className="page-header">
        <h2>Applicants & Candidate Pipeline</h2>
        <p>Review incoming student applications, match scores, and interview stages.</p>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          <IconUsers size={28} />
        </div>
        <h3 className="placeholder-title">Candidate Pipeline & Review</h3>
        <p className="placeholder-desc">
          Candidate filtering, resume parsing, interview scheduling, and offer letters will be implemented in Phase 5.
        </p>
      </div>
    </div>
  );
}
