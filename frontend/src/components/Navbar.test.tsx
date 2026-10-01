import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';
import { LanguageProvider } from '@/lib/i18n';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types';

beforeEach(() => {
  useAuthStore.setState({
    user: { id: 1, username: 'demo' } as unknown as User,
    token: 'tok',
    isLoading: false,
  });
});

const renderNavbar = () =>
  render(
    <LanguageProvider>
      <Navbar />
    </LanguageProvider>
  );

describe('Navbar', () => {
  it('renders the omics links as plain strings', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: 'Microbiome' })).toHaveAttribute(
      'href',
      '/microbiome'
    );
    expect(screen.getByRole('link', { name: 'Metabolomics' })).toHaveAttribute(
      'href',
      '/metabolomics'
    );
  });

  it('shows the logout action for an authenticated user', () => {
    renderNavbar();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
