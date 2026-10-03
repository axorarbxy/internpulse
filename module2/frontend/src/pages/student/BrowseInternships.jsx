import { useEffect, useMemo, useState } from 'react';
import { IconBriefcase, IconSearch } from '../../components/common/Icons';
import apiRequest from '../../services/api';

export default function BrowseInternships() {
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('All');
  const [location, setLocation] = useState('All');
  const [stipend, setStipend] = useState('All');
  const [internships, setInternships] = useState([]);
  const [applied, setApplied] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    let isSubscribed = true;

    Promise.allSettled([apiRequest('/internships'), apiRequest('/applications/my')])
      .then(([internshipsResult, applicationsResult]) => {
        if (!isSubscribed) return;

        if (internshipsResult.status === 'rejected') {
          setError(internshipsResult.reason?.message || 'Unable to load internships.');
          setLoading(false);
          return;
        }

        const records = internshipsResult.value?.internships || [];
        setInternships(records.map((internship) => ({
          ...internship,
          company: internship.company_name || 'Company',
          domain: internship.domain || 'General',
          location: internship.location || 'Location not specified',
          stipend: internship.stipend ? `₹${internship.stipend}/month` : 'Stipend not specified',
          duration: internship.duration_months ? `${internship.duration_months} Months` : 'Duration not specified',
          eligibility: internship.eligibility || 'See internship description',
          match: internship.match_score || null,
          skills: Array.isArray(internship.skills_required)
            ? internship.skills_required
            : String(internship.skills_required || '').split(',').map((skill) => skill.trim()).filter(Boolean),
        })));

        if (applicationsResult.status === 'fulfilled') {
          setApplied((applicationsResult.value?.applications || []).map((application) => application.internship_id));
        }
        setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

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
  }, [internships, search, domain, location, stipend]);

  const hasActiveFilters = Boolean(search.trim()) || domain !== 'All' || location !== 'All' || stipend !== 'All';

  const clearFilters = () => {
    setSearch('');
    setDomain('All');
    setLocation('All');
    setStipend('All');
  };

  const handleApply = async (id) => {
    if (applied.includes(id) || applyingId) return;

    setApplyingId(id);
    setError('');
    try {
      await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify({ internship_id: id }),
      });
      setApplied((previous) => [...previous, id]);
    } catch (err) {
      setError(err.message || 'Unable to submit application.');
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading internships...</p></div>;
  }

  return (
    <div className="page-container browse-internships">
      <div className="page-header">
        <h2>Browse Internships</h2>
        <p>
          Explore opportunities matched to your degree, skills, and preferences.
        </p>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="browse-filter-bar">
        <label className="browse-search-field">
          <IconSearch size={18} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search internships, companies, or skills"
            placeholder="Search internships, companies, or skills"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <select aria-label="Filter by domain" value={domain} onChange={(e) => setDomain(e.target.value)}>
          {domains.map((item) => (
            <option key={item} value={item}>{item === 'All' ? 'All domains' : item}</option>
          ))}
        </select>

        <select aria-label="Filter by location" value={location} onChange={(e) => setLocation(e.target.value)}>
          {locations.map((item) => (
            <option key={item} value={item}>{item === 'All' ? 'All locations' : item}</option>
          ))}
        </select>

        <select aria-label="Filter by stipend" value={stipend} onChange={(e) => setStipend(e.target.value)}>
          <option value="All">Any stipend</option>
          <option value="Below ₹12,000">Below ₹12,000</option>
          <option value="₹12,000 - ₹15,000">₹12,000 - ₹15,000</option>
          <option value="Above ₹15,000">Above ₹15,000</option>
        </select>
      </div>

      <div className="browse-results-heading" aria-live="polite">
        <p><strong>{filteredInternships.length}</strong> {filteredInternships.length === 1 ? 'internship' : 'internships'} found</p>
        {hasActiveFilters && <button type="button" className="browse-clear-filters" onClick={clearFilters}>Clear filters</button>}
      </div>

      {filteredInternships.length > 0 ? (
        <div className="browse-internship-grid">
          {filteredInternships.map((internship) => {
            const isApplied = applied.includes(internship.id);

            return (
              <article key={internship.id} className="browse-internship-card">
                <div className="browse-internship-heading">
                  <div className="browse-company-mark"><IconBriefcase size={21} /></div>
                  <div className="browse-internship-title">
                    <h3>{internship.title}</h3>
                    <p>{internship.company}</p>
                  </div>
                  {internship.match && <span className="browse-match-badge">{internship.match}% match</span>}
                </div>

                {internship.skills.length > 0 && (
                  <div className="browse-skill-list">
                    {internship.skills.map((skill) => <span key={skill}>{skill}</span>)}
                  </div>
                )}

                <dl className="browse-internship-details">
                  <div><dt>Location</dt><dd>{internship.location}</dd></div>
                  <div><dt>Monthly stipend</dt><dd>{internship.stipend}</dd></div>
                  <div><dt>Duration</dt><dd>{internship.duration}</dd></div>
                  <div><dt>Eligibility</dt><dd>{internship.eligibility}</dd></div>
                </dl>

                <button
                  type="button"
                  className={`btn ${isApplied ? 'btn-secondary' : 'btn-primary'} browse-apply-button`}
                  onClick={() => handleApply(internship.id)}
                  disabled={isApplied || applyingId === internship.id}
                >
                  {isApplied ? 'Application submitted' : applyingId === internship.id ? 'Submitting...' : 'Apply now'}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="browse-empty-state" role="status">
          <div className="browse-empty-icon"><IconBriefcase size={25} /></div>
          <h3>{internships.length === 0 ? 'No opportunities posted yet' : 'No internships match your filters'}</h3>
          <p>{internships.length === 0 ? 'Check back soon for new roles from our employers.' : 'Try a broader search or clear your filters to see more roles.'}</p>
          {hasActiveFilters && <button type="button" className="btn btn-outline browse-reset-button" onClick={clearFilters}>Clear all filters</button>}
        </div>
      )}
    </div>
  );
}