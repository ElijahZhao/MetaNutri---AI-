import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import ClientProvider from '../components/ClientProvider';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  'http://localhost:3000';

const description =
  'AI-Powered Precision Nutrition Metabolic Digital Twin Platform. Integrate genomic, microbiome, and metabolomic data for personalized nutrition insights.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'MetaNutri - AI Precision Nutrition',
  description,
  applicationName: 'MetaNutri',
  keywords: ['precision nutrition', 'digital twin', 'genomics', 'microbiome', 'metabolomics'],
  openGraph: {
    type: 'website',
    siteName: 'MetaNutri',
    title: 'MetaNutri - AI Precision Nutrition',
    description,
    url: '/',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MetaNutri - AI Precision Nutrition',
    description,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to main content
        </a>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
