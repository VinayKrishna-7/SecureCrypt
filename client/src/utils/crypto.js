/**
 * Zero-Knowledge Client-Side Cryptography Engine
 * Utilizes native Web Crypto API (AES-256-GCM + PBKDF2)
 * The plaintext and secret keys NEVER touch the server!
 */

// Helper to convert ArrayBuffer to Base64URL
export const bufferToBase64Url = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Helper to convert Base64URL to ArrayBuffer
export const base64UrlToBuffer = (base64Url) => {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Generate a random 256-bit AES-GCM key
 */
export const generateEncryptionKey = async () => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

/**
 * Export CryptoKey to Base64URL string for URL hash embedding
 */
export const exportKeyToString = async (key) => {
  const raw = await window.crypto.subtle.exportKey('raw', key);
  return bufferToBase64Url(raw);
};

/**
 * Import CryptoKey from Base64URL string
 */
export const importKeyFromString = async (keyStr) => {
  const raw = base64UrlToBuffer(keyStr);
  return await window.crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Derive an encryption key from a user passphrase using PBKDF2 (100,000 rounds)
 */
export const deriveKeyFromPassphrase = async (passphrase, saltBuffer) => {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Generate a cryptographically secure 6-digit PIN
 */
export const generateSecurePin = () => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return (array[0] % 900000 + 100000).toString();
};

/**
 * Generate a SHA-256 fingerprint for a key
 */
export const computeFingerprint = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');
};

/**
 * Encrypt a view-once payload
 * Returns: { ciphertext, iv, keyString, saltString, fingerprint }
 */
export const encryptPayload = async (plaintext, optionalPassphrase = '') => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Generate 12-byte random IV for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  let key;
  let keyString = '';
  let saltString = null;

  if (optionalPassphrase && optionalPassphrase.trim().length > 0) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    key = await deriveKeyFromPassphrase(optionalPassphrase.trim(), salt);
    saltString = bufferToBase64Url(salt.buffer);

    const linkKey = await generateEncryptionKey();
    keyString = await exportKeyToString(linkKey);
  } else {
    key = await generateEncryptionKey();
    keyString = await exportKeyToString(key);
  }

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );

  const ciphertext = bufferToBase64Url(encryptedBuffer);
  const fingerprint = await computeFingerprint(ciphertext);

  return {
    ciphertext,
    iv: bufferToBase64Url(iv.buffer),
    keyString,
    saltString,
    fingerprint,
  };
};

/**
 * Decrypt a payload using key string or passphrase
 */
export const decryptPayload = async ({ ciphertext, iv, keyString, passphrase = '', saltString = null }) => {
  const decoder = new TextDecoder();
  const encryptedBuffer = base64UrlToBuffer(ciphertext);
  const ivBuffer = base64UrlToBuffer(iv);

  let key;

  if (passphrase && saltString) {
    const saltBuffer = base64UrlToBuffer(saltString);
    key = await deriveKeyFromPassphrase(passphrase, saltBuffer);
  } else {
    if (!keyString) {
      throw new Error('Decryption key is missing from the link fragment.');
    }
    key = await importKeyFromString(keyString);
  }

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(ivBuffer),
      },
      key,
      encryptedBuffer
    );

    return decoder.decode(decryptedBuffer);
  } catch (err) {
    throw new Error('Decryption failed. The encryption key or PIN was incorrect.');
  }
};
