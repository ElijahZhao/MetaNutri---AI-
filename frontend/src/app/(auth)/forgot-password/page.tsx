import { Suspense } from 'react';
import Content from './content';

export const metadata = {
  title: 'Reset Password | MetaNutri',
  description:
    'Reset your MetaNutri account password. We will send you a secure link to create a new password.',
};

export default function Page() {
  // Content reads the ?token= query param via useSearchParams, which Next.js
  // requires to sit inside a Suspense boundary for the page to prerender.
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}
