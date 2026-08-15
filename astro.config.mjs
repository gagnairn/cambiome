// @ts-check
import { createHash } from 'node:crypto';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SCRIPT_THEME } from './src/lib/theme-script.ts';

// Hachage du seul script `is:inline` du site, celui qui restaure la piste
// chromatique choisie. Astro hache tout seul les scripts qu'il groupe, mais
// pas les `is:inline` — il faut donc le lui donner, sinon la CSP le bloque.
// Calculé à partir de la chaîne elle-même : les deux ne peuvent pas diverger.
// À SUPPRIMER avec le reste du dispositif de thèmes.
const HACHAGE_SCRIPT_THEME = `sha256-${createHash('sha256').update(SCRIPT_THEME).digest('base64')}`;

// Adapter `site` et `base` au moment de la mise en ligne :
//  - GitHub Pages projet  -> site: 'https://gagnairn.github.io', base: '/cambiome'  (état actuel)
//  - domaine propre       -> site: 'https://www.cambiome.fr', supprimer `base`
//
// Les deux lignes changent ensemble : sans `base`, tous les liens visent la
// racine du domaine et retournent 404 sur gagnairn.github.io/cambiome/. À ne
// modifier qu'au moment de la bascule DNS, pas en préparation.
export default defineConfig({
  site: 'https://gagnairn.github.io',
  base: '/cambiome',
  // La page de confirmation d'envoi n'a rien à faire dans l'index.
  integrations: [sitemap({ filter: (page) => !page.endsWith('/merci/') })],

  // Politique de sécurité du contenu. Astro calcule au build le hachage de
  // chaque script et style inline et injecte la meta correspondante : pas de
  // 'unsafe-inline' à concéder.
  //
  // `frame-ancestors` est volontairement absent : le navigateur l'ignore quand
  // la CSP arrive par <meta>. Il est posé en en-tête HTTP dans public/_headers
  // et public/.htaccess, avec le reste des en-têtes que GitHub Pages ne sait
  // pas servir.
  security: {
    csp: {
      scriptDirective: { hashes: [HACHAGE_SCRIPT_THEME] },
      directives: [
        "default-src 'self'",
        // Le formulaire de contact poste vers Web3Forms, en fetch (connect-src)
        // comme en POST natif sans JavaScript (form-action).
        "connect-src 'self' https://api.web3forms.com",
        "form-action 'self' https://api.web3forms.com",
        // Pas de `data:` : toutes les images sont des fichiers servis par le
        // site. Le jour où un SVG est inliné en URI, il faudra le rajouter.
        "img-src 'self'",
        "font-src 'self'",
        "base-uri 'none'",
        "object-src 'none'",
        "frame-src 'none'",
        'upgrade-insecure-requests',
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
