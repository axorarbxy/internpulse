// INTERNAL MODULE 4 FUNCTIONALITY
import CertificateCard from './CertificateCard';

export default function CertificateViewer({ certificate, loading }) {
  if (loading) return <p className="text-sm text-gray-400">Loading certificate…</p>;
  if (!certificate) return <p className="text-sm text-gray-400">Certificate not found</p>;
  return <CertificateCard certificate={certificate} />;
}
