// Multi-wallet management system
// Handles storage, retrieval, and management of multiple wallets

import { Keypair } from '@solana/web3.js';

const WALLETS_STORAGE_KEY = 'solana_wallets';
const ACTIVE_WALLET_KEY = 'solana_active_wallet_id';
const LEGACY_STORAGE_KEY = 'solana_wallet_secret'; // For migration

/**
 * Generate a unique wallet ID
 * @returns {string} UUID-like string
 */
function generateWalletId() {
  return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Migrate legacy single wallet to new multi-wallet format
 * This runs once on app load if legacy wallet exists
 */
function migrateLegacyWallet() {
  try {
    const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyData) return null;

    // Check if wallets already exist
    const existingWallets = localStorage.getItem(WALLETS_STORAGE_KEY);
    if (existingWallets) {
      // Already migrated, remove legacy
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return null;
    }

    // Migrate legacy wallet
    const secretKey = JSON.parse(legacyData);
    const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    const publicKey = keypair.publicKey.toBase58();

    const wallet = {
      id: generateWalletId(),
      publicKey: publicKey,
      secretKey: secretKey,
      label: 'Wallet 1',
      backupDownloaded: false,
      createdAt: Date.now(),
    };

    const wallets = [wallet];
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets));
    localStorage.setItem(ACTIVE_WALLET_KEY, wallet.id);
    
    // Remove legacy storage
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    
    console.log('[WalletManager] Migrated legacy wallet to multi-wallet format');
    return wallet;
  } catch (error) {
    console.error('[WalletManager] Migration failed:', error);
    return null;
  }
}

/**
 * Get all wallets from localStorage
 * @returns {Array} Array of wallet objects
 */
export function getWallets() {
  try {
    // Migrate legacy wallet if exists
    migrateLegacyWallet();

    const data = localStorage.getItem(WALLETS_STORAGE_KEY);
    if (!data) return [];

    const wallets = JSON.parse(data);
    return Array.isArray(wallets) ? wallets : [];
  } catch (error) {
    console.error('[WalletManager] Failed to get wallets:', error);
    return [];
  }
}

/**
 * Get the currently active wallet
 * @returns {Object|null} Active wallet object or null
 */
export function getActiveWallet() {
  try {
    const wallets = getWallets();
    if (wallets.length === 0) return null;

    const activeId = localStorage.getItem(ACTIVE_WALLET_KEY);
    
    // If no active ID, use first wallet
    if (!activeId) {
      const firstWallet = wallets[0];
      if (firstWallet) {
        setActiveWallet(firstWallet.id);
        return firstWallet;
      }
      return null;
    }

    const activeWallet = wallets.find(w => w.id === activeId);
    if (activeWallet) return activeWallet;

    // Active wallet not found, use first available
    if (wallets.length > 0) {
      setActiveWallet(wallets[0].id);
      return wallets[0];
    }

    return null;
  } catch (error) {
    console.error('[WalletManager] Failed to get active wallet:', error);
    return null;
  }
}

/**
 * Set the active wallet by ID
 * @param {string} walletId - Wallet ID to set as active
 */
export function setActiveWallet(walletId) {
  try {
    const wallets = getWallets();
    const wallet = wallets.find(w => w.id === walletId);
    
    if (!wallet) {
      console.warn('[WalletManager] Wallet not found:', walletId);
      return;
    }

    localStorage.setItem(ACTIVE_WALLET_KEY, walletId);
  } catch (error) {
    console.error('[WalletManager] Failed to set active wallet:', error);
  }
}

/**
 * Get Keypair from wallet object
 * @param {Object} wallet - Wallet object
 * @returns {Keypair} Solana Keypair
 */
export function getKeypairFromWallet(wallet) {
  if (!wallet || !wallet.secretKey) return null;
  try {
    return Keypair.fromSecretKey(Uint8Array.from(wallet.secretKey));
  } catch (error) {
    console.error('[WalletManager] Failed to create keypair:', error);
    return null;
  }
}

/**
 * Get Keypair for active wallet
 * @returns {Keypair|null} Active wallet keypair
 */
export function getActiveKeypair() {
  const wallet = getActiveWallet();
  if (!wallet) return null;
  return getKeypairFromWallet(wallet);
}

/**
 * Add a new wallet to storage
 * @param {Object} walletData - Wallet data (publicKey, secretKey, label?)
 * @returns {Object} Created wallet object with ID
 */
