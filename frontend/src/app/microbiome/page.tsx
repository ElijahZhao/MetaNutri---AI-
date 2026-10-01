import Content from './content';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Microbiome Analysis | MetaNutri',
  description:
    'Track and optimize your gut microbiome composition. Get dietary suggestions based on your gut health analysis.',
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}
