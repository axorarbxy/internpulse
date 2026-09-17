// INTERNAL MODULE 4 FUNCTIONALITY
export default function CertificateCard({ certificate }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{certificate.dataSnapshot.internshipTitle}</h3>
          <p className="text-sm text-gray-500">{certificate.dataSnapshot.companyName}</p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          {certificate.status}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-3">Certificate ID: {certificate.certificateId}</p>
      <p className="text-xs text-gray-400">Issued: {new Date(certificate.issuedAt).toDateString()}</p>
      <a
        href={certificate.downloadUrl}
        className="inline-block mt-3 text-sm text-blue-600 hover:underline"
      >
        Download PDF
      </a>
    </div>
  );
}
