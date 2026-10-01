import Content from './content';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Datasets | MetaNutri',
  description:
    'Manage and download public nutrition and bioinformatics datasets. Access TianChi dataset integration for expanded data sources.',
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}
