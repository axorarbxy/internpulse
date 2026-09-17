// INTERNAL MODULE 4 FUNCTIONALITY — route: /certificates/:certificateId
import { useEffect, useState } from 'react';
import { certificatesApi } from '../services/api';
import CertificateViewer from '../components/CertificateViewer';

export default function CertificateDetailPage({ certificateId }) {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificatesApi
      .get(certificateId)
      .then((res) => setCertificate(res.data.data))
      .finally(() => setLoading(false));
  }, [certificateId]);

  return (
    <div className="max-w-xl mx-auto py-8">
      <CertificateViewer certificate={certificate} loading={loading} />
    </div>
  );
}
