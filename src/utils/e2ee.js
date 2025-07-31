// e2ee.js
// Utility for client-side end-to-end encryption (E2EE) using AES-GCM

// Generate a random AES-GCM key
export async function generateKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export key to base64 string for storage (if needed)
export async function exportKey(key) {
  const raw = await window.crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

// Import key from base64 string
export async function importKey(base64) {
  const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    'raw',
    raw,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data (string) with AES-GCM key
export async function encryptData(key, data) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(data);
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc
  );
  // Return 'enc:' + base64(iv) + ':' + base64(ciphertext)
  return `enc:${btoa(String.fromCharCode(...iv))}:${btoa(String.fromCharCode(...new Uint8Array(ciphertext)))}`;
}

// Decrypt data (string) with AES-GCM key
export async function decryptData(key, encrypted) {
  if (!encrypted || typeof encrypted !== 'string' || !encrypted.startsWith('enc:')) {
    // Not encrypted, return as-is
    return encrypted;
  }
  const [_, ivB64, ctB64] = encrypted.split(':');
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ctB64), c => c.charCodeAt(0));
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}

// Derive AES-GCM key from username, userId, and salt using PBKDF2
export async function deriveKey({ username, userId, salt }) {
  const enc = new TextEncoder();
  // Combine username and userId as the 'password'
  const password = `${username}:${userId}`;
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
} 