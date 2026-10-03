import { useState, useEffect } from 'react';
import { IconFileText, IconUser } from '../../components/common/Icons';
import { studentService } from '../../services';
import { useNavigation } from '../../context';
import {
  demoStudentPreferences,
  demoStudentProfile,
  demoStudentProjects,
  demoStudentResume,
  demoStudentSkillLevels,
} from '../../data/demoStudentProfile';

export default function StudentProfile() {
  const { setActiveTab } = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [profileBeforeEdit, setProfileBeforeEdit] = useState(null);

  const localUser = JSON.parse(window.localStorage.getItem('internpulse_user') || '{}');
  const savedProfile = (() => {
    try {
      return { ...demoStudentProfile, ...JSON.parse(window.localStorage.getItem('internpulse_profile') || '{}') };
    } catch {
      return demoStudentProfile;
    }
  })();

  const [profile, setProfile] = useState({
    name: savedProfile.name || localUser.name || 'Student Name',
    email: savedProfile.email || localUser.email || 'student@internpulse.com',
    phone: '+91 98765 43210',
    studentId: localUser.id ? `STU-${localUser.id}` : 'STU2026-001',
    branch: demoStudentProfile.branch,
    semester: demoStudentProfile.semester,
    college: demoStudentProfile.college,
    location: demoStudentProfile.location,
    skills: demoStudentProfile.skills,
    github: demoStudentProfile.github,
    linkedin: demoStudentProfile.linkedin,
    portfolio: demoStudentProfile.portfolio,
    ...savedProfile,
  });

  const [preferences, setPreferences] = useState(() => {
    try {
      return { ...demoStudentPreferences, ...JSON.parse(window.localStorage.getItem('internpulse_profile_preferences') || '{}') };
    } catch {
      return demoStudentPreferences;
    }
  });

  const [projects, setProjects] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('internpulse_profile_projects')) || demoStudentProjects;
    } catch {
      return [];
    }
  });

  const [skillLevels, setSkillLevels] = useState(() => {
    try {
      return { ...demoStudentSkillLevels, ...JSON.parse(window.localStorage.getItem('internpulse_profile_skill_levels') || '{}') };
    } catch {
      return demoStudentSkillLevels;
    }
  });

  const skillList = profile.skills.split(',').map((skill) => skill.trim()).filter(Boolean);
  const profileChecks = {
    personal: Boolean(profile.name && profile.email && profile.phone && profile.location),
    academic: Boolean(profile.branch && profile.semester && profile.college),
    skills: skillList.length > 0,
    projects: projects.length > 0,
    resume: Boolean(window.localStorage.getItem('internpulse_resume') || demoStudentResume),
    preferences: Boolean(preferences.targetRoles && preferences.workModes),
    portfolio: Boolean(profile.github || profile.linkedin || profile.portfolio),
  };
  const profileCompleteness = Math.round(
    (Object.values(profileChecks).filter(Boolean).length / Object.keys(profileChecks).length) * 100,
  );

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

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences((previous) => ({ ...previous, [name]: value }));
  };

  const handleProjectChange = (index, field, value) => {
    setProjects((previous) => previous.map((project, projectIndex) => (
      projectIndex === index ? { ...project, [field]: value } : project
    )));
  };

  const addProject = () => {
    setProjects((previous) => [...previous, { title: '', description: '', skills: '', url: '' }]);
    if (!isEditing) {
      handleStartSectionEditing('projects');
    }
  };

  const handleStartEditing = () => {
    setProfileBeforeEdit({
      profile: { ...profile },
      preferences: { ...preferences },
      projects: projects.map((project) => ({ ...project })),
      skillLevels: { ...skillLevels },
    });
    setSaveMessage('');
    setIsEditing(true);
  };

  const handleStartSectionEditing = (section) => {
    setProfileBeforeEdit({
      profile: { ...profile },
      preferences: { ...preferences },
      projects: projects.map((project) => ({ ...project })),
      skillLevels: { ...skillLevels },
    });
    setSaveMessage('');
    setEditingSection(section);
  };

  const handleCancelEditing = () => {
    if (profileBeforeEdit) {
      setProfile(profileBeforeEdit.profile);
      setPreferences(profileBeforeEdit.preferences);
      setProjects(profileBeforeEdit.projects);
      setSkillLevels(profileBeforeEdit.skillLevels);
    }
    setProfileBeforeEdit(null);
    setIsEditing(false);
    setEditingSection(null);
    setSaveMessage('');
  };

  const handleSaveSection = async () => {
    await handleSave();
    setEditingSection(null);
  };

  const isSectionEditing = (section) => isEditing || editingSection === section;

  const sectionActions = (section) => (
    editingSection === section ? (
      <div className="section-edit-actions">
        <button type="button" className="secondary-button" onClick={handleCancelEditing}>Cancel</button>
        <button type="button" className="primary-button" onClick={handleSaveSection} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    ) : (
      <button type="button" className="secondary-button section-edit-button" onClick={() => handleStartSectionEditing(section)}>
        Edit Details
      </button>
    )
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await studentService.updateStudentProfile({
        name: profile.name,
        email: profile.email,
        college_name: profile.college,
        branch: profile.branch,
        course: profile.branch,
        year: parseInt(profile.semester.replace(/\D/g, '')) || 3,
        skills: profile.skills,
        phone: profile.phone,
      });
      window.localStorage.setItem('internpulse_profile', JSON.stringify(profile));
      window.localStorage.setItem('internpulse_user', JSON.stringify({
        ...JSON.parse(window.localStorage.getItem('internpulse_user') || '{}'),
        name: profile.name,
        email: profile.email,
      }));
      window.localStorage.setItem('internpulse_profile_preferences', JSON.stringify(preferences));
      window.localStorage.setItem('internpulse_profile_projects', JSON.stringify(projects));
      window.localStorage.setItem('internpulse_profile_skill_levels', JSON.stringify(skillLevels));
      setProfileBeforeEdit(null);
      setIsEditing(false);
      setSaveMessage('Profile saved successfully. Recommendations will use your updated skills.');
    } catch (err) {
      setSaveMessage('Failed to save profile: ' + (err.message || 'Error occurred'));
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
            onClick={handleStartEditing}
          >
            Edit Details
          </button>
        ) : (
          <div className="profile-actions">
            <button
              className="secondary-button"
              onClick={handleCancelEditing}
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
          <div className="profile-header-meta">
            <span>{profile.location}</span>
            <span>Student ID: {profile.studentId}</span>
          </div>
          <span className="profile-status">Active Student</span>
        </div>

        <div className="profile-completeness">
          <div className="completeness-top">
            <span>Profile Completeness</span>
            <strong>{profileCompleteness}%</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${profileCompleteness}%` }}
            />
          </div>
        </div>
      </div>

      <nav className="profile-tabs" aria-label="Student profile sections">
        {['Overview', 'Personal Info', 'Academic', 'Skills', 'Projects', 'Portfolio', 'Resume', 'Preferences'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={tab === 'Overview' ? 'active' : ''}
            onClick={() => tab === 'Resume' ? setActiveTab('resume') : setIsEditing(tab === 'Personal Info' || tab === 'Academic' || tab === 'Skills' || tab === 'Preferences')}
          >
            {tab}
          </button>
        ))}
      </nav>

      {saveMessage && <div className="alert" role="status">{saveMessage}</div>}

      <div className="profile-dashboard-grid">
        <div>

      {/* Personal Information */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Personal Information</h3>
          <p>Your basic contact information</p>
          {sectionActions('personal')}
        </div>

        <div className="profile-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!isSectionEditing('personal')}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!isSectionEditing('personal')}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isSectionEditing('personal')}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={profile.location}
              onChange={handleChange}
              disabled={!isSectionEditing('personal')}
            />
          </div>
        </div>
      </div>

      {/* Academic Information */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Academic Information</h3>
          <p>Your current academic details</p>
          {sectionActions('academic')}
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
              disabled={!isSectionEditing('academic')}
            />
          </div>

          <div className="form-group">
            <label>Semester</label>
            <input
              type="text"
              name="semester"
              value={profile.semester}
              onChange={handleChange}
              disabled={!isSectionEditing('academic')}
            />
          </div>

          <div className="form-group">
            <label>College / Institution</label>
            <input
              type="text"
              name="college"
              value={profile.college}
              onChange={handleChange}
              disabled={!isSectionEditing('academic')}
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Skills</h3>
          <p>Add skills and set a proficiency level to improve recommendations.</p>
          {sectionActions('skills')}
        </div>

        <div className="form-group">
          <label>Skills</label>
          <textarea
            name="skills"
            value={profile.skills}
            onChange={handleChange}
            disabled={!isSectionEditing('skills')}
            rows="3"
            placeholder="Example: Python, Java, SQL, React"
          />
        </div>

        <div className="skills-preview">
          {skillList.map((skill) => (
            <div className="profile-skill-row" key={skill}>
              <span className="skill-badge">{skill}</span>
              <select
                value={skillLevels[skill] || 'Intermediate'}
                onChange={(event) => setSkillLevels((previous) => ({ ...previous, [skill]: event.target.value }))}
                disabled={!isSectionEditing('skills')}
                aria-label={`${skill} proficiency`}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <span className="skill-verification">Self-reported</span>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <div className="section-title">
          <h3>Career Preferences</h3>
          <p>These preferences help rank internships that fit your goals.</p>
          {sectionActions('preferences')}
        </div>
        <div className="profile-grid">
          {[
            ['targetRoles', 'Target Roles'],
            ['workModes', 'Preferred Work Mode'],
            ['preferredLocations', 'Preferred Locations'],
            ['minimumStipend', 'Minimum Stipend'],
            ['duration', 'Preferred Duration'],
          ].map(([name, label]) => (
            <div className="form-group" key={name}>
              <label htmlFor={`preference-${name}`}>{label}</label>
              <input id={`preference-${name}`} name={name} value={preferences[name] || ''} onChange={handlePreferenceChange} disabled={!isSectionEditing('preferences')} />
            </div>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <div className="section-title">
          <h3>Projects</h3>
          <p>Project evidence gives the recommendation engine more context than skills alone.</p>
          {sectionActions('projects')}
        </div>
        <div className="project-list">
          {projects.map((project, index) => (
            <div className="project-card" key={`${project.title}-${index}`}>
              <input value={project.title} onChange={(event) => handleProjectChange(index, 'title', event.target.value)} disabled={!isSectionEditing('projects')} placeholder="Project title" aria-label="Project title" />
              <textarea value={project.description} onChange={(event) => handleProjectChange(index, 'description', event.target.value)} disabled={!isSectionEditing('projects')} placeholder="What did you build?" rows="2" aria-label="Project description" />
              <input value={project.skills} onChange={(event) => handleProjectChange(index, 'skills', event.target.value)} disabled={!isSectionEditing('projects')} placeholder="Skills used" aria-label="Project skills" />
              <input type="url" value={project.url} onChange={(event) => handleProjectChange(index, 'url', event.target.value)} disabled={!isSectionEditing('projects')} placeholder="GitHub or demo URL" aria-label="Project URL" />
            </div>
          ))}
          <button type="button" className="secondary-button" onClick={addProject}>+ Add Project</button>
        </div>
      </div>

      {/* Portfolio */}
      <div className="profile-section">
        <div className="section-title">
          <h3>Portfolio & Professional Links</h3>
          <p>Connect your professional profiles</p>
          {sectionActions('portfolio')}
        </div>

        <div className="profile-grid">
          <div className="form-group">
            <label>GitHub</label>
            <input
              type="url"
              name="github"
              value={profile.github}
              onChange={handleChange}
              disabled={!isSectionEditing('portfolio')}
            />
          </div>

          <div className="form-group">
            <label>LinkedIn</label>
            <input
              type="url"
              name="linkedin"
              value={profile.linkedin}
              onChange={handleChange}
              disabled={!isSectionEditing('portfolio')}
            />
          </div>

          <div className="form-group full-width">
            <label>Portfolio Website</label>
            <input
              type="url"
              name="portfolio"
              value={profile.portfolio}
              onChange={handleChange}
              disabled={!isSectionEditing('portfolio')}
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
          <div className="document-icon" aria-hidden="true">
            <IconFileText size={22} />
          </div>
          <div className="document-info">
            <strong>Student Resume</strong>
            <p>Resume available for internship applications</p>
          </div>

          <button
            className="secondary-button"
            onClick={() => setActiveTab('resume')}
          >
            Open Resume
          </button>
        </div>
      </div>
        </div>

        <aside className="profile-sidebar">
          <div className="profile-insight-card">
            <h3>AI Career Profile</h3>
            <p>Readiness is based on the information currently in your profile.</p>
            <div className="readiness-score">{profileCompleteness}%</div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${profileCompleteness}%` }} /></div>
            <div className="insight-metrics">
              <span>Skills <strong>{skillList.length ? 'Strong' : 'Add skills'}</strong></span>
              <span>Projects <strong>{projects.length}</strong></span>
              <span>Preferences <strong>{profileChecks.preferences ? 'Set' : 'Missing'}</strong></span>
            </div>
            <button type="button" className="secondary-button" onClick={() => setActiveTab('recommendations')}>
              View AI Analysis
            </button>
          </div>

          <div className="profile-insight-card">
            <h3>Profile Checklist</h3>
            {Object.entries({
              personal: 'Personal information', academic: 'Academic details', skills: 'Skills', projects: 'Projects', resume: 'Resume', preferences: 'Career preferences', portfolio: 'Professional links',
            }).map(([key, label]) => (
              <div className="checklist-row" key={key}><span>{profileChecks[key] ? '✓' : '○'}</span>{label}</div>
            ))}
          </div>

          <div className="profile-insight-card">
            <h3>Next Best Action</h3>
            <p>{!profileChecks.projects ? 'Add a project with measurable outcomes.' : !profileChecks.preferences ? 'Set target roles and work modes.' : 'Add a verified skill or improve your resume.'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
