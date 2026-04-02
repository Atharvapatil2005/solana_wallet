const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';
const CACHE_DURATION_MS = 30_000;
const FALLBACK_PRICE = 20_000;
const MAX_RETRIES = 3;

let cachedPrice = null;
let cacheTimestamp = 0;

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError;
}

export async function getSolPrice(
  options = { includeChange: false },
  config = { forceRefresh: false }
) {
  const { includeChange = false } = options;
  const { forceRefresh = false } = config;

  const now = Date.now();
  const isCacheValid = !forceRefresh && cachedPrice && now - cacheTimestamp < CACHE_DURATION_MS;

  if (isCacheValid) {
    if (includeChange) {
      return { price: cachedPrice.price, change24h: cachedPrice.change24h };
    }
    return { price: cachedPrice.price };
  }

  try {
    const url = includeChange
      ? `${COINGECKO_API}?ids=solana&vs_currencies=inr&include_24hr_change=true`
      : `${COINGECKO_API}?ids=solana&vs_currencies=inr`;

    const data = await fetchWithRetry(url);
    const price = data.solana?.inr ?? FALLBACK_PRICE;
    const change24h = data.solana?.inr_24h_change ?? 0;

    cachedPrice = { price, change24h };
    cacheTimestamp = now;

    if (includeChange) {
      return { price, change24h };
    }
    return { price };
  } catch (error) {
    console.warn(`[@atharvapatill/sol-price] API failed, using fallback: ${error.message}`);
    return includeChange ? { price: FALLBACK_PRICE, change24h: 0 } : { price: FALLBACK_PRICE };
  }
}

export function formatInr(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function clearCache() {
  cachedPrice = null;
  cacheTimestamp = 0;
}
