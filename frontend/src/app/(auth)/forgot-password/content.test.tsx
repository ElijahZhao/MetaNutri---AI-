import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/lib/i18n';
import ForgotPasswordPage from './content';

// Override the global next/navigation stub so we can drive the query string.
let search = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
  useSearchParams: () => search,
}));

const renderPage = () =>
  render(
    <LanguageProvider>
      <ForgotPasswordPage />
    </LanguageProvider>
  );

describe('forgot-password link flow', () => {
  beforeEach(() => {
    search = new URLSearchParams();
  });

  it('reads the token from the URL and jumps straight to the new-password form', () => {
    search = new URLSearchParams({ token: 'tok_123' });
    renderPage();

    expect(screen.getByText('Set a New Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your new password')).toBeInTheDocument();
    // the "we sent you a link" screen is skipped, and the raw token is not echoed
    expect(screen.queryByText('Reset link sent! Check your email.')).not.toBeInTheDocument();
    expect(screen.queryByText('tok_123')).not.toBeInTheDocument();
  });

  it('starts on the email step when no token is present', () => {
    renderPage();

    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Enter your new password')).not.toBeInTheDocument();
  });
});