export function addWallet(walletData) {
  try {
    const { publicKey, secretKey, label } = walletData;
    
    if (!publicKey || !secretKey) {
      throw new Error('Wallet must have publicKey and secretKey');
    }

    const wallets = getWallets();
    
    // Check if wallet already exists (by publicKey)
    const exists = wallets.find(w => w.publicKey === publicKey);
    if (exists) {
      throw new Error('Wallet already exists');
    }

    const wallet = {
      id: generateWalletId(),
      publicKey: publicKey,
      secretKey: secretKey,
      label: label || `Wallet ${wallets.length + 1}`,
      backupDownloaded: false,
      createdAt: Date.now(),
    };

    wallets.push(wallet);
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets));

    // Set as active if it's the first wallet
    if (wallets.length === 1) {
      setActiveWallet(wallet.id);
    }

    return wallet;
  } catch (error) {
    console.error('[WalletManager] Failed to add wallet:', error);
    throw error;
  }
}

/**
 * Update wallet data
 * @param {string} walletId - Wallet ID to update
 * @param {Object} updates - Partial wallet object with fields to update
 */
export function updateWallet(walletId, updates) {
  try {
    const wallets = getWallets();
    const index = wallets.findIndex(w => w.id === walletId);
    
    if (index === -1) {
      throw new Error('Wallet not found');
    }

    wallets[index] = { ...wallets[index], ...updates };
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets));
    
    return wallets[index];
  } catch (error) {
    console.error('[WalletManager] Failed to update wallet:', error);
    throw error;
  }
}

/**
 * Remove a wallet from storage
 * @param {string} walletId - Wallet ID to remove
 * @returns {Object|null} Next active wallet or null
 */
export function removeWallet(walletId) {
  try {
    const wallets = getWallets();
    const activeWallet = getActiveWallet();
    
    // Find wallet to remove
    const walletToRemove = wallets.find(w => w.id === walletId);
    if (!walletToRemove) {
      throw new Error('Wallet not found');
    }

    // Remove wallet
    const updatedWallets = wallets.filter(w => w.id !== walletId);
    
    if (updatedWallets.length === 0) {
      // No wallets left, clear storage
      localStorage.removeItem(WALLETS_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_WALLET_KEY);
      return null;
    }

    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(updatedWallets));

    // If removing active wallet, set next wallet as active
    if (activeWallet && activeWallet.id === walletId) {
      const nextWallet = updatedWallets[0];
      setActiveWallet(nextWallet.id);
      return nextWallet;
    }

    return activeWallet;
  } catch (error) {
    console.error('[WalletManager] Failed to remove wallet:', error);
    throw error;
  }
}

/**
 * Export wallet as JSON file
 * @param {string} walletId - Wallet ID to export
 * @returns {Promise<void>}
 */
export function exportWallet(walletId) {
  return new Promise((resolve, reject) => {
    try {
      const wallets = getWallets();
      const wallet = wallets.find(w => w.id === walletId);
      
      if (!wallet) {
        reject(new Error('Wallet not found'));
        return;
      }

      const exportData = {
        publicKey: wallet.publicKey,
        secretKey: wallet.secretKey,
      };

      const blob = new Blob(
        [JSON.stringify(exportData, null, 2)], 
        { type: 'application/json' }
      );
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wallet_${wallet.label || wallet.id}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Mark backup as downloaded
      updateWallet(walletId, { backupDownloaded: true });
      
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Import wallet from JSON file or secret key array
 * @param {Object|Array} data - Either {publicKey, secretKey} object or secretKey array
 * @param {string} label - Optional label for the wallet
 * @returns {Object} Created wallet object
 */
export function importWallet(data, label) {
  try {
    let publicKey, secretKey;

    if (Array.isArray(data)) {
      // Legacy format: just secret key array
      const keypair = Keypair.fromSecretKey(Uint8Array.from(data));
      publicKey = keypair.publicKey.toBase58();
      secretKey = data;
    } else if (data.secretKey && data.publicKey) {
      // New format: { publicKey, secretKey }
      secretKey = Array.isArray(data.secretKey) ? data.secretKey : data.secretKey;
      
      // Validate that publicKey matches secretKey
      const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
      const derivedPublicKey = keypair.publicKey.toBase58();
      
      if (derivedPublicKey !== data.publicKey) {
        throw new Error('Public key does not match secret key');
      }
      
      publicKey = derivedPublicKey;
    } else {
      throw new Error('Invalid wallet data format');
    }

    return addWallet({ publicKey, secretKey, label });
  } catch (error) {
    console.error('[WalletManager] Failed to import wallet:', error);
    throw error;
  }
}

