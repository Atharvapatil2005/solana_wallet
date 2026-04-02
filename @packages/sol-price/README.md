# @atharvapatill/sol-price

> Fetch real-time Solana (SOL) price in Indian Rupees (INR) from CoinGecko

## Features

- **Real-time price** from CoinGecko API
- **24h price change** optional
- **30-second caching** to avoid rate limits
- **Retry logic** with exponential backoff (3 attempts)
- **Fallback price** (₹20,000) on API failure
- **INR formatting** with proper Indian number notation

## Installation

```bash
npm install @atharvapatill/sol-price
```

## Usage

### ESM / TypeScript

```javascript
import { getSolPrice, formatInr } from '@atharvapatill/sol-price';
```

### CJS

```javascript
const { getSolPrice, formatInr } = require('@atharvapatill/sol-price');
```

## API

### `getSolPrice(options, config)`

Fetches the current SOL price in INR from CoinGecko.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.includeChange` | `boolean` | `false` | Include 24h price change |
| `config.forceRefresh` | `boolean` | `false` | Bypass cache and fetch fresh |

**Returns:**

```typescript
// Basic
{ price: number }

// With includeChange: true
{ price: number, change24h: number }
```

**Example:**

```javascript
// Basic usage
const { price } = await getSolPrice();
// price = 168542.50

// With 24h change
const { price, change24h } = await getSolPrice({ includeChange: true });
// price = 168542.50
// change24h = 2.34

// Force fresh fetch (bypass cache)
const { price } = await getSolPrice({}, { forceRefresh: true });
```

---

### `formatInr(value)`

Formats a number as Indian Rupee currency string.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `number \| null \| undefined` | Number to format |

**Returns:** `string`

**Example:**

```javascript
formatInr(168542.5);   // "₹1,68,542.50"
formatInr(1000);       // "₹1,000.00"
formatInr(0);          // "₹0.00"
formatInr(null);      // "—"
formatInr(undefined);  // "—"
```

---

### `clearCache()`

Clears the internal price cache. Useful for testing.

```javascript
import { clearCache } from '@atharvapatill/sol-price';
clearCache();
```

## Caching

The package caches the last fetched price for **30 seconds** to avoid hitting CoinGecko's rate limit. Subsequent calls within this window return the cached value.

To force a fresh fetch, use:

```javascript
await getSolPrice({}, { forceRefresh: true });
```

## Error Handling

If CoinGecko API fails after 3 retries, the package returns a **fallback price of ₹20,000** so your app doesn't break.

```javascript
const { price } = await getSolPrice();
// Returns 20000 if API is down
```

## Rate Limits

CoinGecko's free API has rate limits (~10-30 calls/minute). The built-in 30-second cache helps stay within limits, but for high-frequency use consider:

- Using the cache (default behavior)
- Implementing your own debounce/throttle layer
- Upgrading to a paid CoinGecko plan

## License

MIT
