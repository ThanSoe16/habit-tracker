/**
 * Utility functions for parsing and formatting habit time values.
 */

/**
 * Parses timeTaken string/number (e.g. "01:00:00", "61:00", "60:00", "60", 60) into total seconds.
 */
export function parseTimeTakenToSeconds(timeTaken?: string | number): number {
  if (timeTaken === undefined || timeTaken === null || timeTaken === '') return 0;
  const str = String(timeTaken).trim();
  if (!str) return 0;

  const parts = str.split(':');
  if (parts.length === 3) {
    const h = parseInt(parts[0] || '0', 10);
    const m = parseInt(parts[1] || '0', 10);
    const s = parseInt(parts[2] || '0', 10);
    return (isNaN(h) ? 0 : h) * 3600 + (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s);
  }
  if (parts.length === 2) {
    const m = parseInt(parts[0] || '0', 10);
    const s = parseInt(parts[1] || '0', 10);
    return (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s);
  }
  const val = parseInt(str, 10);
  if (isNaN(val)) return 0;
  // If it's a raw number without colon, assume it represents minutes
  return val * 60;
}

/**
 * Formats total seconds or timeTaken string into display format.
 * If total time >= 60 minutes (>= 3600 seconds): HH:MM:SS (e.g. "01:00:00", "01:01:00")
 * Else: MM:SS (e.g. "59:50", "00:00")
 */
export function formatTimeTakenDisplay(timeTaken?: string | number): string {
  if (timeTaken === undefined || timeTaken === null || timeTaken === '') return '00:00';

  let totalSecs = 0;
  if (typeof timeTaken === 'number') {
    totalSecs = timeTaken;
  } else {
    totalSecs = parseTimeTakenToSeconds(timeTaken);
  }

  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Normalizes time strings like "07:00 AM", "8:30 PM", "0030", "730", "07:00" to valid 24-hour "HH:MM" format.
 */
export function normalize24HourTime(timeStr?: string): string {
  if (!timeStr) return '07:00';
  const str = String(timeStr).trim();
  if (!str) return '07:00';

  const upper = str.toUpperCase();
  if (upper.endsWith('AM') || upper.endsWith('PM')) {
    const isPm = upper.endsWith('PM');
    const cleaned = str.replace(/AM|PM/gi, '').trim();
    const parts = cleaned.split(':');
    let h = parseInt(parts[0] || '0', 10);
    const m = parseInt(parts[1] || '0', 10);
    if (isNaN(h)) h = 7;
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
    const safeM = isNaN(m) ? 0 : Math.max(0, Math.min(59, m));
    return `${String(h).padStart(2, '0')}:${String(safeM).padStart(2, '0')}`;
  }

  // Handle strings with colon e.g. "00:30", "7:30"
  if (str.includes(':')) {
    const parts = str.split(':');
    const h = Math.max(0, Math.min(23, parseInt(parts[0] || '0', 10)));
    const m = Math.max(0, Math.min(59, parseInt(parts[1] || '0', 10)));
    return `${String(isNaN(h) ? 7 : h).padStart(2, '0')}:${String(isNaN(m) ? 0 : m).padStart(2, '0')}`;
  }

  // Handle 3 or 4 digit numeric strings without colon e.g. "0030", "0700", "930"
  const digitsOnly = str.replace(/\D/g, '');
  if (digitsOnly.length === 4) {
    const h = Math.max(0, Math.min(23, parseInt(digitsOnly.slice(0, 2), 10)));
    const m = Math.max(0, Math.min(59, parseInt(digitsOnly.slice(2, 4), 10)));
    return `${String(isNaN(h) ? 7 : h).padStart(2, '0')}:${String(isNaN(m) ? 0 : m).padStart(2, '0')}`;
  }
  if (digitsOnly.length === 3) {
    const h = Math.max(0, Math.min(23, parseInt(digitsOnly.slice(0, 1), 10)));
    const m = Math.max(0, Math.min(59, parseInt(digitsOnly.slice(1, 3), 10)));
    return `${String(isNaN(h) ? 7 : h).padStart(2, '0')}:${String(isNaN(m) ? 0 : m).padStart(2, '0')}`;
  }

  return '07:00';
}
