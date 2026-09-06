import { FotoKegiatanRecord } from '../types';

const DB_NAME = 'rtq_cendikia_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'foto_kegiatan_store';
const STORAGE_KEY = 'RTQ_FOTO_KEGIATAN_BACKUP';

// Initialize IndexedDB
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Save all albums to IndexedDB and fallback to localStorage
export async function persistFotoKegiatan(albums: FotoKegiatanRecord[]): Promise<void> {
  // 1. Try saving to IndexedDB for large capacity
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ key: 'all_albums', data: albums, updatedAt: new Date().toISOString() });
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed, falling back to localStorage:', err);
  }

  // 2. Also attempt localStorage backup (safely handled if quota exceeded)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
  } catch (quotaErr) {
    console.warn('localStorage quota reached for images; IndexedDB handles persistence.', quotaErr);
  }
}

const isMockAlbumId = (id: string) => id.startsWith('FTO_00') || ['FTO_001', 'FTO_002', 'FTO_003', 'FTO_004', 'FTO_007', 'FTO_008'].includes(id);

// Load albums from IndexedDB or fallback to localStorage / initial data
export async function loadPersistedFotoKegiatan(defaultData: FotoKegiatanRecord[]): Promise<FotoKegiatanRecord[]> {
  // 1. Try loading from IndexedDB first
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get('all_albums');

    const result = await new Promise<{ key: string; data: FotoKegiatanRecord[] } | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (result && Array.isArray(result.data)) {
      const filtered = result.data.filter(a => !isMockAlbumId(a.id));
      return filtered;
    }
  } catch (err) {
    console.warn('IndexedDB load error, checking localStorage:', err);
  }

  // 2. Check localStorage fallback
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((a: FotoKegiatanRecord) => !isMockAlbumId(a.id));
        return filtered;
      }
    }
  } catch (e) {
    console.error('Failed reading from localStorage:', e);
  }

  return defaultData.filter(a => !isMockAlbumId(a.id));
}

export interface ImageProcessingResult {
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape' | 'square' | 'poster-tall';
  fileName: string;
  fileSize: number;
}

// Detect orientation from aspect ratio
export function determineOrientation(aspectRatio: number): 'portrait' | 'landscape' | 'square' | 'poster-tall' {
  if (aspectRatio <= 0.6) {
    return 'poster-tall'; // very tall poster, e.g. 1:2 or 1:3
  } else if (aspectRatio < 0.92) {
    return 'portrait'; // standard vertical, e.g. 3:4, 2:3, 9:16
  } else if (aspectRatio <= 1.08) {
    return 'square'; // approx 1:1
  } else {
    return 'landscape'; // standard horizontal, e.g. 4:3, 16:9, 21:9
  }
}

// Process Image file of ANY orientation, dimension, or resolution preserving maximum clarity while optimizing size
export function processImageFile(file: File, maxDimension: number = 1920): Promise<ImageProcessingResult> {
  return new Promise((resolve, reject) => {
    // Check if it is SVG or GIF where we preserve raw data
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const width = img.naturalWidth || 800;
          const height = img.naturalHeight || 600;
          const aspectRatio = width / height;
          resolve({
            url,
            width,
            height,
            aspectRatio,
            orientation: determineOrientation(aspectRatio),
            fileName: file.name,
            fileSize: file.size
          });
        };
        img.onerror = () => {
          resolve({
            url,
            width: 800,
            height: 600,
            aspectRatio: 800 / 600,
            orientation: 'landscape',
            fileName: file.name,
            fileSize: file.size
          });
        };
        img.src = url;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    // For raster images (JPEG, PNG, WEBP, AVIF, HEIC/BMP):
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      
      img.onload = () => {
        const origWidth = img.naturalWidth || 1200;
        const origHeight = img.naturalHeight || 800;
        const aspectRatio = origWidth / origHeight;
        const orientation = determineOrientation(aspectRatio);

        const maxDim = maxDimension;
        let targetWidth = origWidth;
        let targetHeight = origHeight;

        if (origWidth > maxDim || origHeight > maxDim) {
          if (origWidth > origHeight) {
            targetWidth = maxDim;
            targetHeight = Math.round((maxDim / origWidth) * origHeight);
          } else {
            targetHeight = maxDim;
            targetWidth = Math.round((maxDim / origHeight) * origWidth);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({
            url: rawDataUrl,
            width: origWidth,
            height: origHeight,
            aspectRatio,
            orientation,
            fileName: file.name,
            fileSize: file.size
          });
          return;
        }

        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Export as JPEG with 0.85 quality (crisp text & photos while reducing 10MB -> ~180KB)
        const outputMime = file.type === 'image/png' && !file.type.includes('jpeg') ? 'image/jpeg' : 'image/jpeg';
        const processedUrl = canvas.toDataURL(outputMime, 0.85);

        resolve({
          url: processedUrl,
          width: targetWidth,
          height: targetHeight,
          aspectRatio,
          orientation,
          fileName: file.name,
          fileSize: processedUrl.length
        });
      };

      img.onerror = () => {
        resolve({
          url: rawDataUrl,
          width: 1200,
          height: 800,
          aspectRatio: 1.5,
          orientation: 'landscape',
          fileName: file.name,
          fileSize: file.size
        });
      };

      img.src = rawDataUrl;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
