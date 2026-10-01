import DashboardPage from './content';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Dashboard | MetaNutri',
  description:
    'Your personalized metabolic overview and AI nutrition insights. Track health scores, risk profiles, body metrics, and get tailored recommendations.',
};

export default function Page() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
