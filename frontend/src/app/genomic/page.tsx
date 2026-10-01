import Content from './content';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Genomic Data | MetaNutri',
  description:
    'Upload and analyze your genomic data for nutrition-related genetic variants. Understand how your DNA affects your dietary needs.',
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}
