// Utility helpers for consistent timestamp formatting across the app

/**
 * Normalize different timestamp inputs (seconds, milliseconds, Date) into a Date instance.
 * @param {number|string|Date|null|undefined} input
 * @returns {Date|null}
 */
function normalizeToDate(input) {
  if (input === null || input === undefined) return null;

  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }

  let value = input;

  if (typeof input === 'string') {
    const numeric = Number(input);
    if (!Number.isNaN(numeric)) {
      value = numeric;
    } else {
      const parsed = new Date(input);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    // If the value looks like seconds, convert to ms
    const ms = value < 1e12 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

/**
 * Format a timestamp into "15 Nov 2025, 04:21 PM" in the user's local timezone.
 * @param {number|string|Date|null} input - seconds, milliseconds, ISO string, or Date
 * @returns {string}
 */
export function formatTimestamp(input) {
  const date = normalizeToDate(input);
  if (!date) return '—';

  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString(undefined, { month: 'short' });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hourString = hours.toString().padStart(2, '0');

  return `${day} ${month} ${year}, ${hourString}:${minutes} ${period}`;
}

/**
 * Format a timestamp into a relative string such as "2 min ago".
 * Falls back to absolute format if older than a week.
 * @param {number|string|Date|null} input
 * @returns {string}
 */
export function formatRelativeTimestamp(input) {
  const date = normalizeToDate(input);
  if (!date) return '—';

  const now = Date.now();
  const diffMs = now - date.getTime();

  if (diffMs < 0) return 'Just now';
  if (diffMs < 15 * 1000) return 'Just now';

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) {
    const seconds = Math.floor(diffMs / 1000);
    return `${seconds}s ago`;
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  return formatTimestamp(date);
}


