// INTERNAL MODULE 4 FUNCTIONALITY — client-side end-to-end encryption.
// Uses the Web Crypto API only. Real AES-GCM encryption, not base64 or hashing.
//
// Model: each conversation gets a symmetric AES-GCM key. In this prototype the
// key is derived via ECDH between the two participants' key pairs and cached
// in memory (never sent to the server). A production version would persist
// each user's private key securely (e.g. IndexedDB, non-extractable) and
// exchange public keys through Module 1's user profile endpoints.

const keyCache = new Map(); // conversationId -> CryptoKey
const keyStoragePrefix = 'internpulse_e2e_key_';
const keyDbName = 'internpulse_crypto';
const keyStoreName = 'keys';

function dispatchKeyWarning(reason, metadata = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('internpulse-key-warning', {
    detail: { reason, ...metadata },
  }));
}

async function openKeyDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is unavailable in this browser'));
      return;
    }

    const request = window.indexedDB.open(keyDbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(keyStoreName)) {
        db.createObjectStore(keyStoreName, { keyPath: 'userId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open key database'));
  });
}

async function getStoredIdentityKey(currentUserId) {
  try {
    const db = await openKeyDatabase();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(keyStoreName, 'readonly');
      const request = tx.objectStore(keyStoreName).get(String(currentUserId));
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('Unable to read stored identity key'));
    });
  } catch {
    return null;
  }
}

async function storeIdentityKey(currentUserId, keyPair) {
  const db = await openKeyDatabase();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(keyStoreName, 'readwrite');
    const request = tx.objectStore(keyStoreName).put({
      userId: String(currentUserId),
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
    });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error('Unable to store identity key'));
  });
}

async function importLegacyKeyPair(jwkPayload) {
  return {
    privateKey: await crypto.subtle.importKey('jwk', jwkPayload.privateKey, { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']),
    publicKey: await crypto.subtle.importKey('jwk', jwkPayload.publicKey, { name: 'ECDH', namedCurve: 'P-256' }, true, []),
  };
}

export async function generateKeyPair() {
  return crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
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
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: theirPublicKey },
    myPrivateKey,
    256,
  );
  const hkdfKey = await crypto.subtle.importKey('raw', sharedSecret, 'HKDF', false, ['deriveKey']);
  const context = new TextEncoder().encode(`InternPulse conversation ${conversationId}`);
  const key = await crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: context, info: context },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  keyCache.set(conversationId, key);
  return key;
}

export async function ensureIdentityKey(currentUserId, registerKey) {
  let keyPair = await getStoredIdentityKey(currentUserId);
  const legacy = localStorage.getItem(`${keyStoragePrefix}${currentUserId}`);

  if (!keyPair && legacy) {
    try {
      const jwk = JSON.parse(legacy);
      keyPair = await importLegacyKeyPair(jwk);
      await storeIdentityKey(currentUserId, keyPair);
      localStorage.removeItem(`${keyStoragePrefix}${currentUserId}`);
      dispatchKeyWarning('legacy-key-migrated', { userId: currentUserId });
    } catch {
      localStorage.removeItem(`${keyStoragePrefix}${currentUserId}`);
    }
  }

  if (!keyPair) {
    keyPair = await generateKeyPair();
    await storeIdentityKey(currentUserId, keyPair);
  }

  const publicKey = await exportPublicKey(keyPair.publicKey);
  await registerKey('ECDH-P256', publicKey);

  if (legacy && !keyPair?.legacyMigrated) {
    dispatchKeyWarning('identity-key-rotated', { userId: currentUserId, keyFingerprint: publicKey.slice(0, 16) });
  }

  return keyPair;
}

export async function ensureConversationKey(conversationId, participantKeys, currentUserId, registerKey) {
  const keyPair = await ensureIdentityKey(currentUserId, registerKey);
  const peers = participantKeys.filter((key) => String(key.userId) !== String(currentUserId));
  if (!peers.length || !peers[0].publicKey) throw new Error('Recipient encryption key is not available yet');
  const theirPublicKey = await importPublicKey(peers[0].publicKey);
  return deriveConversationKey(conversationId, keyPair.privateKey, theirPublicKey);
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
