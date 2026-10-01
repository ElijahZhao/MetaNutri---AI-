import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './i18n';

function Probe() {
  const { t, language, toggleLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="microbiome">{t.microbiomeLabel}</span>
      <span data-testid="metabolomics">{t.metabolomicsLabel}</span>
      <span data-testid="activity">{t.activityLabel}</span>
      <span data-testid="microbiome-title">{t.microbiome.title}</span>
      <button onClick={toggleLanguage}>toggle</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>
  );

describe('i18n translations', () => {
  it('exposes *Label keys as strings, not as the nested namespace objects', () => {
    renderProbe();
    // 回归保护：top-level 的 microbiome / metabolomics / activity 曾被同时定义为
    // 字符串与对象，导致 t.microbiome 取到对象并在渲染时报 React error #31。
    expect(screen.getByTestId('microbiome')).toHaveTextContent('Microbiome');
    expect(screen.getByTestId('metabolomics')).toHaveTextContent('Metabolomics');
    expect(screen.getByTestId('activity')).toHaveTextContent('Activity');
    // 命名空间对象依然可正常访问
    expect(screen.getByTestId('microbiome-title')).toHaveTextContent('Microbiome Analysis');
  });

  it('switches language and translates the labels', () => {
    renderProbe();
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('lang')).toHaveTextContent('zh');
    expect(screen.getByTestId('microbiome')).toHaveTextContent('微生物组');
  });
});
