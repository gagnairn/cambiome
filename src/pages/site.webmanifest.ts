import type { APIRoute } from 'astro';

import { base } from '~/lib/base';
import { site } from '~/data/site';

/**
 * Manifeste d'application web : ce qui s'affiche quand le site est ajouté à
 * l'écran d'accueil sur Android. Généré pour que `start_url` et les chemins
 * d'icônes suivent `base` d'`astro.config.mjs`.
 *
 * Pas de service worker : le site n'est pas une PWA, on ne cherche qu'un nom et
 * une icône corrects au lieu d'une capture d'écran de la page.
 */
export const GET: APIRoute = () => {
  const manifeste = {
    name: `${site.nom} — ${site.baseline}`,
    short_name: site.nom,
    description: site.description,
    lang: 'fr',
    start_url: `${base}/`,
    scope: `${base}/`,
    display: 'browser',
    theme_color: '#41738D',
    background_color: '#FBFAF8', // --color-sable-50, le fond du site
    icons: [
      { src: `${base}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${base}/icon-512.png`, sizes: '512x512', type: 'image/png' },
      {
        src: `${base}/icon-maskable-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return new Response(JSON.stringify(manifeste, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
