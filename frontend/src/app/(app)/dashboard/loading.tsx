import RouteLoading from '@/components/RouteLoading';
import { SkeletonDashboard } from '@/components/Skeleton';

export default function DashboardLoading() {
  return (
    <RouteLoading>
      <SkeletonDashboard />
    </RouteLoading>
  );
}
