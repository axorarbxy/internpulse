describe('certificate verification QR', () => {
  const originalPublicAppUrl = process.env.PUBLIC_APP_URL;

  afterEach(() => {
    if (originalPublicAppUrl === undefined) {
      delete process.env.PUBLIC_APP_URL;
    } else {
      process.env.PUBLIC_APP_URL = originalPublicAppUrl;
    }
    jest.resetModules();
  });

  test('targets the public verification hash route and encodes the certificate ID', async () => {
    process.env.PUBLIC_APP_URL = 'https://internpulse.example/';
    jest.resetModules();
    const { buildVerificationQrDataUrl } = require('../utils/qrCode');

    const result = await buildVerificationQrDataUrl('CERT/ABC');

    expect(result.verificationUrl).toBe('https://internpulse.example/#/verify/CERT%2FABC');
    expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});