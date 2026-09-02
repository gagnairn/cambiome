/**
 * Génère les dérivés binaires du site : jeu d'icônes complet, marque seule
 * pour l'en-tête et le pied de page, image de partage social.
 *
 *   npm run images
 *
 * Les fichiers produits sont versionnés (ils partent tels quels dans `dist`),
 * mais ce script reste la source de vérité : on ne retouche pas les PNG à la
 * main, on modifie la source puis on relance.
 *
 * Sources, toutes dans src/assets/logos/marque/ sauf la dernière :
 *   marque/bloc-bleu.png                          -> icônes (marque détourée)
 *   marque/logo-noir.png                          -> marque seule, sombre
 *   marque/logo-blanc.png                         -> marque seule, claire
 *   marque/titre-horizontal.png                   -> logotype de l'image OG
 *   src/assets/realisations/charpente-aretier.jpg -> fond de l'image OG
 *
 * Produits :
 *   src/assets/logos/derives/marque-noire.png     -> en-tête et pied de page
 *   src/assets/logos/derives/marque-blanche.png
 *   public/{favicon.ico, icon-*.png, apple-touch-icon.png, og-image.jpg}
 *
 * Les trois dossiers de src/assets/logos/ se lisent ainsi : `marque/` et
 * `partenaires/` sont fournis — ils sont téléversables depuis le CMS —, et
 * `derives/` sort d'ici. Rien de ce qui est dans `derives/` ni dans `public/`
 * ne se retouche à la main : le prochain passage l'écraserait.
 *
 * Ce script tourne aussi en CI, avant chaque publication (deploy.yml), pour que
 * remplacer un logo depuis le CMS mette à jour le favicon et l'image de partage
 * dans le même geste. C'est ce qui rend la marque modifiable sans développeur.
 */
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Fond des icônes. Le cran 500 et non `--color-marque` : la marque y est
// détourée en BLANC, et #9DC3D4 ne la porterait pas (1,88:1). Le 500 en donne
// 4,81:1. Identique au theme-color de Base.astro et du manifeste.
const CIEL = '#0c7d93'; // --color-ciel-500
const PUBLIC = new URL('../public/', import.meta.url);
const chemin = (nom) => new URL(nom, PUBLIC);
const source = (nom) => new URL(`../src/assets/${nom}`, import.meta.url).pathname;

/**
 * Refuse une source absente, ou dont les dimensions ne sont plus celles sur
 * lesquelles les découpes ont été mesurées.
 *
 * Sans ce contrôle, remplacer un logo par une image d'une autre taille ne
 * produirait pas une erreur mais un favicon massacré — `extract()` prélèverait
 * un rectangle au mauvais endroit, ou déborderait. Or les logos sont désormais
 * téléversables depuis le CMS : l'erreur est devenue atteignable par quelqu'un
 * qui n'ouvrira jamais ce fichier.
 *
 * On échoue donc bruyamment. La publication est refusée, le site en ligne garde
 * sa version précédente, et le message dit quoi faire — c'est la règle du dépôt
 * pour toute donnée invalide.
 *
 * @param chemin  Relatif à src/assets/.
 * @param largeur Attendue, en pixels. Omise, seule la présence est vérifiée.
 */
async function exiger(chemin, largeur, hauteur) {
  let taille;
  try {
    taille = await sharp(source(chemin)).metadata();
  } catch {
    throw new Error(
      `Image source introuvable ou illisible : src/assets/${chemin}\n` +
        `La génération des icônes ne peut pas se faire sans elle.`,
    );
  }
  if (largeur && (taille.width !== largeur || taille.height !== hauteur)) {
    throw new Error(
      `src/assets/${chemin} mesure ${taille.width}×${taille.height} px, ` +
        `alors que la génération attend ${largeur}×${hauteur}.\n\n` +
        `Les découpes de ce script sont mesurées au pixel sur ce fichier : une ` +
        `image d'une autre taille produirait des icônes fausses, sans que rien ` +
        `ne le signale.\n\n` +
        `Deux issues : téléverser une image aux mêmes dimensions, ou remesurer ` +
        `les constantes MARQUE et SEULE dans scripts/generer-images.mjs.`,
    );
  }
}

