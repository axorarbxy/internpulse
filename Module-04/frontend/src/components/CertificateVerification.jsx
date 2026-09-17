// INTERNAL MODULE 4 FUNCTIONALITY — for the public /verify/:certificateId page
import { useEffect, useState } from 'react';
import { certificatesApi } from '../services/api';
import VerificationResult from './VerificationResult';

export default function CertificateVerification({ certificateId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificatesApi
      .verify(certificateId)
      .then((res) => setResult(res.data.data))
      .finally(() => setLoading(false));
  }, [certificateId]);

  if (loading) return <p className="text-sm text-gray-400">Verifying…</p>;
  return <VerificationResult result={result} />;
}
