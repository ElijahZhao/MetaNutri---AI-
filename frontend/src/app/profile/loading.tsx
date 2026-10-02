import RouteLoading from '@/components/RouteLoading';
import { SkeletonProfile } from '@/components/Skeleton';

export default function ProfileLoading() {
  return (
    <RouteLoading containerClassName="max-w-4xl">
      <SkeletonProfile />
    </RouteLoading>
  );
}
