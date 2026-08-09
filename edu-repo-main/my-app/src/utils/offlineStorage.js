// IndexedDB Helper for Offline Study Materials & Background Sync Queue

const DB_NAME = 'EduAI_OfflineDB';
const DB_VERSION = 1;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('study_materials')) {
        db.createObjectStore('study_materials', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending_actions')) {
        db.createObjectStore('pending_actions', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

// ========== STUDY MATERIALS ==========

export const saveStudyMaterialOffline = async (material) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('study_materials', 'readwrite');
    const store = tx.objectStore('study_materials');
    const item = {
      ...material,
      id: material.id || material.fileId || `mat-${Date.now()}`,
      downloadedAt: new Date().toISOString(),
      offlineAvailable: true,
    };
    store.put(item);
    tx.oncomplete = () => {
      window.dispatchEvent(new Event('offline-materials-changed'));
      resolve(item);
    };
    tx.onerror = (e) => reject(e.target.error);
  });
};

export const getOfflineStudyMaterials = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('study_materials', 'readonly');
    const store = tx.objectStore('study_materials');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const isMaterialOffline = async (id) => {
  const materials = await getOfflineStudyMaterials();
  return materials.some((m) => String(m.id) === String(id));
};

export const deleteOfflineStudyMaterial = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('study_materials', 'readwrite');
    const store = tx.objectStore('study_materials');
    store.delete(id);
    tx.oncomplete = () => {
      window.dispatchEvent(new Event('offline-materials-changed'));
      resolve(true);
    };
    tx.onerror = (e) => reject(e.target.error);
  });
};

// ========== BACKGROUND SYNC QUEUE ==========

export const queueOfflineAction = async (type, payload) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_actions', 'readwrite');
    const store = tx.objectStore('pending_actions');
    const item = {
      type,
      payload,
      createdAt: new Date().toISOString(),
    };
    store.add(item);
    tx.oncomplete = () => resolve(item);
    tx.onerror = (e) => reject(e.target.error);
  });
};

export const getPendingOfflineActions = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_actions', 'readonly');
    const store = tx.objectStore('pending_actions');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const clearPendingOfflineActions = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_actions', 'readwrite');
    const store = tx.objectStore('pending_actions');
    store.clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
};
