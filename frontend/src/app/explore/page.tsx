import Content from './content';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Food Explorer | MetaNutri',
  description:
    'Discover and evaluate foods for your personalized nutrition plan. Search, filter, and score foods based on your unique biology.',
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}
