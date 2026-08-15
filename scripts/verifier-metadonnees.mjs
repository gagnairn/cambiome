/**
 * Vérifie les métadonnées de tête du site construit : titre, description,
 * canonique, et la fiche JSON-LD.
 *
 * Rien de tout cela ne se voit sur la page. Un titre qui déborde se tronque
 * dans les résultats de recherche, une description trop longue se coupe au
 * milieu d'un mot, un JSON-LD malformé est ignoré sans un bruit — et le build
 * reste vert dans les trois cas. Ce sont exactement les erreurs qu'il faut
 * une machine pour attraper.
 *
 * Les pages en `noindex` sont contrôlées plus mollement : leur description ne
 * paraîtra jamais dans un résultat de recherche.
 *
 * Aucune dépendance : Node seul, sur la sortie de `npm run build`.
 *
 *   node scripts/verifier-metadonnees.mjs        (ou : npm run verifier)
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

/**
 * Google tronque sur une largeur en pixels, pas sur un nombre de signes ; ces
 * bornes sont les équivalents usuels, et le dépassement n'a rien de brutal.
 * Elles sont donc hautes exprès : elles arrêtent le paragraphe entier collé
 * par erreur, pas la phrase de trois signes de trop.
 */
const TITRE_MAX = 60;
const DESCRIPTION_MAX = 160;
/** En deçà, la description n'apporte rien de plus que le titre. */
const DESCRIPTION_MIN = 50;

/** Décode les entités qu'un attribut HTML peut contenir. */
const decoder = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(
    /&(amp|lt|gt|quot|apos);/g,
    (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[e],
  );

async function pagesHtml(repertoire) {
  const entrees = await readdir(repertoire, { withFileTypes: true });
  const trouvees = await Promise.all(
    entrees.map((e) => {
      const chemin = path.join(repertoire, e.name);
      if (e.isDirectory()) return pagesHtml(chemin);
      return e.name.endsWith('.html') ? [chemin] : [];
    }),
  );
  return trouvees.flat();
}

const problemes = [];
const pages = (await pagesHtml(dist)).sort();

for (const fichier of pages) {
  const relatif = path.relative(dist, fichier);
  const html = await readFile(fichier, 'utf8');
  const signale = (quoi) => problemes.push(`${relatif} : ${quoi}`);

  // Une page qui ne paraîtra jamais dans un résultat de recherche n'a pas de
  // description à calibrer : celles en `noindex` par leur balise, et la 404,
  // qui n'est servie qu'en réponse à une URL fausse.
  const noindex =
    /<meta[^>]+name="robots"[^>]+noindex/.test(html) || relatif === '404.html';

  const titre = html.match(/<title>(.*?)<\/title>/s)?.[1];
  if (!titre) signale('pas de <title>');
  else {
    const n = decoder(titre).length;
    if (n > TITRE_MAX && !noindex)
      signale(`titre de ${n} signes (max ${TITRE_MAX}) — « ${decoder(titre)} »`);
  }

  const description = html.match(/<meta name="description" content="(.*?)"/s)?.[1];
  if (!description) signale('pas de <meta name="description">');
  else if (!noindex) {
    const n = decoder(description).length;
    if (n > DESCRIPTION_MAX)
      signale(`description de ${n} signes (max ${DESCRIPTION_MAX})`);
    else if (n < DESCRIPTION_MIN)
      signale(`description de ${n} signes (min ${DESCRIPTION_MIN})`);
  }

  if (!/<link rel="canonical"/.test(html)) signale('pas de <link rel="canonical">');

  // La fiche d'entreprise. `JSON.parse` est le seul juge qui compte : un bloc
  // invalide est ignoré par les moteurs, en silence et sans message.
  const jsonld = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
  if (!jsonld) signale('pas de fiche JSON-LD');
  else {
    try {
      const fiche = JSON.parse(jsonld);
      if (!fiche['@type']) signale('fiche JSON-LD sans @type');
      if (!fiche.name) signale('fiche JSON-LD sans name');
    } catch (erreur) {
      signale(`fiche JSON-LD illisible : ${erreur.message}`);
    }
  }
}

if (problemes.length) {
  console.error(`\n${problemes.length} problème(s) de métadonnées :\n`);
  for (const p of problemes) console.error(`  ${p}`);
  console.error('');
  process.exit(1);
}

console.log(`Métadonnées vérifiées dans ${pages.length} pages — rien à signaler.`);
