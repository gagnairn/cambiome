/**
 * Génère les dérivés binaires du site : jeu d'icônes complet et image de
 * partage social.
 *
 *   npm run images
 *
 * Les fichiers produits sont versionnés (ils partent tels quels dans `dist`),
 * mais ce script reste la source de vérité : on ne retouche pas les PNG à la
 * main, on modifie la source puis on relance.
 *
 * Sources :
 *   public/favicon.svg                            -> icônes
 *   src/assets/logos/titre-horizontal.png         -> logotype de l'image OG
 *   src/assets/realisations/charpente-aretier.jpg -> fond de l'image OG
 */
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const ARDOISE = '#41738d'; // --color-ardoise-500, identique au theme-color
const PUBLIC = new URL('../public/', import.meta.url);
const chemin = (nom) => new URL(nom, PUBLIC);

const svg = await readFile(chemin('favicon.svg'));

/** Rend le favicon SVG à la taille voulue. `aplati` supprime la transparence. */
const rendre = (taille, aplati = false) => {
  const image = sharp(svg, { density: 384 }).resize(taille, taille);
  return (aplati ? image.flatten({ background: ARDOISE }) : image)
    .png({ compressionLevel: 9 })
    .toBuffer();
};

/**
 * Assemble un conteneur .ico à partir de PNG déjà encodés. Le format accepte
 * des PNG bruts depuis Windows Vista ; tous les navigateurs actuels le lisent.
 */
const construireIco = (images) => {
  const EN_TETE = 6;
  const ENTREE = 16;
  const debut = EN_TETE + ENTREE * images.length;

  const entete = Buffer.alloc(EN_TETE);
  entete.writeUInt16LE(0, 0); // réservé
  entete.writeUInt16LE(1, 2); // type : 1 = icône
  entete.writeUInt16LE(images.length, 4);

  let decalage = debut;
  const entrees = images.map(({ taille, donnees }) => {
    const entree = Buffer.alloc(ENTREE);
    entree.writeUInt8(taille >= 256 ? 0 : taille, 0); // 0 signifie 256
    entree.writeUInt8(taille >= 256 ? 0 : taille, 1);
    entree.writeUInt8(0, 2); // palette
    entree.writeUInt8(0, 3); // réservé
    entree.writeUInt16LE(1, 4); // plans
    entree.writeUInt16LE(32, 6); // bits par pixel
    entree.writeUInt32LE(donnees.length, 8);
    entree.writeUInt32LE(decalage, 12);
    decalage += donnees.length;
    return entree;
  });

  return Buffer.concat([entete, ...entrees, ...images.map((i) => i.donnees)]);
};

// --- Icônes ----------------------------------------------------------------

// Android « maskable » : le système rogne les bords, le motif doit tenir dans
// les 80 % centraux. On rend plus petit, puis on complète en bleu plein.
const marge = 51;
const maskable = await sharp(await rendre(512 - marge * 2, true))
  .extend({ top: marge, bottom: marge, left: marge, right: marge, background: ARDOISE })
  .png({ compressionLevel: 9 })
  .toBuffer();

const icones = [
  // iOS ne gère pas la transparence : fond aplati, coins arrondis par le système.
  ['apple-touch-icon.png', await rendre(180, true)],
  ['icon-192.png', await rendre(192)],
  ['icon-512.png', await rendre(512)],
  ['icon-maskable-512.png', maskable],
  [
    'favicon.ico',
    construireIco(
      await Promise.all(
        [16, 32, 48].map(async (taille) => ({ taille, donnees: await rendre(taille) }))
      )
    ),
  ],
];

for (const [nom, donnees] of icones) {
  await writeFile(chemin(nom), donnees);
  console.log(`  public/${nom} — ${(donnees.length / 1024).toFixed(1)} ko`);
}

// --- Image de partage (Open Graph) -----------------------------------------

const LARGEUR = 1200;
const HAUTEUR = 630;

const fond = await sharp(
  new URL('../src/assets/realisations/charpente-aretier.jpg', import.meta.url).pathname
)
  .resize(LARGEUR, HAUTEUR, { fit: 'cover', position: 'attention' })
  .composite([
    {
      // Voile sombre : le logotype blanc doit rester lisible quelle que soit la
      // zone de la photo qui ressort.
      input: {
        create: {
          width: LARGEUR,
          height: HAUTEUR,
          channels: 4,
          background: { r: 26, g: 29, b: 31, alpha: 0.6 }, // --color-encre
        },
      },
    },
  ])
  .toBuffer();

// Le logotype fourni est noir sur fond transparent : on ne garde que son canal
// alpha, recolorié en blanc.
// `metadata()` décrirait l'image d'origine, pas la version redimensionnée : on
// prend les dimensions sur le tampon brut effectivement produit.
const { data: alpha, info } = await sharp(
  new URL('../src/assets/logos/titre-horizontal.png', import.meta.url).pathname
)
  .resize({ width: 620 })
  .ensureAlpha()
  .extractChannel('alpha')
  .raw()
  .toBuffer({ resolveWithObject: true });

const logotype = await sharp({
  create: { width: info.width, height: info.height, channels: 3, background: '#ffffff' },
})
  .joinChannel(alpha, {
    raw: { width: info.width, height: info.height, channels: 1 },
  })
  .png()
  .toBuffer();

const og = await sharp(fond)
  .composite([{ input: logotype, gravity: 'centre' }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toBuffer();

await writeFile(chemin('og-image.jpg'), og);
console.log(`  public/og-image.jpg — ${(og.length / 1024).toFixed(1)} ko`);
