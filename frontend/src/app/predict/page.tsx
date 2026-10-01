import Content from './content';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: 'AI Predictions | MetaNutri',
  description:
    'Run AI-powered metabolic predictions including glucose response curves and nutrient absorption rates based on your personal health profile.',
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}
