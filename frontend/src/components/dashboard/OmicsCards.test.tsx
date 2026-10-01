import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MicrobiomeCard, MetabolomicsCard } from './OmicsCards';
import { LanguageProvider } from '@/lib/i18n';
import type { ReactElement } from 'react';

const wrap = (ui: ReactElement) => render(<LanguageProvider>{ui}</LanguageProvider>);

describe('OmicsCards', () => {
  // 回归保护：这两张卡片曾用 t.microbiome / t.metabolomics（对象）作为标题，
  // 触发 React error #31；现在必须渲染字符串标签。
  it('renders the MicrobiomeCard heading from the string label', () => {
    wrap(<MicrobiomeCard />);
    expect(screen.getByRole('heading', { name: 'Microbiome' })).toBeInTheDocument();
  });

  it('renders the MetabolomicsCard heading from the string label', () => {
    wrap(<MetabolomicsCard />);
    expect(screen.getByRole('heading', { name: 'Metabolomics' })).toBeInTheDocument();
  });
});
