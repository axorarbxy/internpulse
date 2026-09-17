// INTERNAL MODULE 4 FUNCTIONALITY — route: /verify/:certificateId (public, no auth)
import CertificateVerification from '../components/CertificateVerification';

export default function VerifyCertificatePage({ certificateId }) {
  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-xl font-semibold text-gray-900 mb-4 text-center">Certificate Verification</h1>
      <CertificateVerification certificateId={certificateId} />
    </div>
  );
}
