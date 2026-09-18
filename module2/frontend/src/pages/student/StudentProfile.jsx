import { useState, useEffect } from 'react';
import { IconUser } from '../../components/common/Icons';
import { studentService } from '../../services';

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const localUser = JSON.parse(window.localStorage.getItem('internpulse_user') || '{}');

  const [profile, setProfile] = useState({
    name: localUser.name || 'Student Name',
    email: localUser.email || 'student@internpulse.com',
    phone: '+91 98765 43210',
    studentId: localUser.id ? `STU-${localUser.id}` : 'STU2026-001',
    branch: 'CSE - AIML',
    semester: 'Semester 4',
    college: 'Kolhapur Institute of Technology',
    location: 'Kolhapur, Maharashtra',
    skills: 'Python, Java, Machine Learning, React, SQL',
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/',
    portfolio: 'https://example.com/',
  });

  useEffect(() => {
    studentService.getStudentProfile().then((data) => {
      if (data) {
        setProfile((prev) => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          college: data.college_name || prev.college,
          branch: data.branch || prev.branch,
          semester: data.year ? `Year ${data.year}` : prev.semester,
          skills: data.skills || prev.skills,
        }));
      }
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await studentService.updateStudentProfile({
        college_name: profile.college,
        branch: profile.branch,
        course: profile.branch,
        year: parseInt(profile.semester.replace(/\D/g, '')) || 3,
        skills: profile.skills,
        phone: profile.phone,
      });
      setIsEditing(false);
      alert('Profile updated and saved to database successfully!');
    } catch (err) {
      alert('Failed to save profile: ' + (err.message || 'Error occurred'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container student-profile">
      <div className="page-header">
        <div>
          <h2>Student Profile</h2>
          <p>
            Manage personal details, academic information, skills and portfolio links.
          </p>
        </div>

        {!isEditing ? (
          <button
            className="primary-button"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        ) : (
          <div className="profile-actions">
            <button
              className="secondary-button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="profile-card">
        <div className="profile-avatar">
          <IconUser size={36} />
        </div>

        <div className="profile-heading">
          <h3>{profile.name}</h3>
          <p>{profile.branch}</p>
          <span className="profile-status">Active Student</span>
        </div>

        <div className="profile-completeness">
          <div className="completeness-top">
            <span>Profile Completeness</span>
            <strong>88%</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: '88%' }}
            />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Personal Information</h3>
          <p>Your basic contact information</p>
        </div>

        <div className="profile-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={profile.location}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Academic Information */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Academic Information</h3>
          <p>Your current academic details</p>
        </div>

        <div className="profile-grid">
          <div className="form-group">
            <label>Student ID</label>
            <input
              type="text"
              value={profile.studentId}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Branch</label>
            <input
              type="text"
              name="branch"
              value={profile.branch}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Semester</label>
            <input
              type="text"
              name="semester"
              value={profile.semester}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>College / Institution</label>
            <input
              type="text"
              name="college"
              value={profile.college}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Skills</h3>
          <p>Add your technical and professional skills</p>
        </div>

        <div className="form-group">
          <label>Skills</label>
          <textarea
            name="skills"
            value={profile.skills}
            onChange={handleChange}
            disabled={!isEditing}
            rows="3"
            placeholder="Example: Python, Java, SQL, React"
          />
        </div>

        <div className="skills-preview">
          {profile.skills
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean)
            .map((skill) => (
              <span className="skill-badge" key={skill}>
                {skill}
              </span>
            ))}
        </div>
      </div>

      {/* Portfolio */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Portfolio & Professional Links</h3>
          <p>Connect your professional profiles</p>
        </div>

        <div className="profile-grid">
          <div className="form-group">
            <label>GitHub</label>
            <input
              type="url"
              name="github"
              value={profile.github}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>LinkedIn</label>
            <input
              type="url"
              name="linkedin"
              value={profile.linkedin}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group full-width">
            <label>Portfolio Website</label>
            <input
              type="url"
              name="portfolio"
              value={profile.portfolio}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Resume */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Resume & Documents</h3>
          <p>Manage your resume and academic documents</p>
        </div>

        <div className="document-card">
          <div>
            <strong>Student Resume</strong>
            <p>Resume available for internship applications</p>
          </div>

          <button
            className="secondary-button"
            onClick={() => alert('Resume Builder opened')}
          >
            Open Resume Builder
          </button>
        </div>
      </div>
    </div>
  );
}
