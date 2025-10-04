// Lightweight IndexedDB wrapper for vault and data

const DB_NAME = 'expense-tracker';
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('vault')) {
        db.createObjectStore('vault', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('expenses')) {
        const store = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_date', 'date_time');
        store.createIndex('by_category', 'category_id');
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getMeta(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('meta', 'readonly');
    const store = tx.objectStore('meta');
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function setMeta(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('meta', 'readwrite');
    const store = tx.objectStore('meta');
    store.put({ key, value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function putEncryptedVaultRecord(record) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('vault', 'readwrite');
    const store = tx.objectStore('vault');
    const req = store.put({ id: 1, ...record });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getEncryptedVaultRecord() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('vault', 'readonly');
    const store = tx.objectStore('vault');
    const req = store.get(1);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function seedDefaultCategories() {
  const db = await openDb();
  const defaults = [
    { id: 'food', name: 'Food', color: '#f59e0b' },
    { id: 'transport', name: 'Transport', color: '#60a5fa' },
    { id: 'rent', name: 'Rent', color: '#a78bfa' },
    { id: 'utilities', name: 'Utilities', color: '#10b981' },
    { id: 'entertainment', name: 'Entertainment', color: '#ef4444' },
    { id: 'health', name: 'Health', color: '#f97316' },
    { id: 'education', name: 'Education', color: '#22d3ee' },
  ];
  return new Promise((resolve, reject) => {
    const tx = db.transaction('categories', 'readwrite');
    const store = tx.objectStore('categories');
    defaults.forEach((c) => store.put(c));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
