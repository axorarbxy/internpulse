import { useEffect, useState } from 'react';
import { studentService } from '../../services';
import { IconSparkles } from '../../components/common/Icons';
import { useNavigation } from '../../context';

export default function Recommendations() {
  const { setActiveTab } = useNavigation();
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
        <h2>Internship Recommendations</h2>
        <p>Ranked against your saved skills, with matching and missing skills shown for each role.</p>
      </div>

      {loading && <div className="loading-container"><div className="spinner" /><p>Finding roles that match your profile...</p></div>}
      {error && <div className="placeholder-card"><h3 className="placeholder-title">Recommendations unavailable</h3><p className="placeholder-desc">{error}</p></div>}
      {!loading && !error && recommendations.length === 0 && <div className="placeholder-card"><h3 className="placeholder-title">No matches yet</h3><p className="placeholder-desc">Complete your student profile with skills to receive recommendations.</p></div>}
      {!loading && !error && recommendations.length > 0 && <div className="recommendation-grid">
        {recommendations.map((recommendation) => (
          <article className="recommendation-card" key={recommendation.internship_id}>
            <div className="recommendation-card-topline">
              <span className="recommendation-match">
                <IconSparkles size={14} />
                <strong>{Math.round((recommendation.score || 0) * 100)}%</strong> match
              </span>
              {recommendation.score >= 0.85 && <span className="recommendation-fit">Strong fit</span>}
            </div>
            <div className="recommendation-card-heading">
              <h3>{recommendation.title}</h3>
              <p>{recommendation.company || 'Company'} <span aria-hidden="true">·</span> {recommendation.domain || 'Internship opportunity'}</p>
            </div>
            <div className="recommendation-skill-group">
              <span className="recommendation-skill-label">Matched skills</span>
              <div className="recommendation-skill-list">
                {(recommendation.matched_skills || recommendation.matchedSkills || []).length > 0
                  ? (recommendation.matched_skills || recommendation.matchedSkills).map((skill) => (
                    <span className="recommendation-skill-chip" key={skill}>{skill}</span>
                  ))
                  : <span className="recommendation-no-match">No direct matches yet</span>}
              </div>
            </div>
            {recommendation.missing_skills?.length > 0 && (
              <div className="recommendation-gap">
                <span className="recommendation-skill-label">Skills to build</span>
                <p>{recommendation.missing_skills.join(', ')}</p>
              </div>
            )}
            <footer className="recommendation-card-footer">
              <span>{(recommendation.matched_skills || recommendation.matchedSkills || []).length} skills aligned</span>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setActiveTab('browse')}>
                View Internship
              </button>
            </footer>
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
