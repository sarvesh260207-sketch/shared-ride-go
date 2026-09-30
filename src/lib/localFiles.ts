// Device-local file storage (IndexedDB). Works without sign-in.
// Reuses the existing "presentations" object store, so no DB version bump is needed
// and any PowerPoint already saved on a device stays available.
const DATABASE_NAME = "zhoop-offline-files";
const STORE_NAME = "presentations";

export type FileSlot = "presentation" | "video" | "spreadsheet";

const RECORD_KEYS: Record<FileSlot, string> = {
  presentation: "current-presentation", // same key as before
  video: "current-video",
  spreadsheet: "current-spreadsheet",
};

export interface LocalFile {
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

export async function saveLocalFile(slot: FileSlot, file: Blob, name: string): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(
        {
          name,
          type: file.type,
          size: file.size,
          updatedAt: new Date().toISOString(),
          blob: file,
        } satisfies LocalFile,
        RECORD_KEYS[slot],
      );
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export async function getLocalFile(slot: FileSlot): Promise<LocalFile | null> {
  const database = await openDatabase();
  try {
    const record = await new Promise<LocalFile | undefined>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(RECORD_KEYS[slot]);
      request.onsuccess = () => resolve(request.result as LocalFile | undefined);
      request.onerror = () => reject(request.error);
    });
    return record ?? null;
  } finally {
    database.close();
  }
}

export async function removeLocalFile(slot: FileSlot): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(RECORD_KEYS[slot]);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}
