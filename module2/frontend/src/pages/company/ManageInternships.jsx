import { IconBriefcase } from '../../components/common/Icons';

export default function ManageInternships() {
  return (
    <div className="page-container manage-internships">
      <div className="page-header">
        <h2>Manage Internships</h2>
        <p>Publish, edit, and archive internship listings and department job requisitions.</p>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          <IconBriefcase size={28} />
        </div>
        <h3 className="placeholder-title">Internship Postings & Requisitions</h3>
        <p className="placeholder-desc">
          Role builder, stipend configuration, eligibility criteria, and posting status controls will be implemented in Phase 5.
        </p>
      </div>
    </div>
  );
}
