import { getMeta, setMeta, putEncryptedVaultRecord, getEncryptedVaultRecord } from './db.js';
import { getRandomBytes, deriveKeyFromPin, encryptJsonWithKey, decryptJsonWithKey, arrayBufferToBase64 } from './crypto.js';

const SALT_META_KEY = 'pin_salt_b64';

let sessionKey = null;
let sessionData = null;

export async function isVaultInitialized() {
  const rec = await getEncryptedVaultRecord();
  return Boolean(rec);
}

export async function setupVaultWithPin(pin) {
  const salt = getRandomBytes(16);
  await setMeta(SALT_META_KEY, arrayBufferToBase64(salt.buffer));
  const key = await deriveKeyFromPin(pin, salt);
  // Create empty vault
  const payload = { expenses: [], created_at: Date.now(), version: 1 };
  const encrypted = await encryptJsonWithKey(payload, key);
  await putEncryptedVaultRecord(encrypted);
}

export async function unlockVault(pin) {
  const saltB64 = await getMeta(SALT_META_KEY);
  if (!saltB64) throw new Error('Vault not initialized');
  const salt = new Uint8Array(atob(saltB64).split('').map(c => c.charCodeAt(0)));
  const key = await deriveKeyFromPin(pin, salt);
  const encrypted = await getEncryptedVaultRecord();
  if (!encrypted) throw new Error('Vault missing');
  const data = await decryptJsonWithKey(encrypted, key);
  sessionKey = key;
  sessionData = data;
  return { key, data };
}

export async function saveVaultData(key, data) {
  const encrypted = await encryptJsonWithKey(data, key);
  await putEncryptedVaultRecord(encrypted);
  sessionData = data;
}

export function getSession() {
  return { key: sessionKey, data: sessionData };
}
