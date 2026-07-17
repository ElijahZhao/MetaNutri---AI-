import './globals.css';

export const metadata = {
  title: 'MetaNutri - AI Precision Nutrition',
  description: 'AI-Powered Precision Nutrition Metabolic Digital Twin Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
