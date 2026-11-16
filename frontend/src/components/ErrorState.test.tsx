import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the provided message', () => {
    render(<ErrorState message="Something broke" />);
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('falls back to the localized error_generic key when no message is given', () => {
    render(<ErrorState />);
    // Identity-mocked t() returns the key itself.
    expect(screen.getByText('error_generic')).toBeInTheDocument();
  });

  it('shows a retry button that calls onRetry when clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="boom" onRetry={onRetry} />);

    const button = screen.getByRole('button', { name: 'error_retry' });
    await userEvent.click(button);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders no retry button when onRetry is omitted', () => {
    render(<ErrorState message="boom" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
