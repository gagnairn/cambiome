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
  vite: {
    plugins: [tailwindcss()],
  },
});
