import type { APIRoute } from 'astro';

import { base } from '~/lib/base';

/**
 * Généré plutôt que déposé dans `public/` : l'URL du sitemap suit ainsi
 * automatiquement `site` et `base` d'`astro.config.mjs`. Le jour où un nom de
 * domaine est acheté, il n'y a qu'un seul endroit à modifier.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(`${base}/sitemap-index.xml`, site);

  return new Response(
    `User-agent: *
Allow: /

Sitemap: ${sitemap}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
};
