const DATABASE_NAME = "zhoop-offline-files";
const STORE_NAME = "presentations";
const RECORD_KEY = "current-presentation";

export interface OfflinePresentation {
  name: string;
  type: string;
  size: number;
  updatedAt: string;
  blob: Blob;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflinePresentation(file: Blob, name: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(
      {
        name,
        type: file.type,
        size: file.size,
        updatedAt: new Date().toISOString(),
        blob: file,
      } satisfies OfflinePresentation,
      RECORD_KEY,
    );
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function getOfflinePresentation(): Promise<OfflinePresentation | null> {
  const database = await openDatabase();
  const record = await new Promise<OfflinePresentation | undefined>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(RECORD_KEY);
    request.onsuccess = () => resolve(request.result as OfflinePresentation | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return record ?? null;
}

export async function removeOfflinePresentation(): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(RECORD_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
