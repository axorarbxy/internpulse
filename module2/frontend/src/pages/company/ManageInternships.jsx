import { useEffect, useState } from 'react';
import { IconBriefcase, IconSearch } from '../../components/common/Icons';
import companyService from '../../services/companyService';

export default function ManageInternships() {
  const [internships, setInternships] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    stipend: '',
    duration: '',
    status: 'Published',
    eligibility: '',
    requiredSkills: '',
    description: '',
  });

  const refreshInternships = async () => {
    setInternships(await companyService.getInternships());
  };

  useEffect(() => {
    let isActive = true;
    companyService.getInternships()
      .then((records) => { if (isActive) setInternships(records); })
      .catch((requestError) => { if (isActive) setError(requestError.message || 'Unable to load postings.'); })
      .finally(() => { if (isActive) setLoading(false); });
    return () => { isActive = false; };
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      stipend: '',
      duration: '',
      status: 'Published',
      eligibility: '',
      requiredSkills: '',
      description: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title || !formData.department || !formData.location) {
      alert('Please fill in the required fields.');
      return;
    }

    setError('');
    setNotice('');
    try {
      if (editingId) await companyService.updateInternship(editingId, formData);
      else await companyService.createInternship(formData);
      await refreshInternships();
      setNotice(editingId ? 'Internship updated.' : 'Internship created and published.');
      resetForm();
    } catch (requestError) {
      setError(requestError.message || 'Unable to save internship.');
    }
  };

  const handleEdit = (internship) => {
    setFormData({
      title: internship.title,
      department: internship.department,
      location: internship.location,
      type: internship.type,
      stipend: internship.stipend,
      duration: internship.duration,
      status: internship.status,
      eligibility: internship.eligibility || '',
      requiredSkills: internship.skills_required || '',
      description: '',
    });

    setEditingId(internship.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to archive this internship?'
    );

    if (confirmed) {
      try {
        await companyService.updateInternship(id, { status: 'Closed' });
        await refreshInternships();
      } catch (requestError) {
        setError(requestError.message || 'Unable to close posting.');
      }
    }
  };

  const handlePublish = async (id) => {
    try {
      await companyService.updateInternship(id, { status: 'Published' });
      await refreshInternships();
    } catch (requestError) {
      setError(requestError.message || 'Unable to publish posting.');
    }
  };

  const filteredInternships = internships.filter((internship) => {
    const matchesSearch =
      internship.title.toLowerCase().includes(search.toLowerCase()) ||
      internship.department.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || internship.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container company-dashboard manage-internships">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Manage Internships</h2>
          <p>
            Publish, edit, and archive internship listings and department job
            requisitions.
          </p>
        </div>

        <button
          type="button"
          className="primary-button manage-create-button"
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + Create Internship
        </button>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {notice && <div className="alert" role="status">{notice}</div>}

      {/* Overview */}
      <div className="profile-card manage-overview-card">
        <div className="profile-avatar">
          <IconBriefcase size={34} />
        </div>

        <div className="profile-heading">
          <h3>Internship Postings & Requisitions</h3>
          <p>
            Create internship roles, configure eligibility and manage posting
            status.
          </p>
          <span className="profile-status">Recruitment Management</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid manage-kpi-grid">
        <div className="stat-card manage-kpi-card">
          <span className="stat-label">Total Postings</span>
          <strong className="stat-value">{internships.length}</strong>
          <span className="stat-subtitle">All internship records</span>
        </div>

        <div className="stat-card manage-kpi-card">
          <span className="stat-label">Published</span>
          <strong className="stat-value">
            {internships.filter((item) => item.status === 'Published').length}
          </strong>
          <span className="stat-subtitle">Currently visible to students</span>
        </div>

        <div className="stat-card manage-kpi-card">
          <span className="stat-label">Closed</span>
          <strong className="stat-value">
            {internships.filter((item) => item.status === 'Closed').length}
          </strong>
          <span className="stat-subtitle">Not currently visible to students</span>
        </div>

        <div className="stat-card manage-kpi-card">
          <span className="stat-label">Total Applicants</span>
          <strong className="stat-value">
            {internships.reduce(
              (total, internship) => total + internship.applicants,
              0
            )}
          </strong>
          <span className="stat-subtitle">Across all postings</span>
        </div>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="profile-section manage-section-card">
          <div className="section-title">
            <h3>{editingId ? 'Edit Internship' : 'Create Internship'}</h3>
            <p>
              Add role details, eligibility criteria and internship
              requirements.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Internship Title *</label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Machine Learning Intern"
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. AI / ML"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Pune / Remote"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Internship Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stipend">Stipend</label>
                <input
                  id="stipend"
                  name="stipend"
                  value={formData.stipend}
                  onChange={handleChange}
                  placeholder="e.g. ₹25,000 / month"
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration</label>
                <input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 6 Months"
                />
              </div>

              <div className="form-group">
                <label htmlFor="eligibility">Eligibility</label>
                <input
                  id="eligibility"
                  name="eligibility"
                  value={formData.eligibility}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech CSE / AIML"
                />
              </div>

              <div className="form-group">
                <label htmlFor="requiredSkills">Required Skills</label>
                <input
                  id="requiredSkills"
                  name="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={handleChange}
                  placeholder="e.g. Python, SQL, React"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Job Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe responsibilities and required skills"
                />
              </div>
            </div>

            <div className="button-row">
              <button type="submit" className="primary-button">
                {editingId ? 'Update Internship' : 'Save Internship'}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="profile-section manage-section-card">
        <div className="section-title">
          <h3>Internship Listings</h3>
          <p>Search and manage all internship opportunities</p>
        </div>

        <div className="manage-filter-row">
          <label className="manage-search-field">
            <IconSearch size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search internship or department"
              aria-label="Search internship listings"
            />
          </label>

          <div className="manage-filter-tabs" role="group" aria-label="Filter listings by status">
            {['All', 'Published', 'Closed'].map((status) => (
              <button
                key={status}
                type="button"
                className={`manage-filter-tab${statusFilter === status ? ' active' : ''}`}
                aria-pressed={statusFilter === status}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper manage-table-wrap">
          <table className="data-table manage-table">
            <thead>
              <tr>
                <th>Internship</th>
                <th>Department</th>
                <th>Location</th>
                <th>Stipend</th>
                <th>Applicants</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan="7">Loading company postings...</td></tr>
              ) : filteredInternships.length > 0 ? (
                filteredInternships.map((internship) => (
                  <tr key={internship.id}>
                    <td>
                      <strong>{internship.title}</strong>
                      <br />
                      <small>{internship.duration}</small>
                    </td>

                    <td>{internship.department}</td>

                    <td>{internship.location}</td>

                    <td>{internship.stipend}</td>

                    <td>{internship.applicants}</td>

                    <td>
                      <span className={`manage-status-badge status-${internship.status.toLowerCase()}`}>
                        {internship.status}
                      </span>
                    </td>

                    <td>
                      <div className="button-row">
                        <button
                          className="secondary-button"
                          onClick={() => handleEdit(internship)}
                        >
                          Edit
                        </button>

                        {internship.status === 'Closed' && (
                          <button
                            className="primary-button"
                            onClick={() => handlePublish(internship.id)}
                          >
                            Reopen
                          </button>
                        )}

                        {internship.status !== 'Closed' && (
                          <button
                            className="secondary-button"
                            onClick={() => handleDelete(internship.id)}
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    No internship postings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}