import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BodyMetricsCard from './BodyMetricsCard';
import { LanguageProvider } from '@/lib/i18n';
import type { UserProfile } from '@/types';

const profile = {
  age: 30,
  height_cm: 175,
  weight_kg: 70,
  activity_level: 'moderate',
} as UserProfile;

describe('BodyMetricsCard', () => {
  it('renders the activity label as a string', () => {
    render(
      <LanguageProvider>
        <BodyMetricsCard profile={profile} />
      </LanguageProvider>
    );
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('moderate')).toBeInTheDocument();
  });
});
