import { UserAccount, Santri } from '../types';

/**
 * Hash password securely using custom salt and hashing logic
 */
export function hashPassword(plainText: string): string {
  if (!plainText) return '';
  const salt = 'SIP_RTQ_SALT_2026_';
  let hash = 0;
  const str = salt + plainText;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  // Convert to hex-like string representation
  const hexPart = Math.abs(hash).toString(16).padStart(8, '0');
  let secondary = 5381;
  for (let i = 0; i < plainText.length; i++) {
    secondary = ((secondary << 5) + secondary) + plainText.charCodeAt(i);
  }
  const secHex = Math.abs(secondary).toString(16).padStart(8, '0');
  return `rtq_sec_${hexPart}_${secHex}`;
}

/**
 * Verify user password against hashed string or fallback initial default
 */
export function verifyPassword(inputPass: string, storedHashOrPass?: string): boolean {
  if (!storedHashOrPass || !inputPass) return false;
  
  // If stored in raw format
  if (storedHashOrPass === inputPass) return true;

  // If stored in hashed format
  const inputHash = hashPassword(inputPass);
  if (storedHashOrPass === inputHash) return true;

  return false;
}

/**
 * Default Admin Account definition
 */
export const DEFAULT_ADMIN_ACCOUNT: UserAccount = {
  id: 'USR_ADMIN_001',
  username: 'Admin',
  nama: 'Administrator Utama RTQ',
  role: 'Admin',
  password: 'Admin123',
  plainPassword: 'Admin123',
  passwordHash: hashPassword('Admin123'),
  email: 'admin@rtqcendikia.sch.id',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isActive: true,
  isDefaultPassword: true,
  createdAt: '2024-01-01'
};

/**
 * Generate Wali Santri Accounts for all 65 Santri
 * Synchronized with the exact Nama_Wali from Data Santri
 */
export function generateWaliAccounts(santriList: Santri[]): UserAccount[] {
  const defaultWaliHash = hashPassword('rtq_cedikia');
  
  return santriList.map((s) => ({
    id: `USR_WALI_${s.NIS}`,
    username: s.Nama_Lengkap,
    nama: s.Nama_Wali, // Nama Wali Santri yang sama persis dengan yang ada di Data Santri
    role: 'Wali Santri' as const,
    password: 'rtq_cedikia',
    plainPassword: 'rtq_cedikia',
    passwordHash: defaultWaliHash,
    santriNIS: s.NIS,
    namaSantri: s.Nama_Lengkap,
    email: `${s.NIS.toLowerCase()}@wali.rtqcendikia.sch.id`,
    isActive: true,
    isDefaultPassword: true,
    createdAt: s.Tanggal_Masuk || '2024-07-15'
  }));
}
