import { describe, it, expect, beforeEach } from 'vitest';
import { formatInr, clearCache } from '../src/index.js';

describe('formatInr', () => {
  it('formats number as INR currency', () => {
    const result = formatInr(1000);
    expect(result).toContain('1,000.00');
    expect(result).toContain('₹');
  });

  it('formats large numbers with proper Indian notation', () => {
    const result = formatInr(168542.5);
    expect(result).toContain('1,68,542.50');
  });

  it('returns em dash for null', () => {
    expect(formatInr(null)).toBe('—');
  });

  it('returns em dash for undefined', () => {
    expect(formatInr(undefined)).toBe('—');
  });

  it('handles zero', () => {
    const result = formatInr(0);
    expect(result).toContain('0.00');
  });

  it('formats small decimal values', () => {
    const result = formatInr(99.99);
    expect(result).toContain('99.99');
  });
});

describe('getSolPrice', () => {
  beforeEach(() => {
    clearCache();
    global.fetch = originalFetch;
  });

  const originalFetch = global.fetch;

  function mockFetch(data) {
    global.fetch = () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    });
  }

  it('returns price from API', async () => {
    mockFetch({ solana: { inr: 168542.5 } });
    const { getSolPrice } = await import('../src/index.js');
    const { price } = await getSolPrice();
    expect(price).toBe(168542.5);
  });

  it('returns price and change24h when includeChange is true', async () => {
    mockFetch({ solana: { inr: 168542.5, inr_24h_change: 2.34 } });
    const { getSolPrice } = await import('../src/index.js');
    const result = await getSolPrice({ includeChange: true });
    expect(result.price).toBe(168542.5);
    expect(result.change24h).toBe(2.34);
  });

  it('returns fallback price on API failure', async () => {
    global.fetch = () => Promise.reject(new Error('Network error'));
    const { getSolPrice } = await import('../src/index.js');
    const { price } = await getSolPrice();
    expect(price).toBe(20000);
  });

  it('returns fallback with change24h: 0 on API failure', async () => {
    global.fetch = () => Promise.reject(new Error('Network error'));
    const { getSolPrice } = await import('../src/index.js');
    const result = await getSolPrice({ includeChange: true });
    expect(result.price).toBe(20000);
    expect(result.change24h).toBe(0);
  });

  it('uses cache on subsequent calls', async () => {
    mockFetch({ solana: { inr: 168542.5 } });
    const { getSolPrice } = await import('../src/index.js');
    const first = await getSolPrice();
    const second = await getSolPrice();
    expect(first.price).toBe(second.price);
  });

  it('forceRefresh bypasses cache', async () => {
    mockFetch({ solana: { inr: 168542.5 } });
    const { getSolPrice } = await import('../src/index.js');
    const first = await getSolPrice();
    mockFetch({ solana: { inr: 170000 } });
    const refreshed = await getSolPrice({}, { forceRefresh: true });
    expect(refreshed.price).toBe(170000);
  });
});
