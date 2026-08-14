// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Adapter `site` et `base` au moment de la mise en ligne :
//  - domaine propre (ex. https://cambiome.fr)      -> site: 'https://cambiome.fr', pas de base
//  - GitHub Pages projet                            -> site: 'https://gagnairn.github.io', base: '/cambiome'
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
      directives: [
        "default-src 'self'",
        // Le formulaire de contact poste vers Web3Forms, en fetch (connect-src)
        // comme en POST natif sans JavaScript (form-action).
        "connect-src 'self' https://api.web3forms.com",
        "form-action 'self' https://api.web3forms.com",
        "img-src 'self' data:",
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
