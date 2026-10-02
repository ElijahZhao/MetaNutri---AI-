import RouteLoading from '@/components/RouteLoading';
import { SkeletonTable } from '@/components/Skeleton';

export default function DatasetsLoading() {
  return (
    <RouteLoading>
      <SkeletonTable rows={6} />
    </RouteLoading>
  );
}
