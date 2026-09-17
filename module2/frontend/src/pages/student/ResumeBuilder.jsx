import { IconFileText } from '../../components/common/Icons';

export default function ResumeBuilder() {
  return (
    <div className="page-container resume-builder">
      <div className="page-header">
        <h2>Resume Builder</h2>
        <p>Generate industry-ready ATS-compliant resumes tailored for internship roles.</p>
      </div>

      <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          <IconFileText size={28} />
        </div>
        <h3 className="placeholder-title">Interactive Resume Builder</h3>
        <p className="placeholder-desc">
          Automated resume formatting, PDF export, and AI bullet point enhancement will be implemented in Phase 6.
        </p>
      </div>
    </div>
  );
}
