// INTERNAL MODULE 4 FUNCTIONALITY — central config loader, no hard-coded secrets
require('dotenv').config();

function required(name, fallback = undefined) {
  return process.env[name] ?? fallback;
}

module.exports = {
  port: Number(process.env.PORT || 5004),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: required('FRONTEND_URL', 'http://localhost:5173'),
  socketOrigin: required('SOCKET_ORIGIN', 'http://localhost:5173'),
  databaseUrl: required('DATABASE_URL', 'mongodb://localhost:27017/module4_dev'),
  jwtSecret: required('JWT_SECRET'),
  redisUrl: required('REDIS_URL', ''),
  certificateSigningKey: required('CERTIFICATE_SIGNING_KEY', ''),
  certificateSigningPrivateKey: required('CERTIFICATE_SIGNING_PRIVATE_KEY', ''),
  certificateSigningPublicKey: required('CERTIFICATE_SIGNING_PUBLIC_KEY', ''),
  module1Mode: required('MODULE1_MODE', 'mock'),
  module1BaseUrl: required('MODULE1_BASE_URL', ''),
  module1ServiceToken: required('MODULE1_SERVICE_TOKEN', ''),
  fraudGateMode: required('FRAUD_GATE_MODE', 'warn'),
  publicAppUrl: required('PUBLIC_APP_URL', 'http://localhost:5173'),
};
