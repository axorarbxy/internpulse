import { IconFolderCheck } from '../../components/common/Icons';

export default function MyInternships() {
  return (
    <div className="page-container my-internships">
      <div className="page-header">
        <h2>My Internships</h2>
        <p>Monitor your active internships, weekly reports, timesheets, and application statuses.</p>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          <IconFolderCheck size={28} />
        </div>
        <h3 className="placeholder-title">Internship Management Hub</h3>
        <p className="placeholder-desc">
          Weekly report logging, faculty supervisor sign-offs, and company mentor feedback forms will be fully active in Phase 6.
        </p>
      </div>
    </div>
  );
}
