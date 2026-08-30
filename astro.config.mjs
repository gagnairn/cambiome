// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import yaml from 'js-yaml';
import { estEnCours } from './src/lib/echeance.ts';

// Le contenu du site est en YAML, lu ailleurs par `src/lib/contenu.ts` — mais
// ce chargeur repose sur `import.meta.glob`, que Vite fournit et que Node
// ignore. Or ce fichier est chargé par Node, et relu tel quel par
// `scripts/verifier-liens.mjs`. On relit donc le YAML à la main, pour la seule
// donnée dont le sitemap a besoin. La règle d'échéance, elle, n'est pas
// recopiée : elle vient de `src/lib/echeance.ts`, comme pour les pages.
const rge = /** @type {{ fin: string }} */ (
  yaml.load(readFileSync(new URL('./src/content/rge.yaml', import.meta.url), 'utf8'), {
    schema: yaml.JSON_SCHEMA,
  })
);
const rgeEnCours = estEnCours(rge.fin);

/**
 * Où le site est servi. **C'est le seul interrupteur de la mise en ligne** :
 * `preversion` aujourd'hui, `production` au premier dépôt chez l'hébergeur.
 *
 * `site` et `base` ne peuvent pas être dissociés, et ne peuvent pas non plus
 * anticiper le domaine. Ils ne servent pas qu'aux balises : `base` préfixe
 * TOUS les liens internes, et `site` construit l'adresse de retour du
 * formulaire sans JavaScript (`FormulaireContact.astro`). Les déclarer sur
 * www.cambiome.fr pendant que le site est servi depuis GitHub Pages donnerait
 * des liens en 404 et renverrait les envois de formulaire sur une adresse qui
 * ne sert pas encore le site.
 *
 * Le nom d'hôte commande aussi l'indexation : voir `src/layouts/Base.astro`,
 * qui pose `noindex` tant qu'on est sur github.io. Un seul mot à changer ici
 * lève donc la préversion en entier — impossible de mettre en ligne en
 * oubliant d'enlever le `noindex`, ou l'inverse.
 */
const HEBERGEMENT = 'preversion';

const ADRESSES = {
  // Projet GitHub Pages : le site vit dans un sous-dossier, d'où `base`.
  preversion: { site: 'https://gagnairn.github.io', base: '/cambiome' },
  // Domaine propre chez OVH : racine du domaine, pas de préfixe. À la bascule,
  // suivre la marche à suivre du README (CNAME, .htaccess, images à regénérer).
  production: { site: 'https://www.cambiome.fr' },
};

export default defineConfig({
  ...ADRESSES[HEBERGEMENT],
  // La page de confirmation d'envoi n'a rien à faire dans l'index. La page de
  // qualification en sort le jour où la qualification expire : elle ne dit
  // alors plus que son échéance, ce n'est pas ce qu'on propose aux moteurs.
  integrations: [
    sitemap({
      filter: (page) =>
        !page.endsWith('/merci/') &&
        (rgeEnCours || !page.endsWith('/rge-qualibat/')),
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
