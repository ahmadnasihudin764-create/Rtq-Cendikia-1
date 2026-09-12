import {
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

export interface SyncPayload<T> {
  data: T;
  updatedAt: number;
  updatedBy?: string;
}

export type SyncStatus = 'connected' | 'syncing' | 'error' | 'offline';

/**
 * Subscribe to real-time changes for a specific collection key across all devices using Firestore onSnapshot
 * This replaces one-time getDocs / getDoc queries with an active persistent real-time listener.
 */
export function subscribeToCloudSync<T>(
  key: string,
  onRemoteUpdate: (data: T, updatedAt: number) => void,
  onStatusChange?: (status: SyncStatus, error?: any) => void
): () => void {
  try {
    const docRef = doc(db, 'rtq_sync', key);
    
    // Set up real-time listener with onSnapshot
    const unsubscribe = onSnapshot(
      docRef,
      { includeMetadataChanges: false },
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          const payload = snapshot.data() as SyncPayload<T>;
          if (payload && payload.data !== undefined) {
            onRemoteUpdate(payload.data, payload.updatedAt || Date.now());
            if (onStatusChange) onStatusChange('connected');
          }
        } else {
          if (onStatusChange) onStatusChange('connected');
        }
      },
      (error) => {
        console.warn(`[CloudSync onSnapshot] Gagal menyinkronkan data remote (${key}):`, error);
        if (onStatusChange) onStatusChange('error', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`[CloudSync onSnapshot] Error saat inisialisasi listener (${key}):`, err);
    if (onStatusChange) onStatusChange('error', err);
    return () => {};
  }
}

/**
 * Push data changes to Firestore so all other devices and open tabs receive the onSnapshot update immediately
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
    console.warn(`[CloudSync push] Gagal push ke Firestore (${key}):`, error);
  }
}

/**
 * Fetch initial cloud state on demand if needed
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
    console.warn(`[CloudSync fetch] Gagal fetch data (${key}):`, error);
    return null;
  }
}
