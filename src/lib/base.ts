/**
 * Construction des URL internes du site.
 *
 * `import.meta.env.BASE_URL` vaut `/cambiome` sous GitHub Pages et `/` avec un
 * domaine propre. Le slash final doit sauter avant toute concaténation, sinon
 * on obtient `/cambiomecontact` dans un cas et `//contact` dans l'autre.
 *
 * Cette normalisation était recopiée dans onze fichiers, sous deux formes.
 * Elle vit ici, et nulle part ailleurs — le préfixe n'est délibérément pas
 * exporté, pour qu'il n'existe qu'une seule façon d'écrire un lien interne.
 * `lien()` couvre tous les cas : les pages, la racine (`lien('/')`) et les
 * fichiers de `public/` (`lien('/favicon.ico')`).
 */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Construit une URL interne. `lien('/contact')` -> `/cambiome/contact`. */
export const lien = (chemin: string) => `${base}${chemin}`;
