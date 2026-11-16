import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// dateTimeConverter imports `t` from i18next for month/day names.
// Mock it so t(key) === key — stable and assertion-friendly.
vi.mock('i18next', () => ({
  t: (key: string) => key,
}));

import { dateTimeConverter } from './dateTimeConverter';

// Identity-mocked month keys, matching the order used inside the util.
const MONTH_KEYS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

const pad = (n: number) => n.toString().padStart(2, '0');
const timeOf = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const DAY_MS = 1000 * 60 * 60 * 24;

describe('dateTimeConverter', () => {
  beforeEach(() => {
    // Fixed "now": 2026-06-15 12:00:00 local time. All test dates are derived
    // from `new Date()` via exact ms offsets, so behavior is DST/timezone-proof:
    // floor((now - (now - N*24h)) / 24h) === N regardless of the host timezone.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const dateOffset = (daysAgo: number, ms = 0) =>
    new Date(Date.now() - daysAgo * DAY_MS - ms);

  describe('convertTime', () => {
    it('formats a date from today as "today, HH:MM"', () => {
      const d = dateOffset(0, 61 * 60 * 1000); // 10:59 today
      expect(dateTimeConverter.convertTime(d.toISOString())).toBe(
        `today, ${timeOf(d)}`,
      );
    });

    it('formats a date exactly 24h ago as "yesterday, HH:MM"', () => {
      const d = dateOffset(1);
      expect(dateTimeConverter.convertTime(d.toISOString())).toBe(
        `yesterday, ${timeOf(d)}`,
      );
    });

    it('formats an older date as "D Mon, HH:MM" using the month key', () => {
      const d = dateOffset(3); // 2026-06-12 12:00 local
      expect(dateTimeConverter.convertTime(d.toISOString())).toBe(
        `${d.getDate()} ${MONTH_KEYS[d.getMonth()]}, ${timeOf(d)}`,
      );
    });

    it('zero-pads single-digit hours and minutes', () => {
      // Fake "now" is 12:00 local; subtracting 11h 55m lands on 00:05 today.
      const d = dateOffset(0, 11 * 60 * 60 * 1000 + 55 * 60 * 1000);
      expect(d.getHours()).toBeLessThan(10);
      expect(dateTimeConverter.convertTime(d.toISOString())).toBe(
        `today, ${pad(d.getHours())}:${pad(d.getMinutes())}`,
      );
      expect(timeOf(d)).toMatch(/^\d{2}:\d{2}$/);
    });

    it('documents current behavior for invalid dates: output contains NaN (no guard yet)', () => {
      // Invalid input currently flows straight through Date arithmetic:
      // new Date('garbage').getTime() === NaN -> "NaN" fragments in the result.
      expect(dateTimeConverter.convertTime('not-a-date')).toContain('NaN');
    });
  });

  describe('convertDay', () => {
    it('returns "today" for a date from today', () => {
      expect(dateTimeConverter.convertDay(dateOffset(0).toISOString())).toBe('today');
    });

    it('returns "yesterday" for a date exactly 24h ago', () => {
      expect(dateTimeConverter.convertDay(dateOffset(1).toISOString())).toBe(
        'yesterday',
      );
    });

    it('returns "D Mon" for an older date', () => {
      const d = dateOffset(5);
      expect(dateTimeConverter.convertDay(d.toISOString())).toBe(
        `${d.getDate()} ${MONTH_KEYS[d.getMonth()]}`,
      );
    });

    it('documents current behavior for invalid dates: output contains NaN (no guard yet)', () => {
      expect(dateTimeConverter.convertDay('not-a-date')).toContain('NaN');
    });
  });
});
