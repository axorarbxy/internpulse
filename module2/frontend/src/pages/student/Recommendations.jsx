import { IconSparkles } from '../../components/common/Icons';

export default function Recommendations() {
  return (
    <div className="page-container recommendations">
      <div className="page-header">
        <h2>AI Recommendations</h2>
        <p>Curated internship postings and skill gap suggestions based on your academic path.</p>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          <IconSparkles size={28} />
        </div>
        <h3 className="placeholder-title">Smart Match & Recommendation Engine</h3>
        <p className="placeholder-desc">
          Expanded AI recommendations, career pathway matching, and faculty endorsements will be implemented in Phase 6.
        </p>
      </div>
    </div>
  );
}
