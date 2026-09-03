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

/**
 * Une page, par opposition à un fichier : le dernier segment n'a pas
 * d'extension. Vrai pour `/contact`, faux pour `/favicon.ico`.
 */
const estUnePage = (chemin: string) => !/\.[^/]+$/.test(chemin);

/**
 * Construit une URL interne. `lien('/contact')` -> `/cambiome/contact/`.
 *
 * LE SLASH FINAL N'EST PAS COSMÉTIQUE. Astro construit chaque page dans son
 * dossier (`/contact/index.html`) : l'adresse canonique porte donc un slash,
 * et c'est celle qu'annoncent le `<link rel="canonical">` et le sitemap.
 * Demandée sans, Apache le rajoute par une 301 — un aller-retour à chaque
 * clic, sur une adresse de destination qu'il fabrique lui-même. Il la
 * fabriquait mal : `https://www.cambiome.fr:443/contact/`, port compris, parce
 * qu'OVH termine TLS en amont (voir la règle « slash final » de
 * public/.htaccess, qui rattrape les liens venus du dehors).
 *
 * Tous les liens internes du site passent par ici, et n'en déclenchent donc
 * plus aucune. Pas de compte ici : il se périmerait, et ce qui importe est
 * qu'il n'y ait aucune exception. Le `.htaccess` reste le filet pour les autres : un lien
 * tiers, un signet, une adresse tapée à la main.
 *
 * Les fichiers sont laissés tels quels : `/favicon.ico/` ne désigne rien.
 */
export const lien = (chemin: string) =>
  `${base}${chemin}${estUnePage(chemin) && !chemin.endsWith('/') ? '/' : ''}`;
