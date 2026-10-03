jest.mock('../models/DocumentVerification', () => ({
  findOneAndUpdate: jest.fn(),
}));
jest.mock('../services/auditService', () => ({
  record: jest.fn().mockResolvedValue(undefined),
}));

const DocumentVerification = require('../models/DocumentVerification');
const auditService = require('../services/auditService');
const { recordReviewResolution } = require('../services/documentVerificationService');

describe('document verification review resolution', () => {
  beforeEach(() => jest.clearAllMocks());

  test('clears the certificate gate and records the human reviewer', async () => {
    const record = { documentId: 'report-1', verificationStatus: 'VERIFIED' };
    DocumentVerification.findOneAndUpdate.mockResolvedValue(record);

    await expect(recordReviewResolution({
      flagId: 'flag-1',
      status: 'VERIFIED',
      reason: 'Reviewed and cleared',
      verifiedBy: 'admin-7',
    })).resolves.toBe(record);

    expect(DocumentVerification.findOneAndUpdate).toHaveBeenCalledWith(
      { flagId: 'flag-1' },
      expect.objectContaining({
        verificationStatus: 'VERIFIED',
        resolutionOutcome: 'CLEARED',
        resolutionNote: 'Reviewed and cleared',
        verifiedBy: 'admin-7',
        verifiedAt: expect.any(Date),
      }),
      { new: true }
    );
    expect(auditService.record).toHaveBeenCalledWith(expect.objectContaining({
      actorId: 'admin-7',
      action: 'DOCUMENT_VERIFICATION_REVIEW_RESOLVED',
    }));
  });

  test('keeps a confirmed issue rejected', async () => {
    DocumentVerification.findOneAndUpdate.mockResolvedValue({ documentId: 'report-1' });

    await recordReviewResolution({ flagId: 'flag-1', status: 'REJECTED', verifiedBy: 'admin-7' });

    expect(DocumentVerification.findOneAndUpdate).toHaveBeenCalledWith(
      { flagId: 'flag-1' },
      expect.objectContaining({ verificationStatus: 'REJECTED', resolutionOutcome: 'CONFIRMED' }),
      { new: true }
    );
  });
});