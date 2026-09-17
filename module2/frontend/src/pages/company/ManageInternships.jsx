import { useState } from 'react';
import { IconBriefcase } from '../../components/common/Icons';

const initialInternships = [
  {
    id: 1,
    title: 'Machine Learning Intern',
    department: 'AI / ML',
    location: 'Pune',
    type: 'Full-time',
    stipend: '₹25,000 / month',
    duration: '6 Months',
    applicants: 48,
    status: 'Published',
  },
  {
    id: 2,
    title: 'Frontend Developer Intern',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    stipend: '₹20,000 / month',
    duration: '4 Months',
    applicants: 36,
    status: 'Published',
  },
  {
    id: 3,
    title: 'Data Analytics Intern',
    department: 'Analytics',
    location: 'Mumbai',
    type: 'Full-time',
    stipend: '₹22,000 / month',
    duration: '6 Months',
    applicants: 29,
    status: 'Draft',
  },
];

export default function ManageInternships() {
  const [internships, setInternships] = useState(initialInternships);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    stipend: '',
    duration: '',
    eligibility: '',
    description: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      stipend: '',
      duration: '',
      eligibility: '',
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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title || !formData.department || !formData.location) {
      alert('Please fill in the required fields.');
      return;
    }

    if (editingId) {
      setInternships(
        internships.map((internship) =>
          internship.id === editingId
            ? {
                ...internship,
                title: formData.title,
                department: formData.department,
                location: formData.location,
                type: formData.type,
                stipend: formData.stipend || 'Not specified',
                duration: formData.duration || 'Not specified',
              }
            : internship
        )
      );

      alert('Internship updated successfully.');
    } else {
      const newInternship = {
        id: Date.now(),
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        stipend: formData.stipend || 'Not specified',
        duration: formData.duration || 'Not specified',
        applicants: 0,
        status: 'Draft',
      };

      setInternships([...internships, newInternship]);

      alert('Internship created successfully.');
    }

    resetForm();
  };

  const handleEdit = (internship) => {
    setFormData({
      title: internship.title,
      department: internship.department,
      location: internship.location,
      type: internship.type,
      stipend: internship.stipend,
      duration: internship.duration,
      eligibility: '',
      description: '',
    });

    setEditingId(internship.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to archive this internship?'
    );

    if (confirmed) {
      setInternships(
        internships.map((internship) =>
          internship.id === id
            ? { ...internship, status: 'Archived' }
            : internship
        )
      );
    }
  };

  const handlePublish = (id) => {
    setInternships(
      internships.map((internship) =>
        internship.id === id
          ? { ...internship, status: 'Published' }
          : internship
      )
    );

    alert('Internship published successfully.');
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
    <div className="page-container manage-internships">
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
          className="primary-button"
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + Create Internship
        </button>
      </div>

      {/* Overview */}
      <div className="profile-card">
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
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Postings</span>
          <strong className="stat-value">{internships.length}</strong>
          <span className="stat-subtitle">All internship records</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Published</span>
          <strong className="stat-value">
            {internships.filter((item) => item.status === 'Published').length}
          </strong>
          <span className="stat-subtitle">Currently visible to students</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Drafts</span>
          <strong className="stat-value">
            {internships.filter((item) => item.status === 'Draft').length}
          </strong>
          <span className="stat-subtitle">Ready to publish</span>
        </div>

        <div className="stat-card">
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
        <div className="profile-section">
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
      <div className="profile-section">
        <div className="section-title">
          <h3>Internship Listings</h3>
          <p>Search and manage all internship opportunities</p>
        </div>

        <div className="filter-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search internship or department..."
          />

          {['All', 'Published', 'Draft', 'Archived'].map((status) => (
            <button
              key={status}
              className={
                statusFilter === status
                  ? 'primary-button'
                  : 'secondary-button'
              }
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="data-table">
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
              {filteredInternships.length > 0 ? (
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
                      <span className="status-badge">
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

                        {internship.status === 'Draft' && (
                          <button
                            className="primary-button"
                            onClick={() => handlePublish(internship.id)}
                          >
                            Publish
                          </button>
                        )}

                        {internship.status !== 'Archived' && (
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