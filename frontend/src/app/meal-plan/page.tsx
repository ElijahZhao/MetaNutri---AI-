import Content from './content';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'Meal Plan | MetaNutri',
  description:
    'Generate personalized meal plans with daily nutrient targets. Track your calorie, protein, carb, and fat intake goals.',
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}
