// INTERNAL MODULE 4 FUNCTIONALITY — professional certificate PDF rendering
const PDFDocument = require('pdfkit');

function streamCertificatePdf(res, { certificate, qrDataUrl }) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${certificate.certificateId}.pdf"`);
  doc.pipe(res);

  const { width } = doc.page;

  doc
    .rect(20, 20, width - 40, doc.page.height - 40)
    .lineWidth(2)
    .stroke('#1f2937');

  doc.fontSize(28).fillColor('#1f2937').text('Certificate of Internship Completion', {
    align: 'center',
  });
  doc.moveDown(1.5);

  doc.fontSize(14).fillColor('#374151').text('This certifies that', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(22).fillColor('#111827').text(certificate.dataSnapshot.studentName, { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(14).fillColor('#374151').text('has successfully completed the internship', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(18).fillColor('#111827').text(certificate.dataSnapshot.internshipTitle, { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(14).fillColor('#374151').text(`at ${certificate.dataSnapshot.companyName}`, { align: 'center' });

  doc.moveDown(2);
  doc.fontSize(11).fillColor('#4b5563').text(`Certificate ID: ${certificate.certificateId}`, 60, doc.y);
  doc.text(`Issued: ${new Date(certificate.issuedAt).toDateString()}`);
  doc.text(`Verification: ${certificate.verificationUrl}`);

  if (qrDataUrl) {
    const base64 = qrDataUrl.split(',')[1];
    doc.image(Buffer.from(base64, 'base64'), width - 190, doc.page.height - 220, { width: 130 });
  }

  doc.end();
}

module.exports = { streamCertificatePdf };
