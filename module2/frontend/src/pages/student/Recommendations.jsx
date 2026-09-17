import { useMemo, useState } from 'react';
import { IconSparkles } from '../../components/common/Icons';

const internships = [
  {
    id: 1,
    title: 'Machine Learning Intern',
    company: 'TechNova Solutions',
    location: 'Pune, Maharashtra',
    mode: 'Hybrid',
    duration: '3 Months',
    match: 94,
    skills: ['Python', 'Machine Learning', 'SQL'],
    reason: 'Strong match with your AIML background and Python skills.',
  },
  {
    id: 2,
    title: 'Frontend Developer Intern',
    company: 'WebCraft Technologies',
    location: 'Remote',
    mode: 'Remote',
    duration: '4 Months',
    match: 87,
    skills: ['React', 'JavaScript', 'HTML/CSS'],
    reason: 'Your React knowledge matches the technical requirements.',
  },
  {
    id: 3,
    title: 'Data Analytics Intern',
    company: 'DataSphere Labs',
    location: 'Mumbai, Maharashtra',
    mode: 'Hybrid',
    duration: '3 Months',
    match: 82,
    skills: ['Python', 'SQL', 'Data Analytics'],
    reason: 'Suitable for your interest in data-driven applications.',
  },
];

const skillGaps = [
  {
    skill: 'Advanced Python',
    level: 75,
    suggestion: 'Practice data structures, APIs and Python projects.',
  },
  {
    skill: 'Machine Learning',
    level: 68,
    suggestion: 'Strengthen model evaluation and feature engineering.',
  },
  {
    skill: 'Data Visualization',
    level: 55,
    suggestion: 'Practice Power BI, Tableau and interactive charts.',
  },
];

export default function Recommendations() {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  const domains = ['All', 'Machine Learning', 'Frontend', 'Data Analytics'];

  const filteredInternships = useMemo(() => {
    return internships.filter((internship) => {
      const matchesSearch =
        internship.title.toLowerCase().includes(search.toLowerCase()) ||
        internship.company.toLowerCase().includes(search.toLowerCase());

      const matchesDomain =
        selectedDomain === 'All' ||
        internship.title.toLowerCase().includes(selectedDomain.toLowerCase()) ||
        internship.skills.some((skill) =>
          skill.toLowerCase().includes(selectedDomain.toLowerCase())
        );

      return matchesSearch && matchesDomain;
    });
  }, [search, selectedDomain]);

  const handleView = (title) => {
    alert(`Opening internship: ${title}`);
  };

  return (
    <div className="page-container recommendations">
      <div className="page-header">
        <div>
          <h2>AI Recommendations</h2>
          <p>
            Curated internship postings and skill gap suggestions based on
            your academic path.
          </p>
        </div>
      </div>

      {/* AI Summary */}
      <div className="profile-card">
        <div className="profile-avatar">
          <IconSparkles size={34} />
        </div>

        <div className="profile-heading">
          <h3>Smart Match Engine</h3>
          <p>
            Your profile has been analyzed using your skills, academic
            background and internship interests.
          </p>
          <span className="profile-status">AI Matching Active</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Recommended Internships</h3>
          <p>Internships matched with your current profile</p>
        </div>

        <div className="recommendation-controls">
          <input
            type="text"
            placeholder="Search internships or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
          >
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>

        <div className="recommendation-list">
          {filteredInternships.map((internship) => (
            <div className="recommendation-card" key={internship.id}>
              <div className="recommendation-header">
                <div>
                  <h3>{internship.title}</h3>
                  <p>{internship.company}</p>
                </div>

                <div className="match-score">
                  {internship.match}% Match
                </div>
              </div>

              <div className="recommendation-meta">
                <span>{internship.location}</span>
                <span>{internship.mode}</span>
                <span>{internship.duration}</span>
              </div>

              <div className="skills-preview">
                {internship.skills.map((skill) => (
                  <span className="skill-badge" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>

              <p className="recommendation-reason">
                <strong>Why recommended:</strong> {internship.reason}
              </p>

              <button
                className="primary-button"
                onClick={() => handleView(internship.title)}
              >
                View Internship
              </button>
            </div>
          ))}
        </div>

        {filteredInternships.length === 0 && (
          <p className="placeholder-desc">
            No matching internships found.
          </p>
        )}
      </div>

      {/* Skill Gap Analysis */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Skill Gap Suggestions</h3>
          <p>Skills that can improve your internship readiness</p>
        </div>

        <div className="skill-gap-list">
          {skillGaps.map((item) => (
            <div className="skill-gap-card" key={item.skill}>
              <div className="skill-gap-header">
                <strong>{item.skill}</strong>
                <span>{item.level}%</span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${item.level}%` }}
                />
              </div>

              <p>{item.suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Career Pathway */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Suggested Career Pathway</h3>
          <p>A possible learning path based on your current profile</p>
        </div>

        <div className="career-pathway">
          <div className="path-step">
            <span>1</span>
            <strong>Strengthen Core Skills</strong>
            <p>Python, SQL and programming fundamentals</p>
          </div>

          <div className="path-step">
            <span>2</span>
            <strong>Build AIML Projects</strong>
            <p>Create practical machine learning applications</p>
          </div>

          <div className="path-step">
            <span>3</span>
            <strong>Complete Internships</strong>
            <p>Apply your skills to real-world projects</p>
          </div>

          <div className="path-step">
            <span>4</span>
            <strong>Prepare for Placements</strong>
            <p>Practice DSA, interviews and technical assessments</p>
          </div>
        </div>
      </div>
    </div>
  );
}