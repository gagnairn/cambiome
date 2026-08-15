/**
 * Règle d'échéance de la qualification RGE.
 *
 * Elle tient en une ligne, mais elle est appliquée depuis deux mondes qui ne
 * peuvent pas partager grand-chose :
 *
 *  - les pages, qui passent par `src/data/site.ts` et le chargeur de contenu
 *    (`src/lib/contenu.ts`), lequel repose sur `import.meta.glob` — une
 *    fonctionnalité de Vite ;
 *  - `astro.config.mjs`, chargé par Node avant que Vite n'existe, et relu tel
 *    quel par `scripts/verifier-liens.mjs` pour en tirer le `base`. Ni l'alias
 *    `~` ni `import.meta.glob` n'y sont résolus.
 *
 * D'où ce module volontairement nu : ni import, ni accès disque, ni alias.
 * Il est le seul endroit où s'écrit « la qualification est-elle encore
 * valable », pour que la page et le sitemap ne puissent pas en juger
 * différemment.
 */

/**
 * Vrai tant que la date du jour n'a pas dépassé `fin`.
 *
 * Évalué au build : le site est statique, la date est celle de la génération.
 * Comparaison de chaînes et non de `Date` — le format `AAAA-MM-JJ` s'ordonne
 * déjà correctement, et cela évite d'introduire un fuseau horaire dans une
 * question qui n'en a pas.
 *
 * @param fin Date d'échéance au format `AAAA-MM-JJ`.
 */
export function estEnCours(fin: string): boolean {
  return new Date().toISOString().slice(0, 10) <= fin;
}
