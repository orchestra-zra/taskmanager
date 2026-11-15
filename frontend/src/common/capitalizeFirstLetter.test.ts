import { describe, it, expect } from 'vitest';
import capitalizeFirstLetter from './capitalizeFirstLetter';

describe('capitalizeFirstLetter', () => {
  it('capitalizes a single lowercase word', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
  });

  it('leaves an already-capitalized word untouched', () => {
    expect(capitalizeFirstLetter('Hello')).toBe('Hello');
  });

  it('capitalizes only the first word of a multi-word string', () => {
    expect(capitalizeFirstLetter('hello world again')).toBe('Hello world again');
  });

  it('handles a single character', () => {
    expect(capitalizeFirstLetter('h')).toBe('H');
  });

  it('leaves a leading digit untouched (charAt/toUpperCase on digit is a no-op)', () => {
    expect(capitalizeFirstLetter('123abc')).toBe('123abc');
  });

  it('returns an empty string for empty input', () => {
    expect(capitalizeFirstLetter('')).toBe('');
  });

  it('returns an empty string for undefined (guarded by falsy check)', () => {
    expect(capitalizeFirstLetter(undefined)).toBe('');
  });

  it('does not skip leading spaces: first "word" is the empty chunk before the space', () => {
    // Documents ACTUAL behavior: " lead".split(" ")[0] === "" so nothing changes.
    expect(capitalizeFirstLetter(' lead')).toBe(' lead');
  });
});
