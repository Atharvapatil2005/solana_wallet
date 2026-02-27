const RPC_STORAGE_KEY = 'solana_rpc_url';

function getLocalhostRpcUrl() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:8899`;
  }
  return 'http://127.0.0.1:8899';
}

export const PRESET_RPC_ENDPOINTS = [
  { id: 'localhost', label: 'Localhost', url: getLocalhostRpcUrl() },
  { id: 'devnet', label: 'Devnet', url: 'https://api.devnet.solana.com' },
  { id: 'testnet', label: 'Testnet', url: 'https://api.testnet.solana.com' },
];

function getEnvRpcUrl() {
  return import.meta.env?.VITE_SOLANA_RPC?.trim() || '';
}

export function getDefaultRpcUrl() {
  return getEnvRpcUrl() || PRESET_RPC_ENDPOINTS[0].url;
}

export function getStoredRpcUrl() {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(RPC_STORAGE_KEY)?.trim() || '';
  } catch (_) {
    return '';
  }
}

export function getRpcUrl() {
  return getStoredRpcUrl() || getDefaultRpcUrl();
}

export function setRpcUrl(url) {
  const nextUrl = `${url || ''}`.trim();
  if (!nextUrl) throw new Error('RPC URL is required');
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(RPC_STORAGE_KEY, nextUrl);
    } catch (_) {
      // Ignore storage failures and still update runtime connection.
    }
  }
  return nextUrl;
}

