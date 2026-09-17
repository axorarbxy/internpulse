import { useState } from 'react';
import { IconFileText } from '../../components/common/Icons';

export default function ResumeBuilder() {
  const [isEditing, setIsEditing] = useState(false);

  const [resume, setResume] = useState({
    name: 'Bhakti Shrikant Kadam',
    email: 'bhakti@example.com',
    phone: '+91 98765 43210',
    careerObjective:
      'B.Tech CSE-AIML student interested in software development, machine learning and data-driven applications.',
    education:
      'B.Tech CSE - AIML, Kolhapur Institute of Technology',
    skills: 'Python, Java, Machine Learning, React, SQL',
    projects:
      'CyberEye - AI-driven threat detection platform',
    experience:
      'Academic projects and internship preparation',
    achievements:
      'Participated in technical projects and hackathons',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setResume((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    alert('Resume details saved successfully!');
  };

  const handleDownload = () => {
    alert('Resume PDF generation started.');
  };

  return (
    <div className="page-container resume-builder">
      <div className="page-header">
        <div>
          <h2>Resume Builder</h2>
          <p>
            Generate industry-ready ATS-compliant resumes tailored for
            internship roles.
          </p>
        </div>

        {!isEditing ? (
          <div className="profile-actions">
            <button
              className="secondary-button"
              onClick={() => setIsEditing(true)}
            >
              Edit Resume
            </button>

            <button
              className="primary-button"
              onClick={handleDownload}
            >
              Download Resume
            </button>
          </div>
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
            >
              Save Resume
            </button>
          </div>
        )}
      </div>

      {/* Resume Header */}
      <div className="profile-card">
        <div className="profile-avatar">
          <IconFileText size={36} />
        </div>

        <div className="profile-heading">
          <h3>{resume.name}</h3>
          <p>CSE - AIML | Internship Resume</p>
          <span className="profile-status">ATS Ready</span>
        </div>
      </div>

      {/* Personal Details */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Personal Details</h3>
          <p>Information displayed at the top of your resume</p>
        </div>

        <div className="profile-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={resume.name}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={resume.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={resume.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Career Objective */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Career Objective</h3>
          <p>A short professional summary</p>
        </div>

        <div className="form-group">
          <textarea
            name="careerObjective"
            value={resume.careerObjective}
            onChange={handleChange}
            disabled={!isEditing}
            rows="4"
          />
        </div>
      </div>

      {/* Education */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Education</h3>
          <p>Your academic qualification</p>
        </div>

        <div className="form-group">
          <textarea
            name="education"
            value={resume.education}
            onChange={handleChange}
            disabled={!isEditing}
            rows="3"
          />
        </div>
      </div>

      {/* Skills */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Technical Skills</h3>
          <p>Skills relevant to internship applications</p>
        </div>

        <div className="form-group">
          <textarea
            name="skills"
            value={resume.skills}
            onChange={handleChange}
            disabled={!isEditing}
            rows="3"
          />
        </div>

        <div className="skills-preview">
          {resume.skills
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

      {/* Projects */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Projects</h3>
          <p>Highlight your important academic or personal projects</p>
        </div>

        <div className="form-group">
          <textarea
            name="projects"
            value={resume.projects}
            onChange={handleChange}
            disabled={!isEditing}
            rows="4"
          />
        </div>
      </div>

      {/* Experience */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Experience</h3>
          <p>Internship, training or practical experience</p>
        </div>

        <div className="form-group">
          <textarea
            name="experience"
            value={resume.experience}
            onChange={handleChange}
            disabled={!isEditing}
            rows="3"
          />
        </div>
      </div>

      {/* Achievements */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Achievements</h3>
          <p>Certifications, hackathons and other achievements</p>
        </div>

        <div className="form-group">
          <textarea
            name="achievements"
            value={resume.achievements}
            onChange={handleChange}
            disabled={!isEditing}
            rows="3"
          />
        </div>
      </div>

      {/* Resume Preview */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Resume Preview</h3>
          <p>Preview the information that will appear on your resume</p>
        </div>

        <div className="resume-preview">
          <h2>{resume.name}</h2>
          <p>
            {resume.email} | {resume.phone}
          </p>

          <hr />

          <h4>Career Objective</h4>
          <p>{resume.careerObjective}</p>

          <h4>Education</h4>
          <p>{resume.education}</p>

          <h4>Technical Skills</h4>
          <p>{resume.skills}</p>

          <h4>Projects</h4>
          <p>{resume.projects}</p>

          <h4>Experience</h4>
          <p>{resume.experience}</p>

          <h4>Achievements</h4>
          <p>{resume.achievements}</p>
        </div>
      </div>
    </div>
  );
}