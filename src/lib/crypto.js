// Minimal crypto utilities using Web Crypto API

function textEncoder() {
  return new TextEncoder();
}
function textDecoder() {
  return new TextDecoder();
}

export function utf8ToBytes(text) {
  return textEncoder().encode(text);
}

export function bytesToUtf8(bytes) {
  return textDecoder().decode(bytes);
}

export function getRandomBytes(length) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function deriveKeyFromPin(pin, salt, iterations = 200_000) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    utf8ToBytes(pin),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations,
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return key;
}

export async function encryptJsonWithKey(jsonObject, aesKey) {
  const iv = getRandomBytes(12);
  const plaintext = utf8ToBytes(JSON.stringify(jsonObject));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    plaintext
  );
  return {
    ivB64: arrayBufferToBase64(iv.buffer),
    ciphertextB64: arrayBufferToBase64(ciphertext),
  };
}

export async function decryptJsonWithKey(record, aesKey) {
  const iv = new Uint8Array(base64ToArrayBuffer(record.ivB64));
  const ciphertext = base64ToArrayBuffer(record.ciphertextB64);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    ciphertext
  );
  const json = bytesToUtf8(new Uint8Array(decrypted));
  return JSON.parse(json);
}
