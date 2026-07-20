import './globals.css';
import ClientProvider from '../components/ClientProvider';

export const metadata = {
  title: 'MetaNutri - AI Precision Nutrition',
  description: 'AI-Powered Precision Nutrition Metabolic Digital Twin Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