// Dimensions des fichiers fournis par CAMBIOME, relevées une fois. Elles ne
// décrivent pas une contrainte esthétique : elles sont le repère des découpes
// ci-dessous.
await exiger('logos/marque/bloc-bleu.png', 1932, 1968);
await exiger('logos/marque/logo-noir.png', 568, 568);
await exiger('logos/marque/logo-blanc.png', 568, 568);
// Redimensionné et non découpé : sa taille est libre, sa présence non.
await exiger('logos/marque/titre-horizontal.png');
await exiger('realisations/charpente-aretier.jpg');

// --- Détourage de la marque ------------------------------------------------

// `bloc-bleu.png` est la plus haute définition disponible du logo. Le dépôt
// n'a aucune source vectorielle : la marque est donc extraite du raster, dans
// la zone mesurée ci-dessous (le bloc contient aussi le nom et la baseline,
// qu'un favicon ne doit pas embarquer).
const MARQUE = { left: 469, top: 329, width: 957, height: 987 };

// Le bleu du bloc est opaque : l'alpha du PNG ne distingue pas la marque du
// fond. On reconstruit donc l'opacité à partir de la clarté du pixel, ce qui
// donne la marque en blanc sur transparent, réutilisable sur n'importe quel
// fond.
const { data: bloc, info: infoBloc } = await sharp(source('logos/marque/bloc-bleu.png'))
  .extract(MARQUE)
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: LARG, height: HAUT } = infoBloc;
const opacite = Buffer.alloc(LARG * HAUT);
for (let p = 0; p < LARG * HAUT; p++) {
  const i = p * infoBloc.channels;
  const clarte = (bloc[i] * 0.2126 + bloc[i + 1] * 0.7152 + bloc[i + 2] * 0.0722 - 105) / 130;
  opacite[p] = Math.max(0, Math.min(255, Math.round(clarte * 255)));
}

/**
 * Dilatation morphologique : chaque pixel prend le maximum de son voisinage.
 * Séparable, donc appliquée en deux passes (horizontale puis verticale), ce
 * qui revient à un élément structurant carré de côté 2r+1.
 *
 * Un flou ne conviendrait pas : il moyenne, donc il grise les traits fins au
 * lieu de les élargir. Le maximum, lui, préserve le blanc plein.
 */
const dilater = (src, r) => {
  if (r <= 0) return src;
  const passe = Buffer.alloc(LARG * HAUT);
  const sortie = Buffer.alloc(LARG * HAUT);

  for (let y = 0; y < HAUT; y++) {
    const ligne = y * LARG;
    for (let x = 0; x < LARG; x++) {
      let max = 0;
      const fin = Math.min(LARG - 1, x + r);
      for (let k = Math.max(0, x - r); k <= fin; k++) if (src[ligne + k] > max) max = src[ligne + k];
      passe[ligne + x] = max;
    }
  }
  for (let x = 0; x < LARG; x++) {
    for (let y = 0; y < HAUT; y++) {
      let max = 0;
      const fin = Math.min(HAUT - 1, y + r);
      for (let k = Math.max(0, y - r); k <= fin; k++) {
        const v = passe[k * LARG + x];
        if (v > max) max = v;
      }
      sortie[y * LARG + x] = max;
    }
  }
  return sortie;
};

