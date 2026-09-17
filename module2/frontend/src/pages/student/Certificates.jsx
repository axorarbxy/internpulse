import { useState, useEffect, useMemo } from 'react';
import { studentService } from '../../services';
import StatCard from '../../components/dashboard/StatCard';
import Badge from '../../components/common/Badge';
import {
  IconAward,
  IconCheckCircle,
  IconClock,
  IconSearch,
  IconDownload,
  IconEye,
   IconShieldCheck,
  IconX,
} from '../../components/common/Icons';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCert, setSelectedCert] = useState(null);
  const [downloadToast, setDownloadToast] = useState(null);

  useEffect(() => {
    let isMounted = true;

    studentService
      .getStudentCertificates()
      .then((data) => {
        if (isMounted) {
          setCertificates(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Failed to load certificates.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    studentService
      .getStudentCertificates()
      .then((data) => {
        setCertificates(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load certificates.');
        setLoading(false);
      });
  };

  const handleDownload = (cert) => {
    setDownloadToast(`Preparing download for ${cert.title} (${cert.id})...`);
    setTimeout(() => {
      setDownloadToast(`Downloaded certificate: ${cert.id}.pdf`);
      setTimeout(() => setDownloadToast(null), 3500);
    }, 1000);
  };

  // Calculate summary counts
  const totalCount = certificates.length;
  const verifiedCount = useMemo(
    () => certificates.filter((c) => c.status === 'Verified').length,
    [certificates]
  );
  const pendingCount = useMemo(
    () => certificates.filter((c) => c.status !== 'Verified').length,
    [certificates]
  );

  // Filtered certificates list
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesSearch =
        cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'verified'
          ? cert.status === 'Verified'
          : cert.status !== 'Verified';

      return matchesSearch && matchesStatus;
    });
  }, [certificates, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Loading your verified credentials & certificates...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container">
        <p style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{error}</p>
        <button type="button" className="btn btn-primary" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page student-certificates">
      {/* Toast feedback for download */}
      {downloadToast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'var(--bg-sidebar)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-dropdown)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 110,
            fontSize: '13px',
          }}
        >
          <IconCheckCircle size={18} color="var(--color-success)" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <h2>My Certificates</h2>
        <p>
          Digitally verified internship credentials, academic accreditations, and completion certificates.
        </p>
      </div>

      {/* Summary / Metric Cards */}
      <section className="stats-grid">
        <StatCard
          title="Total Certificates"
          value={totalCount}
          icon={IconAward}
          trend={`${totalCount} Total Issued`}
          trendType="neutral"
          accent="primary"
          subtitle="All academic & industry credentials"
        />

        <StatCard
          title="Verified Certificates"
          value={verifiedCount}
          icon={IconCheckCircle}
          trend={`${verifiedCount} Verified Badges`}
          trendType="up"
          accent="success"
          subtitle="Faculty & mentor approved"
        />

        <StatCard
          title="Pending Certificates"
          value={pendingCount}
          icon={IconClock}
          trend={`${pendingCount} In Review`}
          trendType="neutral"
          accent="warning"
          subtitle="Awaiting final evaluation"
        />
      </section>

      {/* Filter and Search Bar */}
      <div className="certificates-filter-bar">
        <div className="cert-search-input-wrap">
          <IconSearch size={16} className="cert-search-icon" />
          <input
            type="text"
            className="cert-search-input"
            placeholder="Search certificate title, company, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search certificates"
          />
        </div>

        <div className="analytics-filter-group" role="group" aria-label="Certificate Status Filter">
          <button
            type="button"
            className={`analytics-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            className={`analytics-filter-btn ${statusFilter === 'verified' ? 'active' : ''}`}
            onClick={() => setStatusFilter('verified')}
          >
            Verified ({verifiedCount})
          </button>
          <button
            type="button"
            className={`analytics-filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      {/* Certificates Cards Grid */}
      {filteredCertificates.length > 0 ? (
        <div className="certificates-grid">
          {filteredCertificates.map((cert) => (
            <div key={cert.id} className="certificate-card">
              <div>
                <div className="certificate-card-top">
                  <div className="cert-title-group">
                    <span className="cert-id-tag">{cert.id}</span>
                    <h3 className="cert-card-title">{cert.title}</h3>
                    <div className="cert-company-info">
                      <span className="cert-company-icon">{cert.companyLogo}</span>
                      <span>{cert.company}</span>
                    </div>
                  </div>
                  <Badge variant={cert.statusVariant} size="sm" dot={cert.status === 'Verified'}>
                    {cert.status}
                  </Badge>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '12px 0', lineHeight: 1.5 }}>
                  {cert.description}
                </p>

                <div className="cert-meta-grid">
                  <div className="cert-meta-item">
                    <span className="cert-meta-label">Issue Date</span>
                    <span className="cert-meta-val">{cert.issueDate}</span>
                  </div>
                  <div className="cert-meta-item">
                    <span className="cert-meta-label">Duration</span>
                    <span className="cert-meta-val">{cert.duration}</span>
                  </div>
                  <div className="cert-meta-item">
                    <span className="cert-meta-label">Accreditation</span>
                    <span className="cert-meta-val">{cert.grade}</span>
                  </div>
                  <div className="cert-meta-item">
                    <span className="cert-meta-label">Issuer</span>
                    <span className="cert-meta-val" style={{ fontSize: '11px' }}>{cert.issuer}</span>
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div className="cert-skills-row">
                    {cert.skills.map((skill) => (
                      <span key={skill} className="skill-tag" style={{ fontSize: '10px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="cert-actions-row">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedCert(cert)}
                >
                  <IconEye size={14} /> View Certificate
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleDownload(cert)}
                >
                  <IconDownload size={14} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="placeholder-card">
          <div className="placeholder-icon-wrap">
            <IconAward size={28} />
          </div>
          <h3 className="placeholder-title">No Certificates Found</h3>
          <p className="placeholder-desc">
            No credentials matched your search query. Try clearing the filter or search with different keywords.
          </p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Official Certificate Preview Modal */}
      {selectedCert && (
        <div className="cert-modal-overlay" onClick={() => setSelectedCert(null)}>
          <div className="cert-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="cert-modal-header">
              <h3>Certificate of Completion Preview</h3>
              <button
                type="button"
                className="cert-modal-close-btn"
                onClick={() => setSelectedCert(null)}
                aria-label="Close certificate preview"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="cert-frame-wrapper">
              <div className="official-certificate-frame">
                <p className="cert-institution-header">Apex Institute of Technology</p>
                <h2 className="cert-doc-title">Certificate of Internship Completion</h2>
                <p className="cert-recipient-intro">This is proudly presented to</p>
                <h1 className="cert-recipient-name">Alex Morgan</h1>
                <p className="cert-body-paragraph">
                  in recognition of successful completion of the{' '}
                  <strong>{selectedCert.title}</strong> at{' '}
                  <strong>{selectedCert.company}</strong> covering{' '}
                  <strong>{selectedCert.duration}</strong>.
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '16px',
                  }}
                >
                  {selectedCert.skills.map((s) => (
                    <span key={s} className="skill-tag" style={{ background: '#eef2ff', borderColor: '#c7d2fe' }}>
                      {s}
                    </span>
                  ))}
                </div>

                <div className="cert-seal-row">
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Certificate ID:</span>
                    <strong style={{ fontFamily: 'monospace', color: '#1e1b4b' }}>{selectedCert.id}</strong>
                  </div>

                  <div className="cert-seal-badge">
                    <IconShieldCheck size={16} />
                    <span>{selectedCert.status} Credential</span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Date of Issue:</span>
                    <strong>{selectedCert.issueDate}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="cert-modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedCert(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleDownload(selectedCert)}
              >
                <IconDownload size={16} /> Download Official PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
