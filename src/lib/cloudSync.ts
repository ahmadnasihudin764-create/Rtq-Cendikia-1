import {
  doc,
  setDoc,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface SyncPayload<T> {
  data: T;
  updatedAt: number;
  updatedBy?: string;
}

/**
 * Subscribe to real-time changes for a specific collection key across all devices
 */
export function subscribeToCloudSync<T>(
  key: string,
  onRemoteUpdate: (data: T, updatedAt: number) => void
): () => void {
  try {
    const docRef = doc(db, 'rtq_sync', key);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const payload = snapshot.data() as SyncPayload<T>;
          if (payload && payload.data !== undefined) {
            onRemoteUpdate(payload.data, payload.updatedAt || Date.now());
          }
        }
      },
      (error) => {
        console.warn(`[CloudSync] Gagal menyinkronkan data remote (${key}):`, error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`[CloudSync] Error saat inisialisasi listener cloud (${key}):`, err);
    return () => {};
  }
}

/**
 * Push data changes to Firestore so all other devices receive the update immediately
 */
export async function pushToCloudSync<T>(
  key: string,
  data: T,
  author?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'rtq_sync', key);
    const payload: SyncPayload<T> = {
      data,
      updatedAt: Date.now(),
      updatedBy: author || 'Admin'
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.warn(`[CloudSync] Gagal push ke cloud (${key}):`, error);
  }
}

/**
 * Fetch initial cloud state on demand
 */
export async function fetchCloudSync<T>(key: string): Promise<T | null> {
  try {
    const docRef = doc(db, 'rtq_sync', key);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const payload = snapshot.data() as SyncPayload<T>;
      return payload.data ?? null;
    }
    return null;
  } catch (error) {
    console.warn(`[CloudSync] Gagal fetch cloud data (${key}):`, error);
    return null;
  }
}