/**
 * Deux régimes, pas de dégradé entre les deux.
 *
 * Le logo compte une douzaine de cernes concentriques. À 16 px la rondelle ne
 * mesure qu'une dizaine de pixels : aucun filtre ne peut y faire tenir douze
 * anneaux. On dilate donc jusqu'à ce qu'ils fusionnent, et il reste la
 * silhouette — demi-rondelle et pan de toiture — qui, elle, est lisible.
 *
 * Les valeurs intermédiaires sont les pires : assez dilatées pour empâter les
 * cernes, pas assez pour les fondre, elles donnent un intérieur moucheté. D'où
 * le seuil net : silhouette pleine en dessous de 96 px, dessin d'origine intact
 * au-dessus, taille à laquelle les cernes se distinguent enfin.
 */
const SEUIL_SILHOUETTE = 96;
const RAYON = 26;

/**
 * Rend une icône carrée : la marque blanche centrée sur le bleu de la charte.
 * `ratio` est la part de la largeur qu'occupe la marque.
 */
const rendre = async (taille, ratio = 0.86) => {
  const alpha = dilater(opacite, taille < SEUIL_SILHOUETTE ? RAYON : 0);
  const rgba = Buffer.alloc(LARG * HAUT * 4, 255);
  for (let p = 0; p < LARG * HAUT; p++) rgba[p * 4 + 3] = alpha[p];

  const cible = Math.round(taille * ratio);
  const dessin = await sharp(rgba, { raw: { width: LARG, height: HAUT, channels: 4 } })
    .resize(cible, cible, { fit: 'inside' })
    .png()
    .toBuffer();
  const { width, height } = await sharp(dessin).metadata();

  return sharp({
    create: { width: taille, height: taille, channels: 4, background: CIEL },
  })
    .composite([
      {
        input: dessin,
        left: Math.round((taille - width) / 2),
        top: Math.round((taille - height) / 2),
      },
    ])
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

// Toutes les icônes sont à fond perdu : le bleu va bord à bord et ce sont les
// systèmes qui arrondissent (iOS, Android). Économiser l'arrondi ici, c'est
// autant de pixels rendus à la marque dans les petites tailles.
const icones = [
  ['apple-touch-icon.png', await rendre(180, 0.78)],
  ['icon-192.png', await rendre(192)],
  ['icon-512.png', await rendre(512)],
  // Android « maskable » : le système rogne les bords, la marque doit tenir
  // dans les 80 % centraux — d'où un ratio réduit d'autant.
  ['icon-maskable-512.png', await rendre(512, 0.86 * 0.8)],
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

// --- Marque seule, pour l'en-tête et le pied de page -----------------------

// `logo-noir.png` et `logo-blanc.png` sont des logotypes complets : la marque,
// puis « CAMBIOME » et la baseline. L'en-tête et le pied de page affichent
// déjà ces deux lignes en texte à côté de l'image — les réduire à 44 px les
// rendait illisibles sans rien apprendre à personne, et volait à la marque la
// moitié de la hauteur disponible.
//
// On ne garde donc que la marque. La zone est mesurée sur l'alpha des fichiers
// fournis, identique dans les deux : bande de la marque en 97..377, texte en
// dessous à partir de 420. Le carré est centré sur la marque (139..411) pour
// qu'elle vienne remplir la boîte sans décentrement optique.
const SEULE = { left: 135, top: 97, width: 281, height: 281 };

for (const [entree, sortie] of [
  ['logos/marque/logo-noir.png', 'marque-noire.png'],
  ['logos/marque/logo-blanc.png', 'marque-blanche.png'],
]) {
  const donnees = await sharp(source(entree))
    .extract(SEULE)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(source(`logos/derives/${sortie}`), donnees);
  console.log(`  src/assets/logos/derives/${sortie} — ${(donnees.length / 1024).toFixed(1)} ko`);
}

// --- Image de partage (Open Graph) -----------------------------------------

const LARGEUR = 1200;
const HAUTEUR = 630;

const fond = await sharp(source('realisations/charpente-aretier.jpg'))
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
const { data: alpha, info } = await sharp(source('logos/marque/titre-horizontal.png'))
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
