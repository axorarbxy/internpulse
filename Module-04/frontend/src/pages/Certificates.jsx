// INTERNAL MODULE 4 FUNCTIONALITY — route: /certificates
import { useEffect, useState } from 'react';
import CertificateCard from '../components/CertificateCard';

// NOTE: Module 1 doesn't yet expose "list my certificates"; this page assumes
// a GET /api/certificates?studentId= will exist, or Module 2 passes known IDs.
export default function CertificatesPage({ certificates = [] }) {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-4">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">My Certificates</h1>
      {certificates.length === 0 && (
        <p className="text-sm text-gray-400">No certificates issued yet</p>
      )}
      {certificates.map((c) => (
        <CertificateCard key={c.certificateId} certificate={c} />
      ))}
    </div>
  );
}
