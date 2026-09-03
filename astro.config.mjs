// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Où le site est servi. **C'est le seul interrupteur de la mise en ligne.**
 * Passé en `production` le 2 septembre 2026, à la bascule vers OVH.
 *
 * `site` et `base` ne peuvent pas être dissociés. Ils ne servent pas qu'aux
 * balises : `base` préfixe TOUS les liens internes, et `site` construit
 * l'adresse de retour du formulaire sans JavaScript
 * (`FormulaireContact.astro`). C'est pourquoi ils n'ont pas pu anticiper le
 * domaine : les déclarer sur www.cambiome.fr pendant que le site était servi
 * depuis GitHub Pages aurait donné des liens en 404 et renvoyé les envois de
 * formulaire sur une adresse qui ne servait pas encore le site.
 *
 * Le nom d'hôte commande aussi l'indexation : voir `src/layouts/Base.astro`,
 * qui pose `noindex` tant qu'on est sur github.io. Ce seul mot a donc levé la
 * préversion en entier — il n'y a jamais eu de `noindex` à penser à retirer.
 *
 * `preversion` reste déclaré plus bas : c'est le chemin de retour si OVH
 * tombe. Y revenir suppose de remettre Settings → Pages → Source sur
 * « GitHub Actions », et de rétablir le déploiement Pages dans
 * `.github/workflows/deploy.yml`, que la bascule a remplacé par un dépôt SFTP.
 */
const HEBERGEMENT = 'production';

const ADRESSES = {
  // Ancien projet GitHub Pages : le site vivait dans un sous-dossier, d'où
  // `base`. Conservé comme repli, voir le commentaire ci-dessus.
  preversion: { site: 'https://gagnairn.github.io', base: '/cambiome' },
  // Domaine propre chez OVH : racine du domaine, pas de préfixe.
  production: { site: 'https://www.cambiome.fr' },
};

export default defineConfig({
  ...ADRESSES[HEBERGEMENT],

  // Chaque page est construite dans son dossier (`/contact/index.html`) : son
  // adresse porte un slash final, et c'est celle qu'annoncent le canonical et
  // le sitemap. `lien()` (src/lib/base.ts) l'ajoute à tous les liens du site ;
  // ce réglage est là pour que le serveur de développement applique la même
  // règle que la production. Sans lui, `/contact` répondrait ici et coûterait
  // une redirection en ligne — l'écart ne se verrait qu'une fois publié.
  //
  // Ne change rien à la sortie du build : les fichiers étaient déjà écrits
  // ainsi.
  trailingSlash: 'always',

  // La page de confirmation d'envoi n'a rien à faire dans l'index.
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/merci/'),
    }),
  ],

  // Politique de sécurité du contenu. Astro calcule au build le hachage de
  // chaque script et style inline et injecte la meta correspondante : pas de
  // 'unsafe-inline' à concéder. Aucun `scriptDirective.hashes` à déclarer à la
  // main — le site n'a plus de script `is:inline`, les seuls qu'Astro ne sache
  // pas hacher tout seul.
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
