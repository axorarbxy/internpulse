// INTERNAL MODULE 4 FUNCTIONALITY — public verification result display
export default function VerificationResult({ result }) {
  if (!result) return null;

  const isValid = result.valid;
  return (
    <div
      className={`rounded-xl p-6 border ${
        isValid ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-2xl ${isValid ? 'text-green-600' : 'text-red-600'}`}>
          {isValid ? '✓' : '✕'}
        </span>
        <h3 className={`font-semibold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
          {isValid ? 'Certificate is valid' : `Certificate ${result.verificationStatus?.toLowerCase() || 'invalid'}`}
        </h3>
      </div>
      {isValid && (
        <dl className="text-sm text-gray-700 space-y-1">
          <div><dt className="inline font-medium">Student: </dt><dd className="inline">{result.studentName}</dd></div>
          <div><dt className="inline font-medium">Company: </dt><dd className="inline">{result.companyName}</dd></div>
          <div><dt className="inline font-medium">Internship: </dt><dd className="inline">{result.internshipTitle}</dd></div>
          <div><dt className="inline font-medium">Issued: </dt><dd className="inline">{new Date(result.issuedAt).toDateString()}</dd></div>
        </dl>
      )}
      <p className="text-xs text-gray-400 mt-3">Certificate ID: {result.certificateId}</p>
    </div>
  );
}
