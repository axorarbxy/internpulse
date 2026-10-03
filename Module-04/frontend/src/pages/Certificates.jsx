// INTERNAL MODULE 4 FUNCTIONALITY — route: /certificates
import { useEffect, useState } from 'react';
import CertificateCard from '../components/CertificateCard';

// NOTE: Module 1 doesn't yet expose "list my certificates"; this page assumes
// a GET /api/certificates?studentId= will exist, or Module 2 passes known IDs.
export default function CertificatesPage({ certificates = [] }) {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-4">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">My Certificates</h1>
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        Pending institution review can block certificate issuance. If a flag is still open, the certificate is held until a human clears it.
      </p>
      {certificates.length === 0 && (
        <p className="text-sm text-gray-400">No certificates issued yet</p>
      )}
      {certificates.map((c) => (
        <CertificateCard key={c.certificateId} certificate={c} />
      ))}
    </div>
  );
}
