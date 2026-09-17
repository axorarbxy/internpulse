import { IconUser } from '../../components/common/Icons';

export default function StudentProfile() {
  return (
    <div className="page-container student-profile">
      <div className="page-header">
        <h2>Student Profile</h2>
        <p>Manage personal details, academic standing, verified skills, and resume attachments.</p>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          <IconUser size={28} />
        </div>
        <h3 className="placeholder-title">Student Profile Management</h3>
        <p className="placeholder-desc">
          Complete profile editing, skill verification badges, portfolio links, and academic transcript uploads will be fully active in Phase 6.
        </p>
      </div>
    </div>
  );
}
