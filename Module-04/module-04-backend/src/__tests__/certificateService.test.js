jest.mock('../models/Certificate', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../models/DocumentVerification', () => ({
  find: jest.fn(),
}));
jest.mock('../integration/module1Adapter', () => ({
  getCompletedApplication: jest.fn(),
}));
jest.mock('../services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../services/auditService', () => ({
  record: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../utils/qrCode', () => ({
  buildVerificationQrDataUrl: jest.fn().mockResolvedValue({
    verificationUrl: 'http://localhost:5173/#/verify/CERT-TEST',
    dataUrl: 'data:image/png;base64,test',
  }),
}));

const Certificate = require('../models/Certificate');
const DocumentVerification = require('../models/DocumentVerification');
const module1Adapter = require('../integration/module1Adapter');
const { issueCertificate } = require('../services/certificateService');

describe('certificateService.issueCertificate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Certificate.findOne.mockResolvedValue(null);
    DocumentVerification.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
    Certificate.create.mockImplementation(async (certificate) => certificate);
    module1Adapter.getCompletedApplication.mockResolvedValue({
      applicationId: 'application-1',
      internshipId: 'internship-1',
      applicationStatus: 'COMPLETED',
      internshipTitle: 'Engineering Intern',
      studentId: 'student-1',
      studentName: 'Student One',
      companyId: 'company-1',
      companyName: 'Example Company',
      startDate: '2026-01-01',
      endDate: '2026-03-01',
    });
  });

  test('signs and stores a certificate against the completed application snapshot', async () => {
    const certificate = await issueCertificate('application-1', 'company-1', 'COMPANY');

    expect(Certificate.create).toHaveBeenCalledWith(expect.objectContaining({
      applicationId: 'application-1',
      internshipId: 'internship-1',
      studentId: 'student-1',
      companyId: 'company-1',
      dataSnapshot: expect.objectContaining({
        studentName: 'Student One',
        companyName: 'Example Company',
        internshipTitle: 'Engineering Intern',
      }),
      signature: expect.any(String),
      verificationUrl: 'http://localhost:5173/#/verify/CERT-TEST',
    }));
    expect(certificate.certificateHash).toEqual(expect.any(String));
  });

  test('refuses issuance unless the application is completed', async () => {
    module1Adapter.getCompletedApplication.mockResolvedValue({ applicationStatus: 'ONGOING' });

    await expect(issueCertificate('application-1', 'company-1', 'COMPANY'))
      .rejects.toMatchObject({ errorCode: 'APPLICATION_NOT_COMPLETED' });
    expect(Certificate.create).not.toHaveBeenCalled();
  });
});