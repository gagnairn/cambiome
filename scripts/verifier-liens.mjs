/**
 * Vérifie que tous les liens internes du site construit pointent quelque part.
 *
 * `astro check` valide les types et les props, pas les URL : un `href` cassé se
 * déploie sans que rien ne bronche. C'est exactement ce qui s'est produit avec
 * le favicon, servi en 404 sous `/cambiomefavicon.svg` pendant deux commits.
 *
 * Aucune dépendance : Node seul, sur la sortie de `npm run build`.
 *
 *   node scripts/verifier-liens.mjs        (ou : npm run verifier)
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const dist = path.join(racine, 'dist');

// `base` est lu depuis la configuration Astro plutôt que recopié : le jour où
// un nom de domaine est acheté, il n'y a toujours qu'un seul endroit à changer.
const config = (await import(path.join(racine, 'astro.config.mjs'))).default;
const base = (config.base ?? '/').replace(/\/$/, '');

/** Schémas qui ne désignent pas une ressource du site. */
const EXTERNE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/** Tous les fichiers .html de `dist`, chemins absolus. */
async function pagesHtml(repertoire) {
  const entrees = await readdir(repertoire, { withFileTypes: true });
  const trouvees = await Promise.all(
    entrees.map(async (entree) => {
      const complet = path.join(repertoire, entree.name);
      if (entree.isDirectory()) return pagesHtml(complet);
      return entree.name.endsWith('.html') ? [complet] : [];
    })
  );
  return trouvees.flat();
}

/**
 * URL référencées par une page. `srcset` est décomposé : chaque descripteur y
 * tient une URL distincte, et une seule cassée suffit à trouer une image.
 */
function urlsReferencees(html) {
  const urls = [];
  for (const [, valeur] of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
    urls.push(valeur);
  }
  for (const [, valeur] of html.matchAll(/\bsrcset="([^"]*)"/g)) {
    for (const candidat of valeur.split(',')) {
      const url = candidat.trim().split(/\s+/)[0];
      if (url) urls.push(url);
    }
  }
  return urls;
}

const idsParFichier = new Map();

/** Ancres déclarées par une page, mises en cache : chaque page est lue une fois. */
async function idsDe(fichier) {
  if (!idsParFichier.has(fichier)) {
    const html = await readFile(fichier, 'utf8');
    idsParFichier.set(
      fichier,
      new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id))
    );
  }
  return idsParFichier.get(fichier);
}

/**
 * Fichier réellement servi pour un chemin d'URL, ou `null`.
 *
 * Le repli sur `index.html` est ce qui fait passer `href="/cambiome/contact"`,
 * tel qu'écrit dans la navigation, vers `dist/contact/index.html`.
 */
async function fichierServi(cheminUrl) {
  const relatif = cheminUrl.slice(base.length) || '/';
  const cible = path.join(dist, decodeURIComponent(relatif));

  for (const candidat of [cible, path.join(cible, 'index.html'), `${cible}.html`]) {
    try {
      if ((await stat(candidat)).isFile()) return candidat;
    } catch {
      // Candidat suivant.
    }
  }
  return null;
}

const pages = await pagesHtml(dist);
const problemes = [];
let liensVerifies = 0;

for (const page of pages) {
  const html = await readFile(page, 'utf8');
  const relatif = path.relative(racine, page);

  for (const url of urlsReferencees(html)) {
    if (!url || EXTERNE.test(url)) continue;

    const [chemin, ancre] = url.split('#');
    liensVerifies++;

    // Ancre seule : la cible est la page elle-même.
    if (!chemin) {
      if (ancre && !(await idsDe(page)).has(ancre)) {
        problemes.push(`${relatif} : ancre #${ancre} introuvable dans la page`);
      }
      continue;
    }

    // Le chemin doit valoir `base`, ou commencer par `base/`. Sans le second
    // slash, `/cambiomefavicon.svg` se résoudrait vers `favicon.svg` — qui
    // existe — et le lien mort passerait inaperçu.
    if (chemin !== base && !chemin.startsWith(`${base}/`)) {
      problemes.push(`${relatif} : ${url} — hors du préfixe « ${base}/ »`);
      continue;
    }

    const cible = await fichierServi(chemin);
    if (!cible) {
      problemes.push(`${relatif} : ${url} — aucun fichier correspondant`);
      continue;
    }

    if (ancre && cible.endsWith('.html') && !(await idsDe(cible)).has(ancre)) {
      problemes.push(
        `${relatif} : ${url} — la page existe, l'ancre #${ancre} non`
      );
    }
  }
}

// Un vérificateur qui ne trouve aucun lien ne vérifie rien : le signaler plutôt
// que de renvoyer un vert trompeur.
if (liensVerifies === 0) {
  console.error(
    `Aucun lien interne trouvé dans ${pages.length} page(s) — le site a-t-il été construit ?`
  );
  process.exit(1);
}

if (problemes.length > 0) {
  console.error(`${problemes.length} lien(s) cassé(s) :\n`);
  for (const probleme of problemes) console.error(`  ${probleme}`);
  console.error('');
  process.exit(1);
}

console.log(
  `${liensVerifies} liens internes vérifiés dans ${pages.length} pages — tous valides.`
);
