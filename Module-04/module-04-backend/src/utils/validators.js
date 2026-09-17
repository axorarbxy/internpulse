// INTERNAL MODULE 4 FUNCTIONALITY — lightweight input validation + XSS sanitization
const xss = require('xss');

const MAX_MESSAGE_SIZE = 5000; // characters, applies to ciphertext payload

function sanitizeText(input) {
  if (typeof input !== 'string') return input;
  return xss(input.trim());
}

function isNonEmptyString(v, maxLen = 2000) {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= maxLen;
}

module.exports = { sanitizeText, isNonEmptyString, MAX_MESSAGE_SIZE };
