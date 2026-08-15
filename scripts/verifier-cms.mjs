/**
 * Vérifie que `.pages.yml` décrit bien les fichiers de `src/content/`.
 *
 * Le CMS ne lit pas les schémas zod du site : il ne connaît le contenu que par
 * `.pages.yml`. Les deux peuvent donc diverger sans que rien ne casse, et la
 * divergence est silencieuse dans les deux sens :
 *
 *   — un champ décrit ici mais absent du YAML s'affiche vide dans le
 *     formulaire ; à l'enregistrement suivant, ce vide est écrit dans le
 *     fichier. C'est la façon la plus discrète de perdre une mention légale ;
 *   — un champ présent dans le YAML mais absent d'ici n'apparaît pas dans le
 *     formulaire. `settings.content.merge` le préserve, mais l'éditeur croit
 *     voir tout le contenu alors qu'une partie lui est cachée.
 *
 * On contrôle aussi les valeurs de la liste déroulante des métiers : elles sont
 * recopiées à la main dans `.pages.yml`, faute de pouvoir les lire depuis
 * `metiers.yaml`. Un métier ajouté sans sa valeur ne serait pas proposé.
 *
 * Ce script ne juge ni les libellés ni les descriptions — seulement la
 * structure. La validité du contenu, elle, est affaire des schémas zod, au
 * build.
 *
 *   node scripts/verifier-cms.mjs        (ou : npm run verifier)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const racine = new URL('../', import.meta.url);
const lire = (chemin) =>
  yaml.load(readFileSync(fileURLToPath(new URL(chemin, racine)), 'utf8'), {
    // Même schéma que le chargeur du site : sans lui, `2026-12-09` deviendrait
    // un objet Date et la comparaison ne voudrait plus rien dire.
    schema: yaml.JSON_SCHEMA,
  });

const config = lire('.pages.yml');

/**
 * Les écarts, regroupés.
 *
 * Tous les éléments d'une liste partagent la même description : un champ mal
 * orthographié dans `.pages.yml` produirait sinon un message par chantier —
 * quatorze lignes pour une seule faute, dans lesquelles se perdrait la
 * quinzième, qui elle serait autre chose. On regroupe donc sur le message privé
 * de ses indices, en gardant le compte.
 */
const problemes = new Map();

function signaler(message) {
  const cle = message.replace(/\[\d+\]/g, '[]');
  const connu = problemes.get(cle);
  if (connu) connu.combien += 1;
  else problemes.set(cle, { message: message.replace(/\[\d+\]/g, ''), combien: 1 });
}

/** Les noms des champs déclarés à un niveau donné. */
const declares = (champs) => champs.filter((c) => c.name).map((c) => c.name);

/**
 * Compare les clés déclarées et les clés réelles à un niveau, puis descend dans
 * les objets. Le chemin sert uniquement à rendre le message lisible.
 */
function comparer(chemin, champs, valeur) {
  const attendus = new Set(declares(champs));
  const reels = new Set(Object.keys(valeur ?? {}));

  for (const cle of attendus)
    if (!reels.has(cle)) signaler(`${chemin}.${cle} : décrit dans .pages.yml, absent du contenu`);
  for (const cle of reels)
    if (!attendus.has(cle)) signaler(`${chemin}.${cle} : présent dans le contenu, absent de .pages.yml`);

  for (const champ of champs) {
    if (champ.type !== 'object' || !champ.fields) continue;
    const sous = valeur?.[champ.name];
    // Un champ objet peut être répété (`list`) ; on contrôle chaque élément,
    // faute de quoi une clé erronée dans le troisième objectif passerait.
    const elements = Array.isArray(sous) ? sous : [sous];
    elements.forEach((element, i) => {
      if (element == null) return;
      const indice = Array.isArray(sous) ? `[${i}]` : '';
      comparer(`${chemin}.${champ.name}${indice}`, champ.fields, element);
    });
  }
}

/**
 * Les entrées de contenu, groupes défaits.
 *
 * `.pages.yml` range les textes des pages dans une entrée `type: group`, qui
 * n'est qu'un intercalaire de menu : elle n'a pas de `path`, ses `items` en ont
 * un. Sans cette mise à plat, dix pages échapperaient au contrôle — et c'est
 * précisément là qu'il y a le plus de champs à désynchroniser.
 */
const aplatir = (entrees) =>
  entrees.flatMap((e) => (e.type === 'group' ? aplatir(e.items) : [e]));

const feuilles = aplatir(config.content);

for (const entree of feuilles) {
  const contenu = lire(entree.path);

  /*
   * Aucun fichier de contenu ne doit avoir un tableau à la racine.
   *
   * `list` posé sur une entrée est accepté par le schéma de Pages CMS sous sa
   * forme longue, mais son formulaire ne le reconnaît que sous la forme exacte
   * `list: true` (comparaison stricte dans components/entry/entry.tsx). Écrit
   * autrement, le tableau est présenté comme un objet : six champs vides, et
   * l'enregistrement remplace la galerie entière par cet objet. La validation
   * ne dit rien, le build non plus — la perte n'apparaît qu'en ligne.
   *
   * On coupe court : les listes vivent sous une clé de premier niveau, et la
   * liste se déclare sur un champ, où toutes les options fonctionnent.
   */
  if (Array.isArray(contenu)) {
    signaler(
      `${entree.name} : la racine de ${entree.path} est un tableau. ` +
        `Rangez-le sous une clé de premier niveau et déclarez « list » sur le champ, ` +
        `pas sur l'entrée — le formulaire de Pages CMS ignore « list » sur une entrée.`,
    );
    continue;
  }
  if (entree.list) {
    signaler(`${entree.name} : « list » sur une entrée est ignoré par le formulaire ; à porter sur un champ`);
    continue;
  }

  comparer(entree.name, entree.fields, contenu);
}

// La liste déroulante des métiers, recopiée à la main, doit couvrir exactement
// les métiers existants.
const slugs = lire('src/content/metiers.yaml').metiers.map((m) => m.slug);
const valeurs = feuilles
  .find((e) => e.name === 'realisations')
  ?.fields.find((c) => c.name === 'chantiers')
  ?.fields.find((c) => c.name === 'metierSlug')
  ?.options?.values.map((v) => v.name ?? v);

if (!valeurs) {
  signaler('realisations.metierSlug : liste déroulante introuvable dans .pages.yml');
} else {
  for (const slug of slugs)
    if (!valeurs.includes(slug))
      signaler(`realisations.metierSlug : le métier « ${slug} » n'est pas proposé`);
  for (const valeur of valeurs)
    if (!slugs.includes(valeur))
      signaler(`realisations.metierSlug : « ${valeur} » ne correspond à aucun métier`);
}

if (problemes.size) {
  console.error(`\n${problemes.size} écart(s) entre .pages.yml et src/content/ :\n`);
  for (const { message, combien } of problemes.values())
    console.error(`  ${message}${combien > 1 ? ` (${combien} éléments concernés)` : ''}`);
  console.error('');
  process.exit(1);
}

console.log(
  `Configuration du CMS vérifiée : ${feuilles.length} entrées cohérentes avec src/content/.`,
);
