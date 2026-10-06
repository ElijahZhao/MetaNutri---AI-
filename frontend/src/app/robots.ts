import type { MetadataRoute } from 'next';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Authenticated app shell — no indexable content without a session.
      disallow: [
        '/dashboard',
        '/profile',
        '/genomic',
        '/microbiome',
        '/metabolomics',
        '/predict',
        '/recommendations',
        '/meal-plan',
        '/explore',
        '/datasets',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
