import { useEffect, useState } from 'react';
import { studentService } from '../../services';
import { IconSparkles } from '../../components/common/Icons';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    studentService
      .getRecommendedInternships()
      .then((response) => setRecommendations(response.recommendations || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container recommendations">
      <div className="page-header">
        <h2>AI Recommendations</h2>
        <p>Curated internship postings and skill gap suggestions based on your academic path.</p>
      </div>

      {loading && <div className="loading-container"><div className="spinner" /><p>Loading live recommendations...</p></div>}
      {error && <div className="placeholder-card"><h3 className="placeholder-title">Recommendations unavailable</h3><p className="placeholder-desc">{error}</p></div>}
      {!loading && !error && recommendations.length === 0 && <div className="placeholder-card"><h3 className="placeholder-title">No matches yet</h3><p className="placeholder-desc">Complete your student profile with skills to receive recommendations.</p></div>}
      {!loading && !error && recommendations.length > 0 && <div className="dashboard-main-grid">
        {recommendations.map((recommendation) => (
          <article className="dashboard-card" key={recommendation.internship_id}>
            <div className="dashboard-card-body">
              <span className="badge badge-purple"><IconSparkles size={12} /> {Math.round(recommendation.score * 100)}% match</span>
              <h3>{recommendation.title}</h3>
              <p>{recommendation.company} · {recommendation.domain}</p>
              <p className="dashboard-card-subtitle">Matched skills: {recommendation.matched_skills.join(', ') || 'Profile skills pending'}</p>
            </div>
          </article>
        ))}
      </div>}
      {!loading && !error && recommendations.length === 0 && <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          <IconSparkles size={28} />
        </div>
        <h3 className="placeholder-title">Smart Match & Recommendation Engine</h3>
        <p className="placeholder-desc">
          Expanded AI recommendations, career pathway matching, and faculty endorsements will be implemented in Phase 6.
        </p>
      </div>}
    </div>
  );
}
