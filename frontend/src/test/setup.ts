import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// src/common/axiosClient.ts calls retrieveLaunchParams() at MODULE SCOPE, which
// throws outside a Telegram WebView. Mock both Telegram SDKs globally so any
// module graph that (transitively) touches them can be imported in tests.
vi.mock('@twa-dev/sdk', () => ({
  default: {
    ready: vi.fn(),
    expand: vi.fn(),
    initDataUnsafe: {},
    BackButton: {
      show: vi.fn(),
      hide: vi.fn(),
      onClick: vi.fn(),
      offClick: vi.fn(),
    },
    MainButton: {
      hide: vi.fn(),
    },
    SettingsButton: {
      show: vi.fn(),
      onClick: vi.fn(),
    },
    setHeaderColor: vi.fn(),
    setBackgroundColor: vi.fn(),
    disableVerticalSwipes: vi.fn(),
  },
}));

vi.mock('@telegram-apps/sdk', () => ({
  retrieveLaunchParams: vi.fn(() => ({ initDataRaw: 'test' })),
  postEvent: vi.fn(),
}));
