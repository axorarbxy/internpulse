import { IconBriefcase } from '../../components/common/Icons';

export default function BrowseInternships() {
  return (
    <div className="page-container browse-internships">
      <div className="page-header">
        <h2>Browse Internships</h2>
        <p>Explore opportunities matched to your degree, skills, and preferences.</p>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          <IconBriefcase size={28} />
        </div>
        <h3 className="placeholder-title">Internship Catalog & Search</h3>
        <p className="placeholder-desc">
          Full catalog with advanced keyword search, stipend filters, location matching, and one-click application submission will be fully integrated in Phase 6.
        </p>
      </div>
    </div>
  );
}
