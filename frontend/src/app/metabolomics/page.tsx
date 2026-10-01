import Content from './content';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Metabolomics Data | MetaNutri',
  description:
    'Track and analyze your metabolite profiles across key metabolic pathways. Identify upregulated and downregulated metabolites.',
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}
