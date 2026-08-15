/**
 * Script de restauration de la piste chromatique — DISPOSITIF TEMPORAIRE,
 * il disparaît avec le sélecteur (voir `themes` dans src/data/site.ts).
 *
 * Pourquoi une chaîne dans un module plutôt que du JavaScript écrit dans
 * Base.astro : ce script doit s'exécuter **avant le premier rendu**, sinon
 * chaque navigation affiche brièvement l'ardoise avant de virer à la teinte
 * choisie. Il ne peut donc pas être groupé par Astro, qui le rendrait différé
 * — il lui faut `is:inline`. Or Astro ne calcule pas le hachage des scripts
 * `is:inline` : sans le déclarer, la CSP du site le bloquerait.
 *
 * Le contournement tient à ce que cette chaîne soit l'unique source :
 * astro.config.mjs en dérive le hachage qu'il ajoute à `script-src`, et
 * Base.astro l'injecte telle quelle. Modifier le script ici met les deux à
 * jour du même geste — l'écrire en dur des deux côtés serait la garantie
 * qu'ils divergent un jour, et le symptôme (script bloqué, thème oublié
 * d'une page à l'autre) ne serait pas évident à relier à sa cause.
 *
 * La clé `cambiome-theme` est aussi lue et écrite par SelecteurTheme.astro.
 */
export const SCRIPT_THEME =
  "try{var t=localStorage.getItem('cambiome-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}";
