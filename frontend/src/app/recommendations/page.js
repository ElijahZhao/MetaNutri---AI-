import Content from './content';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Recommendations | MetaNutri',
  description:
    'Get personalized food recommendations, meal plans, and nutrition scores powered by AI and your unique metabolic profile.',
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}
