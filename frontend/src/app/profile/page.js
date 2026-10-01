import Content from './content';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Profile | MetaNutri',
  description:
    'Manage your personal health profile, body metrics, dietary goals, and account settings on MetaNutri.',
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}
