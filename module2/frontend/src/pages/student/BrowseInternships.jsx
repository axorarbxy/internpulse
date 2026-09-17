import { useMemo, useState } from 'react';
import { IconBriefcase } from '../../components/common/Icons';

const internships = [
  {
    id: 1,
    title: 'Machine Learning Intern',
    company: 'TechNova Solutions',
    domain: 'Machine Learning',
    location: 'Pune',
    stipend: '₹15,000/month',
    duration: '6 Months',
    eligibility: 'B.Tech CSE / AIML',
    match: 94,
    skills: ['Python', 'Machine Learning', 'Pandas'],
  },
  {
    id: 2,
    title: 'Frontend Developer Intern',
    company: 'WebCraft Technologies',
    domain: 'Web Development',
    location: 'Remote',
    stipend: '₹12,000/month',
    duration: '4 Months',
    eligibility: 'B.Tech CSE / IT',
    match: 87,
    skills: ['React', 'JavaScript', 'CSS'],
  },
  {
    id: 3,
    title: 'Data Analytics Intern',
    company: 'DataSphere Analytics',
    domain: 'Data Analytics',
    location: 'Mumbai',
    stipend: '₹10,000/month',
    duration: '3 Months',
    eligibility: 'B.Tech CSE / AIML',
    match: 82,
    skills: ['Python', 'SQL', 'Power BI'],
  },
  {
    id: 4,
    title: 'Cyber Security Intern',
    company: 'SecureNet Technologies',
    domain: 'Cyber Security',
    location: 'Bengaluru',
    stipend: '₹18,000/month',
    duration: '6 Months',
    eligibility: 'B.Tech CSE / IT',
    match: 79,
    skills: ['Networking', 'Linux', 'Security'],
  },
];

export default function BrowseInternships() {
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('All');
  const [location, setLocation] = useState('All');
  const [stipend, setStipend] = useState('All');
  const [applied, setApplied] = useState([]);

  const domains = ['All', ...new Set(internships.map((item) => item.domain))];
  const locations = ['All', ...new Set(internships.map((item) => item.location))];

  const filteredInternships = useMemo(() => {
    return internships.filter((internship) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        internship.title.toLowerCase().includes(searchText) ||
        internship.company.toLowerCase().includes(searchText) ||
        internship.skills.some((skill) =>
          skill.toLowerCase().includes(searchText)
        );

      const matchesDomain =
        domain === 'All' || internship.domain === domain;

      const matchesLocation =
        location === 'All' || internship.location === location;

      const numericStipend = Number(
        internship.stipend.replace(/[^\d]/g, '')
      );

      const matchesStipend =
        stipend === 'All' ||
        (stipend === 'Below ₹12,000' && numericStipend < 12000) ||
        (stipend === '₹12,000 - ₹15,000' &&
          numericStipend >= 12000 &&
          numericStipend <= 15000) ||
        (stipend === 'Above ₹15,000' && numericStipend > 15000);

      return (
        matchesSearch &&
        matchesDomain &&
        matchesLocation &&
        matchesStipend
      );
    });
  }, [search, domain, location, stipend]);

  const handleApply = (id) => {
    if (applied.includes(id)) return;

    setApplied((previous) => [...previous, id]);
  };

  return (
    <div className="page-container browse-internships">
      <div className="page-header">
        <h2>Browse Internships</h2>
        <p>
          Explore opportunities matched to your degree, skills, and preferences.
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <input
              type="text"
              placeholder="Search internships, companies or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />

            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="form-input"
            >
              {domains.map((item) => (
                <option key={item} value={item}>
                  {item === 'All' ? 'All Domains' : item}
                </option>
              ))}
            </select>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
            >
              {locations.map((item) => (
                <option key={item} value={item}>
                  {item === 'All' ? 'All Locations' : item}
                </option>
              ))}
            </select>

            <select
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
              className="form-input"
            >
              <option value="All">All Stipends</option>
              <option value="Below ₹12,000">Below ₹12,000</option>
              <option value="₹12,000 - ₹15,000">₹12,000 - ₹15,000</option>
              <option value="Above ₹15,000">Above ₹15,000</option>
            </select>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <strong>{filteredInternships.length}</strong> internships found
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredInternships.map((internship) => {
              const isApplied = applied.includes(internship.id);

              return (
                <div
                  key={internship.id}
                  className="card"
                  style={{ padding: '20px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div
                        className="placeholder-icon-wrap"
                        style={{
                          width: '44px',
                          height: '44px',
                          marginBottom: '12px',
                        }}
                      >
                        <IconBriefcase size={22} />
                      </div>

                      <h3 style={{ marginBottom: '6px' }}>
                        {internship.title}
                      </h3>

                      <p style={{ marginBottom: '12px' }}>
                        {internship.company}
                      </p>
                    </div>

                    <span className="badge">
                      {internship.match}% Match
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    {internship.skills.map((skill) => (
                      <span key={skill} className="badge">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div style={{ lineHeight: '1.8' }}>
                    <div>📍 {internship.location}</div>
                    <div>💰 {internship.stipend}</div>
                    <div>⏱️ {internship.duration}</div>
                    <div>🎓 {internship.eligibility}</div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      marginTop: '18px',
                    }}
                    onClick={() => handleApply(internship.id)}
                    disabled={isApplied}
                  >
                    {isApplied ? '✓ Application Submitted' : 'Apply Now'}
                  </button>
                </div>
              );
            })}
          </div>

          {filteredInternships.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              <IconBriefcase size={36} />
              <h3>No internships found</h3>
              <p>Try changing your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}