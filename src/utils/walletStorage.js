// Utility functions for wallet storage and backup tracking

const LOCAL_STORAGE_KEY = 'solana_wallet_secret';
const BACKUP_FLAG_KEY = 'solana_wallet_backup_downloaded';

/**
 * Get the backup downloaded flag for the current wallet
 * @param {string} address - The wallet public key (base58)
 * @returns {boolean} - True if backup has been downloaded, false otherwise
 */
export function hasBackupDownloaded(address) {
  if (!address) return false;
  
  try {
    const backupData = localStorage.getItem(BACKUP_FLAG_KEY);
    if (!backupData) return false;
    
    const backupMap = JSON.parse(backupData);
    return backupMap[address] === true;
  } catch {
    return false;
  }
}

/**
 * Set the backup downloaded flag for a wallet
 * @param {string} address - The wallet public key (base58)
 */
export function setBackupDownloaded(address) {
  if (!address) return;
  
  try {
    const backupData = localStorage.getItem(BACKUP_FLAG_KEY);
    const backupMap = backupData ? JSON.parse(backupData) : {};
    backupMap[address] = true;
    localStorage.setItem(BACKUP_FLAG_KEY, JSON.stringify(backupMap));
  } catch (error) {
    console.error('Failed to set backup flag:', error);
  }
}

/**
 * Clear the backup flag (useful when wallet is removed)
 * @param {string} address - The wallet public key (base58)
 */
export function clearBackupFlag(address) {
  if (!address) return;
  
  try {
    const backupData = localStorage.getItem(BACKUP_FLAG_KEY);
    if (!backupData) return;
    
    const backupMap = JSON.parse(backupData);
    delete backupMap[address];
    localStorage.setItem(BACKUP_FLAG_KEY, JSON.stringify(backupMap));
  } catch (error) {
    console.error('Failed to clear backup flag:', error);
  }
}

