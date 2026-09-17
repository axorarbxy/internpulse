// INTERNAL MODULE 4 FUNCTIONALITY — client-side end-to-end encryption.
// Uses the Web Crypto API only. Real AES-GCM encryption, not base64 or hashing.
//
// Model: each conversation gets a symmetric AES-GCM key. In this prototype the
// key is derived via ECDH between the two participants' key pairs and cached
// in memory (never sent to the server). A production version would persist
// each user's private key securely (e.g. IndexedDB, non-extractable) and
// exchange public keys through Module 1's user profile endpoints.

const keyCache = new Map(); // conversationId -> CryptoKey

export async function generateKeyPair() {
  return crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey']
  );
}

export async function exportPublicKey(publicKey) {
  const raw = await crypto.subtle.exportKey('raw', publicKey);
  return bufferToBase64(raw);
}

export async function importPublicKey(base64Key) {
  const raw = base64ToBuffer(base64Key);
  return crypto.subtle.importKey('raw', raw, { name: 'ECDH', namedCurve: 'P-256' }, true, []);
}

// Derives a shared AES-GCM key from my private key + their public key
export async function deriveConversationKey(conversationId, myPrivateKey, theirPublicKey) {
  const key = await crypto.subtle.deriveKey(
    { name: 'ECDH', public: theirPublicKey },
    myPrivateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  keyCache.set(conversationId, key);
  return key;
}

export async function encryptMessage(conversationId, plaintext) {
  const key = keyCache.get(conversationId);
  if (!key) throw new Error('No conversation key established — cannot encrypt');

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertextBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv),
  };
}

export async function decryptMessage(conversationId, ciphertextBase64, ivBase64) {
  const key = keyCache.get(conversationId);
  if (!key) throw new Error('No conversation key established — cannot decrypt');

  const iv = base64ToBuffer(ivBase64);
  const ciphertext = base64ToBuffer(ciphertextBase64);
  const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(plainBuffer);
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
