/**
 * Ramène les photos de chantier à une taille raisonnable, sur place.
 *
 *   node scripts/redimensionner-photos.mjs
 *   node scripts/redimensionner-photos.mjs --verifier   (n'écrit rien)
 *
 * Depuis que la galerie se remplit depuis le CMS, les photos arrivent telles
 * que le téléphone les a prises : 4000 px de large, 6 Mo. Le site n'en sert
 * jamais plus de 1400 px de large, mais le dépôt, lui, garderait chaque
 * original pour toujours — un dépôt Git ne se dégonfle pas. À raison de
 * quelques chantiers par mois, il devient impossible à cloner en un an.
 *
 * On réécrit donc le fichier téléversé. 2400 px conserve une marge confortable
 * (le site peut doubler ses tailles d'affichage sans réclamer les originaux)
 * et ramène une photo de téléphone autour de 500 Ko.
 *
 * Ce script ne recadre pas et ne retouche pas : le cadrage relève d'un
 * jugement, pas d'une automatisation. Il ne fait que plafonner la définition
 * et normaliser la compression.
 *
 * Il est appelé par .github/workflows/photos.yml après chaque téléversement,
 * et peut se lancer à la main avant de committer une photo.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/** Côté le plus long, en pixels. Voir l'en-tête pour le choix de la valeur. */
const COTE_MAX = 2400;

/**
 * Qualité JPEG. 82 avec mozjpeg est le seuil au-delà duquel l'œil ne
 * distingue plus rien sur une photo de chantier, alors que le poids, lui,
 * continue de grimper.
 */
const QUALITE = 82;

const DOSSIER = new URL('../src/assets/realisations/', import.meta.url);

const verifierSeulement = process.argv.includes('--verifier');

const enKo = (octets) => `${Math.round(octets / 1024)} Ko`;

const fichiers = (await readdir(fileURLToPath(DOSSIER)))
  .filter((nom) => /\.(jpe?g|png)$/i.test(nom))
  .sort();

const traites = [];

for (const nom of fichiers) {
  const chemin = new URL(nom, DOSSIER);
  const avant = await readFile(chemin);
  const meta = await sharp(avant).metadata();

  if (Math.max(meta.width, meta.height) <= COTE_MAX) continue;

  // `withoutEnlargement` est une ceinture de sécurité : la condition ci-dessus
  // l'a déjà garanti, mais elle protège d'une modification future du seuil.
  //
  // La sortie est toujours du JPEG, y compris pour un PNG en entrée : une
  // photo de chantier n'a pas de transparence à préserver, et le PNG lui
  // coûterait cinq fois son poids. Le nom de fichier, lui, ne change pas —
  // il est cité dans src/content/realisations.yaml, et renommer derrière le
  // dos de l'éditeur casserait sa galerie.
  const apres = await sharp(avant)
    .rotate() // applique l'orientation EXIF avant de la perdre au redimensionnement
    .resize({ width: COTE_MAX, height: COTE_MAX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITE, mozjpeg: true })
    .toBuffer();

  traites.push({
    nom,
    de: `${meta.width}×${meta.height}, ${enKo(avant.length)}`,
    vers: `${enKo(apres.length)}`,
  });

  if (!verifierSeulement) await writeFile(chemin, apres);
}

if (traites.length === 0) {
  console.log(
    `${fichiers.length} photo(s) examinée(s) — toutes déjà sous ${COTE_MAX} px, rien à faire.`,
  );
  process.exit(0);
}

for (const { nom, de, vers } of traites) {
  console.log(`  ${nom} : ${de} → ${COTE_MAX} px max, ${vers}`);
}

if (verifierSeulement) {
  console.error(`\n${traites.length} photo(s) dépassent ${COTE_MAX} px.`);
  process.exit(1);
}

console.log(`\n${traites.length} photo(s) redimensionnée(s).`);
