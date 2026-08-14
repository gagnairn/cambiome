/**
 * Préfixe de toutes les URL internes du site.
 *
 * `import.meta.env.BASE_URL` vaut `/cambiome` sous GitHub Pages et `/` avec un
 * domaine propre. Le slash final doit sauter avant toute concaténation, sinon
 * on obtient `/cambiomecontact` dans un cas et `//contact` dans l'autre.
 *
 * Cette normalisation était recopiée dans onze fichiers, sous deux formes :
 * elle vit ici, et nulle part ailleurs.
 */
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Construit une URL interne. `lien('/contact')` -> `/cambiome/contact`. */
export const lien = (chemin: string) => `${base}${chemin}`;
