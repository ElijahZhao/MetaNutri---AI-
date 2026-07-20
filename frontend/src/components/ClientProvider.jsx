'use client';
import ParticleBackground from './ParticleBackground';
import BioBackground from './BioBackground';
import ErrorBoundary from './ErrorBoundary';
import { LanguageProvider } from '../lib/i18n';
import { Toaster } from 'react-hot-toast';

export default function ClientProvider({ children }) {
  return (
    <LanguageProvider>
      <ErrorBoundary>
        <ParticleBackground />
        <BioBackground />
        <div className="relative z-10">{children}</div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#334155',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              padding: '16px 20px',
              fontSize: '14px',
            },
            success: {
              style: {
                borderLeft: '4px solid #10b981',
              },
            },
            error: {
              style: {
                borderLeft: '4px solid #ef4444',
              },
            },
          }}
        />
      </ErrorBoundary>
    </LanguageProvider>
  );
}
