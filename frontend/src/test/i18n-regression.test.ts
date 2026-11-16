import { describe, it, expect } from 'vitest';

import en from '../../public/locales/en/translation.json';
import ru from '../../public/locales/ru/translation.json';
import uz from '../../public/locales/uz/translation.json';

const locales: Array<[name: string, dict: Record<string, string>]> = [
  ['en', en as Record<string, string>],
  ['ru', ru as Record<string, string>],
  ['uz', uz as Record<string, string>],
];

describe('i18n regression: delete-confirmation lockout (P0 fix)', () => {
  it('delete_confirmation_word is exactly "Sure" in every locale', () => {
    for (const [name, dict] of locales) {
      expect(dict.delete_confirmation_word, `${name}: delete_confirmation_word`).toBe('Sure');
    }
  });

  it('uz delete_confirmation asks for "Sure", not "I\'m Sure" (was a lockout bug)', () => {
    const uzConfirmation = uz.delete_confirmation;
    expect(uzConfirmation).toContain('Sure');
    expect(uzConfirmation).not.toContain("I'm Sure");
  });

  it('en and ru delete_confirmation also reference "Sure" (word matches)', () => {
    for (const [name, dict] of locales) {
      expect(dict.delete_confirmation, `${name}: delete_confirmation`).toContain('Sure');
    }
  });
});

describe('i18n regression: error/label keys parity across locales', () => {
  const requiredKeys = [
    'error_generic',
    'error_retry',
    'error_create_task',
    'error_comment',
    'error_save',
    'type_here',
    'confirm',
    'unarchive',
    'delete_task',
  ];

  for (const [name, dict] of locales) {
    for (const key of requiredKeys) {
      it(`${name}: "${key}" exists and is a non-empty string`, () => {
        expect(typeof dict[key], `${name}: ${key} type`).toBe('string');
        expect(dict[key]?.trim(), `${name}: ${key} empty`).not.toBe('');
      });
    }
  }
});
