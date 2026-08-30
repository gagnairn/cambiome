# CAMBIOME — site web

Site vitrine de **CAMBIOME**, entreprise d'éco-construction (charpente et
ossature bois, couverture et zinguerie, rénovation thermique, structure bois et
menuiserie).

Statique, sans cookie ni traceur. Le seul JavaScript côté client est l'envoi du
formulaire de contact, et il n'est pas nécessaire : sans lui, le formulaire est
posté nativement par le navigateur.

## Stack

| | |
|---|---|
| Framework | [Astro](https://astro.build) 7 — génération statique |
| Styles | [Tailwind CSS](https://tailwindcss.com) 4 (plugin Vite) |
| Types | TypeScript en mode `strict` — **tenu en 6.x**, voir ci-dessous |
| Polices | Jost + Inter, auto-hébergées, sous-ensemblées (43,3 Ko) |
| Images | `astro:assets` — redimensionnement et conversion WebP au build |
| Node | 24 en CI (LTS active) ; la 26 ne passe LTS qu'en octobre 2026 |
| Déploiement | GitHub Pages via GitHub Actions |

**TypeScript ne doit pas passer en 7.** La 7 est le compilateur réécrit en Go ;
il n'expose pas l'API programmatique dont `astro check` se sert, et `astro
check` refuse alors de démarrer — constaté, pas supposé. `@astrojs/check`
déclare d'ailleurs `typescript: ^5 || ^6`. Dependabot a l'exception en dur
(`.github/dependabot.yml`), à retirer quand
[withastro/roadmap#1321](https://github.com/withastro/roadmap/discussions/1321)
aboutira.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:4321/cambiome
```

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | génère le site dans `dist/` |
| `npm run preview` | sert `dist/` localement |
| `npm run check` | vérification des types Astro/TypeScript (exécutée aussi en CI) |
| `npm run verifier` | cohérence `.pages.yml` ↔ `src/content/`, liens internes et métadonnées de `dist/` — après `build` |
| `npm run images` | régénère les icônes, la marque seule et l'image de partage |

Les fichiers produits par `npm run images` (favicon `.ico`, icônes 192/512,
`apple-touch-icon`, `og-image.jpg`, et les `marque-*.png` de `src/assets/logos/`)
sont versionnés, mais ne se retouchent pas à la main : on modifie le logo source
ou la photo, puis on relance la commande. Le détail des sources est en tête de
`scripts/generer-images.mjs`.

Toutes les icônes sont dérivées du logo (`src/assets/logos/bloc-bleu.png`), dont
la marque est détourée automatiquement. En dessous de 96 px, ses cernes
concentriques ne tiennent plus dans les pixels disponibles : le script les fond
en une silhouette pleine, seule forme lisible dans un onglet. Il n'y a pas de
favicon SVG — le logo n'existe qu'en raster, et un SVG serait un redessin qui
divergerait de la marque.

L'en-tête et le pied de page n'affichent pas le logotype complet mais la marque
seule, découpée dans `logo-noir.png` et `logo-blanc.png` : « CAMBIOME » et la
baseline sont déjà juste à côté, en texte. Les embarquer une seconde fois dans
une image de 44 px les rendait illisibles et rognait la marque de moitié.

## Où modifier quoi

Côté client, il y a un guide séparé : [GUIDE-MODIFICATION.md](GUIDE-MODIFICATION.md)
décrit l'ajout d'un chantier avec sa photo et les modifications de texte depuis
Pages CMS (`app.pagescms.org`), sans compte GitHub ni ligne de commande. Ce qui
suit s'adresse à qui reprend le code.

```
src/
├── content/              ← TOUT le contenu, en YAML  ⟵ ce qu'écrit le CMS
│   ├── entreprise.yaml   ← coordonnées, atelier, identité légale, assurance, hébergeur
│   ├── metiers.yaml      ← les quatre métiers (clé `metiers`)
│   ├── demarche.yaml     ← les quatre piliers (clé `piliers`)
│   ├── realisations.yaml ← les chantiers (clé `chantiers`)
│   ├── rge.yaml          ← la qualification RGE
│   └── pages/            ← la prose des pages, un fichier par page
├── data/                 ← lecture + validation zod du contenu ci-dessus
│   ├── site.ts           ← entreprise, métiers, démarche, RGE
│   ├── realisations.ts   ← chantiers, et rattachement aux fichiers images
│   └── pages.ts          ← prose des pages, jetons {…} substitués
├── assets/
│   ├── logos/            ← logos fournis ; les `marque-*` sont générés
│   └── realisations/     ← photos optimisées (2400 px, JPEG q82)
├── components/           ← en-tête, pied de page, cartes, galerie…
├── layouts/Base.astro    ← <head>, métadonnées, structure de page
├── lib/                  ← helpers : liens (base.ts), typographie (texte.ts),
│                           lecture YAML (contenu.ts), gabarits (gabarit.ts)
├── pages/                ← une page = un fichier
└── styles/
    └── global.css        ← charte : couleurs, polices, utilitaires
```

`.pages.yml`, à la racine, décrit les formulaires du CMS. Il n'est lu que par
Pages CMS : le site ne le connaît pas. `npm run verifier` contrôle qu'il reste
en phase avec `src/content/` — un champ décrit ici mais absent du YAML se
remplirait de vide au premier enregistrement.

Deux conventions, pour qu'un fichier se devine sans le chercher.

**Les composants portent des noms français** — `EnTete`, `PiedDePage`,
`CarteMetier`, `AppelContact`. Le reste du dépôt l'est déjà (données, commits,
commentaires, guide client) ; deux composants en anglais y faisaient une
exception sans raison.

**Un lien interne s'écrit `lien('/contact')`**, jamais autrement.
`import.meta.env.BASE_URL` vaut `/cambiome` sous GitHub Pages et `/` avec un
domaine propre : concaténer sans normaliser le slash final donne
`/cambiomecontact` dans un cas et `//contact` dans l'autre. Cette normalisation
a été recopiée dans onze fichiers, sous deux formes divergentes. Elle vit
maintenant dans `src/lib/base.ts` — et le préfixe n'y est **délibérément pas
exporté**, pour que la règle soit tenue par le compilateur et pas par la
mémoire de qui relit. `lien()` couvre tout : les pages, la racine (`lien('/')`)
et les fichiers de `public/` (`lien('/favicon.ico')`).

Charte relevée sur les logos du brief :

| Rôle | Hex |
|---|---|
| Bleu ardoise | `#41738D` |
| Terracotta | `#AD7B7A` |
| Neutres chauds « sable » | `#FBFAF8` → `#B3A996` (+ un `500` hors charte, voir « Accessibilité ») |
| Encre | `#1A1D1F` |

Le site n'est pas bleu ardoise pour autant : la couleur retenue est **Ciel
`#9DC3D4`**, choisie après démonstration sur le site réel. Le relevé ci-dessus
reste la charte des logos livrés, qui n'ont pas changé — voir « Couleurs ».

## Le CMS

Le contenu s'édite sur [Pages CMS](https://pagescms.org) hébergé
(`app.pagescms.org`), qui lit `.pages.yml` et écrit dans `src/content/`. Rien
n'est ajouté au site : pas de page `/admin`, pas de script, pas d'octet servi
au visiteur. Un enregistrement produit un commit, donc une publication, donc la
chaîne `check` → `build` → `verifier` — une saisie invalide fait échouer la
publication et le site en ligne garde sa version précédente.

**À faire une fois**, dans l'interface, et impossible à scripter :

1. `app.pagescms.org` → *Sign in with GitHub* → installer l'application GitHub
   sur le compte qui possède le dépôt, en lui donnant accès à `cambiome`.
2. Ouvrir le dépôt dans Pages CMS, puis la page *Collaborators* → *Invite
   collaborators* → l'adresse e-mail de l'éditeur. L'invité n'a **pas besoin de
   compte GitHub** : il reçoit un lien, puis un code à six chiffres à chaque
   connexion. Il peut modifier le contenu et les médias ; il ne peut ni toucher
   à `.pages.yml`, ni inviter quelqu'un.

Les collaborateurs vivent dans la base de Pages CMS, pas dans le dépôt : ils ne
suivent pas si l'installation change de compte, et sont à réinviter.

`settings.commit.identity: user` met le nom de l'éditeur dans le commit plutôt
que `pages-cms[bot]`. Si un invité par e-mail n'arrive pas à publier, basculer
sur `app`.

**Deux pièges de Pages CMS**, tous deux vérifiés dans son code source et
consignés en tête de `.pages.yml` : une liste sous forme d'objet doit porter
`collapsible` ; et `list` sur une *entrée* n'est honoré que sous la forme
exacte `list: true`. La forme longue y passe la validation mais est ignorée par
le formulaire, qui présente alors le tableau comme un objet et l'écrase à
l'enregistrement. C'est pourquoi les trois fichiers-listes ont une clé de
premier niveau (`chantiers`, `metiers`, `piliers`) et déclarent leur liste sur
un champ. `scripts/verifier-cms.mjs` refuse le retour en arrière.

Le guide destiné à l'éditeur est [GUIDE-MODIFICATION.md](GUIDE-MODIFICATION.md).

## Couleurs

La couleur du site est **Ciel `#9DC3D4`**, arrêtée par le client après l'avoir
vue sur le site réel plutôt que sur un nuancier. Le sélecteur de thème qui
servait à cette démonstration, et les deux pistes concurrentes (Ardoise,
Terracotta), ont été retirés avec la décision : plus de `themes.css`, plus de
`SelecteurTheme.astro`, plus de script `is:inline`, plus de `localStorage`.
Tout tient dans le `@theme` de `global.css`.

### La rampe ne suit pas la teinte de #9DC3D4

`#9DC3D4` est à 199° de teinte, à deux degrés du `#41738D` des logos : ce n'est
pas un autre bleu, c'est le bleu de la charte éclairci. Une rampe prolongée
« fidèlement » autour de lui restait à ΔE 3,5–5 du bleu d'origine sur les crans
porteurs — au seuil de perception. La page aurait changé de couleur sans que
cela se voie.

D'où le parti pris : `#9DC3D4` est conservé tel quel au cran **300**, et le
reste de la rampe vire au turquoise franc (190°) à 85 % de saturation. C'est la
saturation qui fait le travail perceptif. Conséquence assumée, le 300 est le
seul cran à ne pas suivre la teinte de sa propre rampe.

Les crans ont un emploi imposé par les composants — mesures sur le fond de page
`sable-50` :

| Cran | Emploi | Contraste |
| --- | --- | --- |
| `700` | texte des boutons en contour, panneaux | 8,06:1 |
| `600` | petit texte (surtitres, liens de carte) | 6,14:1 |
| `500` | contour des commandes, anneau de focus | 4,61:1 |
| `400` | purement décoratif | 2,68:1 — sous tous les seuils |
| `300` | la teinte de marque elle-même, en aplat | — |

Une couleur de marque aussi claire ne peut pas occuper le cran 500 : elle tient
le 300, et la rampe se prolonge en dessous.

### Les grands aplats : quatre variables à part

Boutons, bloc d'appel, panneau de cernes et pied de page ne visent pas un cran
de la rampe mais quatre variables sémantiques :

| Variable | Rôle | Valeur |
| --- | --- | --- |
| `--color-marque` | l'aplat | `#9dc3d4` |
| `--color-marque-survol` | l'aplat au survol | `#86b4c8` |
| `--color-marque-bord` | contour du bouton | `#0c7d93` |
| `--color-sur-marque` | tout ce qui est posé dessus | `#1a1d1f` |

Le détour a été introduit pour que le couple fond / texte s'inverse d'une piste
à l'autre, et il survit à la décision pour une raison qui, elle, reste vraie :
`#9dc3d4` est un aplat **clair**, il porte de l'encre (9,03:1) et non du blanc
(1,88:1). Écrire `bg-ciel-700 text-white` dans les composants — le réflexe
habituel — donnerait ici un texte invisible. `bg-marque text-sur-marque` dit ce
que le composant veut, et `global.css` décide de quoi il s'agit.

Deux conséquences qui se voient dans le code :

- **contour permanent sur les boutons pleins.** Un aplat de marque doit se
  détacher du fond de page à 3:1 (WCAG 1.4.11) ; `#9dc3d4` sur `sable-50` n'en
  donne que 1,80:1. `marque-bord` lui donne ce contour en permanence ;
- **un seul ton de texte** dans le pied de page et dans le bloc d'appel. Ce
  n'est plus une contrainte — sur `#9dc3d4` un ton secondaire tiendrait
  jusqu'à 70 % d'opacité (4,52:1) — mais un choix : la hiérarchie y passe par
  la casse, l'interlettrage et la taille. Le commentaire de `PiedDePage.astro`
  garde le calcul pour la prochaine fois que la question se pose.

### Ce qui est généré et doit suivre

Le favicon, les icônes, l'image de partage et les deux `theme-color` ne sont
pas produits par la feuille de style. Ils portent le cran **500** (`#0C7D93`)
et non `marque` : ils habillent des surfaces où du texte système clair se pose,
que `#9DC3D4` ne porterait pas. Si la teinte devait rebouger, il faut reprendre
`CIEL` dans `scripts/generer-images.mjs`, la meta `theme-color` de
`Base.astro`, `theme_color` dans `src/pages/site.webmanifest.ts`, puis relancer
`npm run images`.

## Polices

Jost pour les titres, Inter pour le texte, toutes deux auto-hébergées —
aucun appel au CDN de Google, ce que la CNIL demande. Les deux fichiers
`.woff2` vivent dans `src/assets/polices/`, sont déclarés en `@font-face` en
tête de `src/styles/global.css`, et préchargés depuis `src/layouts/Base.astro`
en `?url` pour que le nom haché par Vite ne puisse pas se périmer.

### Pourquoi des fichiers versionnés plutôt que `@fontsource-variable`

Parce qu'un paquet générique ne peut pas savoir ce que ce site utilise.
Fontsource livre le latin complet sur l'axe de graisse entier — **73,1 Ko** —
là où le site n'écrit que du français et n'emploie que trois graisses : Jost à
300 (titres, nom dans l'en-tête) et 400 (surtitres, baseline, numéros
d'étape), Inter à 400 et 500.

Deux réductions cumulées, donc : le répertoire de caractères, et surtout l'axe
de graisse — une police variable transporte les déformations de tout son axe,
et c'est là qu'est le gros du poids. **43,3 Ko au total, soit 41 % de moins.**

Inter conserve pourtant 400–700, pour 1,7 Ko de plus. Hors intervalle déclaré,
le navigateur ne perd pas le gras, il le synthétise — vérifié dans les deux
moteurs — mais inégalement : une même phrase gagne 2,6 px sous Chrome et
12,6 px sous WebKit. Le texte courant est l'endroit où un `<strong>` peut
apparaître un jour ; un titre, non. Jost s'arrête donc à 400, et c'est
justement là qu'est l'économie (15,6 Ko contre 23,3).

Le gain se voit à l'affichage, mais pas là où on l'attend. Mesuré sur trois
états successifs du dépôt, accueil bridée mobile :

| | avant | + AVIF du hero | + polices réduites | + plafond de densité |
|---|---|---|---|---|
| Score performance | 91 | 94 | 95 | **98** |
| LCP | 3,53 s | 3,15 s | 2,93 s | **2,48 s** |
| Premier affichage (FCP) | 1,05 s | 1,05 s | 1,05 s | 1,05 s |

(La dernière colonne ne concerne pas les polices : c'est le `sizes` du hero,
expliqué en commentaire dans `src/pages/index.astro`.)

Les polices valent donc **0,22 s** sur les 0,60 s gagnées. Non parce qu'elles
seraient sur le chemin critique — elles ne le sont pas, le FCP ne bouge pas
d'un millième et le repli métrique affiche le texte tout de suite — mais parce
que sur un lien bridé elles se disputent la bande passante avec la photo du
hero. Trente kilo-octets de moins à télécharger, c'est la photo qui arrive
plus tôt.

La nuance vaut d'être retenue, parce qu'un test antérieur avait conclu
l'inverse : retirer les deux préchargements n'avait rien changé au LCP, et
avait dégradé le décalage. C'est cohérent — le préchargement déplace le moment
de la découverte à nombre d'octets constant, le sous-ensemble supprime des
octets. Seul le second soulage le tuyau.

Une contrepartie à connaître : le répertoire est désormais un jeu figé, choisi
comme sur-ensemble délibéré des 94 caractères que les neuf pages rendent
aujourd'hui. Le contenu étant modifiable depuis le CMS, un caractère exotique
saisi un jour sortirait du fichier. Il ne disparaîtrait pas — faute
d'`unicode-range`, il retombe simplement sur la famille suivante de la pile,
donc sur Arial — mais il détonnerait. Le cas échéant, ajouter son point de
code au répertoire ci-dessous et régénérer.

### Régénérer les fichiers

À faire **si une police change ou si le répertoire doit s'élargir**. Deux
étapes par police : `fonttools` restreint l'axe, `pyftsubset` découpe le
répertoire — l'instanciation d'axe n'existe pas comme option de `pyftsubset`.
Depuis un environnement où `fonttools` est installé (`pip install fonttools
brotli`), avec les originaux Fontsource pour sources :

```sh
REP='U+0020-007E,U+00A0-00FF,U+0152-0153,U+0178,U+0192,U+02C6,U+02DC,U+2010-2015,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+202F,U+2070,U+2074-2079,U+20AC,U+2116,U+2122,U+2190-2193,U+2212,U+25CF,U+FB01-FB02'

fonttools varLib.instancer -q inter-latin-wght-normal.woff2 wght=400:700 -o inter.ttf
pyftsubset inter.ttf --unicodes="$REP" --flavor=woff2 --layout-features='*' \
  --output-file=src/assets/polices/inter-400-700.woff2

fonttools varLib.instancer -q jost-latin-wght-normal.woff2 wght=300:400 -o jost.ttf
pyftsubset jost.ttf --unicodes="$REP" --flavor=woff2 --layout-features='*' \
  --output-file=src/assets/polices/jost-300-400.woff2
```

Si l'intervalle de graisse change, corriger aussi le `font-weight` du
`@font-face` correspondant dans `global.css` : il doit déclarer l'intervalle
réel du fichier, sans quoi le navigateur croit disposer de graisses absentes.

Le découpage ne touche aucune largeur d'avance — 209 glyphes communs pour
Inter, 212 pour Jost, zéro écart mesuré — donc les `size-adjust` des replis
ci-dessous n'ont pas à être recalculés après un simple changement de
répertoire. Après un changement de police, si.

### Les replis « Jost repli » et « Inter repli »

`font-display: swap` affiche le texte tout de suite dans une police système
puis rebascule quand la vraie arrive. Les deux n'occupant pas la même largeur,
le rebasculement décalait la page : **0,094 de décalage cumulé** sur Métiers,
mesuré sous bridage mobile — au-dessus du seuil de 0,1 tel que Lighthouse le
calcule, et le préchargement n'y change rien (il avance la découverte, pas le
basculement).

`src/styles/global.css` déclare donc deux `@font-face` de repli : Arial,
étirée pour avancer exactement comme Jost et comme Inter. Le décalage est
retombé à 0,0007, et Lighthouse donne 0 sur les quatre pages testées.

Le repli est épinglé par `local('Arial'), local('Helvetica'),
local('Liberation Sans')` plutôt que laissé à `sans-serif` : sans cela il
désignerait une police différente selon la plateforme et l'étirement serait
calculé pour la mauvaise. Arial et Helvetica ont la même largeur d'avance au
millième près (vérifié), Liberation Sans est dessinée pour être métriquement
compatible avec Arial. Là où aucune des trois n'existe — Android — la règle ne
s'applique tout simplement pas : pas de gain, pas de régression.

### Refaire les mesures

À relancer **si une police change**, pas autrement. Les pourcentages sont
relevés dans le navigateur et non recopiés d'une table. Servir le site
(`npm run preview`), puis dans la console de n'importe quelle page :

```js
await document.fonts.ready;
const ctx = document.createElement('canvas').getContext('2d');
const T = 1000; // grande taille : les arrondis deviennent négligeables
// Phrase française avec ses accents : c'est la largeur d'avance moyenne sur
// un vrai texte qui compte, pas sur un alphabet théorique.
const TXT = "Charpente, ossature bois, couverture et rénovation thermique à Grenoble — étanchéité à l'air maîtrisée.";
const m = (f) => {
  ctx.font = `${T}px ${f}`;
  const x = ctx.measureText(TXT);
  return {
    l: x.width / T / TXT.length,
    a: x.fontBoundingBoxAscent / T,
    d: x.fontBoundingBoxDescent / T,
  };
};
const repli = m('Arial');
for (const [nom, web] of [['Jost', m('"Jost Variable"')], ['Inter', m('"Inter Variable"')]]) {
  const k = web.l / repli.l;
  console.log(nom, {
    'size-adjust': (k * 100).toFixed(2) + '%',
    'ascent-override': ((web.a / k) * 100).toFixed(2) + '%',
    'descent-override': ((web.d / k) * 100).toFixed(2) + '%',
  });
}
```

`size-adjust` est le rapport des largeurs d'avance moyennes. Montée et descente
s'expriment en part de la taille de police **après** étirement — d'où la
division par ce même rapport. `line-gap-override` reste à `0%`.

### La colonne de lecture

`@utility mesure-lecture` (dans `global.css`) borne le texte suivi à `57ch`, et
non aux `65ch` du `max-w-prose` de Tailwind. `ch` est la largeur du « 0 », pas
celle d'un signe moyen : mesuré sur les textes du site, un signe français en
occupe 0,71 — 65ch composent donc 91 signes par ligne, au-delà des 80 que
recommande WCAG 1.4.8. À utiliser sur ce qui se lit d'un bout à l'autre
(mentions légales, qualification RGE, listes d'engagements) ; les chapôs
restent volontairement plus larges.

## Conformité HTML / CSS

Vérifié le 15 août 2026 sur `dist/`, avec `html-validate` (presets `standard`,
`recommended`, `a11y`, `document`) et la grammaire CSS de `css-tree`.

- **HTML** : aucun écart, presets `standard`, `recommended` et `a11y` compris.
  Chaque page a un `<h1>` et un seul, et aucun niveau de titre n'est sauté —
  d'où les props `niveau` de `TitreSection` et de `GalerieRealisations`, qui
  existent pour ça et pas pour régler une taille de texte.
- **CSS** : aucune déclaration refusée par la grammaire, hors celles que
  l'outil ne sait pas vérifier (celles qui passent par `var()`, et les
  descripteurs `@property` / `@font-face`).

Deux réserves à connaître avant de relancer une vérification :

- **le validateur officiel du W3C n'a pas été utilisé.** Le Nu Html Checker
  et Jigsaw sont des `.jar` et demandent Java. `html-validate` applique les
  mêmes règles de spec, ce n'est pas le même binaire ;
- **Jigsaw serait de toute façon trompeur sur ce site.** Il est resté sur un
  profil ancien et signale comme erreurs `@property` (52 occurrences dans la
  feuille produite), `color-mix()` (57) et `@layer` (5) — trois standards
  W3C que Tailwind 4 émet normalement. Le faire passer au vert n'est pas
  atteignable, et ne vaudrait rien.

Une seule règle est délibérément non suivie : `require-sri`, qui réclame un
attribut `integrity` sur le `<link>` de la feuille de style. SRI protège d'un
CDN tiers compromis ; ici la feuille est de même origine et son nom porte déjà
un hachage de contenu. Qui pourrait la modifier pourrait modifier le HTML et
son `integrity` dans le même geste. Astro n'a pas d'option pour l'émettre, et
l'ajouter à la main n'apporterait rien.

## Accessibilité

Vérifié le 15 août 2026 sur le site construit, dans Chrome piloté par
Playwright : axe-core sur les **neuf pages en deux formats** (mobile 390 px,
bureau 1440 px), puis Lighthouse en émulation mobile.

- **axe-core : aucune règle en échec**, sur les dix-huit passages.
- **Lighthouse** sur accueil / métiers / réalisations / contact :
  accessibilité **100**, bonnes pratiques **100**, performance 91 · 100 · 99 ·
  100, décalage cumulé **0** partout.

Ce que la machine ne voit pas a été repris à la main. Quatre points en sont
sortis, et expliquent du code qui paraîtrait sinon arbitraire.

**L'anneau de focus passe par une variable.** `:focus-visible` trace
`var(--anneau-focus, var(--color-ciel-500))`. Un anneau unique ne pouvait pas
convenir : sur l'aplat de marque, le cran 500 ne donne que 2,56:1, sous le
seuil de 3:1 — tout le pied de page et tous les blocs d'appel, sur les neuf
pages. Les deux surfaces à fond plein du site, `.surface-marque` et
`.surface-sombre`,
redéclarent la variable ; elle est héritée, donc tout ce qui est posé dessus
est couvert sans avoir à y penser composant par composant. La règle est portée
par la **surface** et non par la classe qui donne le fond, parce que
`outline-offset` trace l'anneau 2 px *en dehors* de l'élément, donc sur ce
qu'il y a derrière lui. Le détail est en commentaire dans `global.css`.

**Un cran de plus dans la rampe sable.** `--color-sable-500` (`#8F846C`) n'est
pas dans la charte, qui s'arrête au 400. Il ne sert qu'aux bordures des champs
de saisie : le 300 ne donnait que 1,60:1 sur blanc et le 400 que 2,32:1, quand
WCAG 1.4.11 exige 3:1 du contour qui identifie une commande. Celui-ci donne
3,69:1.

**La colonne de lecture** — `mesure-lecture`, 57ch et non `max-w-prose` ;
le calcul est dans la note « Polices » plus haut.

**Trois cibles restent sous 24 px, et c'est conforme** : chacune relève d'une
exception de WCAG 2.5.8. « Aller au contenu » mesure 1×1 hors focus (`sr-only`)
et reprend sa taille dès qu'on l'atteint ; la case à cocher du formulaire fait
16 px, mais la cible réelle est son libellé de trois lignes, associé par `for`
et cliquable ; « Mentions légales » est un lien *au fil du texte*, dont la
hauteur est celle de l'interligne — exception « Inline », explicite dans la
règle.

Un piège pour qui relance un audit : **estimer une longueur de ligne en
`fontSize × 0,5` ne marche pas ici.** Cela mesure la largeur du bloc et non
celle du texte : 181 signes annoncés sur des surtitres qui en font 17. Il faut
mesurer l'avance réelle.

Reste non vérifié : les états *envoyé* et *en erreur* du formulaire, qui
n'apparaissent qu'après une soumission réelle.

## Référencement

- **Titres et descriptions** viennent du CMS, un couple par page
  (`titreOnglet` / `description` dans `src/content/pages/`). `Base.astro`
  compose « *titre* — CAMBIOME », l'accueil prenant l'accroche à la place.
- **Canonique** dérivée de `site` et du chemin, **absente des pages
  `noindex`** : une page qui ne demande pas à être indexée n'a pas d'adresse de
  référence à désigner. Sur la 404 la balise était même fausse — elle pointait
  vers `/404/`, qui n'existe pas.
- **`sitemap.xml`** par `@astrojs/sitemap`, avec deux filtres dans
  `astro.config.mjs` : la page de confirmation d'envoi n'y figure pas, et la
  page RGE en sort d'elle-même le jour où la qualification expire.
- **`robots.txt`** généré depuis `site` (`src/pages/robots.txt.ts`) : il
  autorise l'exploration et renvoie au sitemap. Le refus d'indexation se pose
  par balise et non ici — voir « L'indexation suit le même interrupteur ».
- **JSON-LD** dans `DonneesStructurees.astro`, alimenté par `entreprise.yaml` :
  les coordonnées y sont les mêmes que celles du pied de page, il n'y a qu'une
  source à corriger. Le type n'est pas fixe — voir « Les deux adresses » et
  « Le type suit les horaires » ci-dessous.
- **Partage social** : `og:*` et `twitter:card`, image 1200×630 produite par
  `npm run images`.

### Les deux adresses

L'entreprise en a deux, et la distinction n'est pas cosmétique — elle est
juridique d'un côté, elle décide du référencement local de l'autre.

| champ CMS | valeur | où elle paraît | dans le JSON-LD |
|---|---|---|---|
| **Coordonnées → Siège social** | 36 avenue Jean Jaurès, 38600 Fontaine | mentions légales, page Contact (« Courrier ») | non |
| **Atelier → Adresse** | 19 bis rue de la Liberté, 38600 Fontaine | pied de page, page Contact (« Atelier »), JSON-LD | oui |

Le siège est immatriculé au RCS : c'est une donnée d'état civil de la société,
que les mentions légales doivent publier et que le site ne peut pas choisir.
C'est aussi là qu'aboutit un recommandé, la société y étant domiciliée — d'où
la ligne « Courrier » sur la page Contact. L'atelier est l'établissement réel,
celui qui a une porte : l'adresse qu'un visiteur cherche, et la seule qui ait
un sens sur une fiche Google.

Les deux paraissent donc côte à côte sur la page Contact, et ce qui rend la
chose sûre est qu'elles y sont **nommées par leur usage** — « Atelier » pour
venir, « Courrier » pour écrire — et non par leur nature juridique, que le
visiteur n'a pas à démêler. Sans ces intitulés, deux adresses voisines
enverraient une partie des gens à la mauvaise.

`site.ts` dérive `contact.adresseVisible` (l'atelier, le siège à défaut) pour
que le pied de page, la page Contact et le balisage ne puissent pas diverger.
Les pages qui publient le siège lisent `contact.adresse` directement : il
paraît donc en clair sur le site sans jamais entrer dans le balisage. C'est le
point à ne pas défaire — **une seule adresse est déclarée aux moteurs, celle
de la fiche Google**, les moteurs rapprochant fiche et site par concordance du
nom, de l'adresse et du téléphone.

Le code postal est **38600**. Fontaine (Isère) n'en a pas d'autre pour une
adresse de voirie ; un 386xx en est un CEDEX, réservé aux gros comptes. Le
numéro, la voie et les coordonnées géographiques ont été vérifiés dans la Base
Adresse Nationale (`api-adresse.data.gouv.fr`), qui rend le 19 bis en
`housenumber` — une adresse existante, et non un point interpolé le long de la
voie. À refaire avant toute saisie destinée au balisage structuré, où une
adresse fausse coûte plus qu'une adresse absente.

### Le type suit les horaires

Le JSON-LD n'annonce pas toujours la même chose, et **c'est le champ
« Horaires d'ouverture » du CMS qui en décide** :

| horaires | type déclaré | ce que le moteur comprend |
|---|---|---|
| vides | `Organization` + `areaServed` | « nous intervenons autour de Grenoble » |
| renseignés | `HomeAndConstructionBusiness` + `geo` + `openingHoursSpecification` | « venez ici, à ces heures-là » |

Le second vaut nettement mieux en référencement local — c'est ce qui autorise
Google à proposer un itinéraire. Mais il n'a de sens que si quelqu'un ouvre
effectivement la porte : un client devant une porte fermée coûte plus cher que
le gain. D'où la bascule par la donnée plutôt que par une case à cocher —
il n'existe aucun état où le site inviterait à venir sans dire quand, et rien
à penser à changer ailleurs.

`geo` et `openingHoursSpecification` sont conditionnés au même drapeau : ces
propriétés appartiennent à `Place`, dont `Organization` ne descend pas, et les
émettre hors bascule produirait un balisage invalide.

Deux garde-fous sur la saisie, tous deux vérifiés en cassant volontairement le
fichier : une heure mal écrite (`8h` au lieu de `08:00`) fait échouer le build
avec un message qui nomme le champ, et `npm run verifier` compare les plages
proposées par le CMS à celles que `src/lib/horaires.ts` sait traduire — une
valeur ajoutée d'un seul côté est signalée, dans les deux sens.

Pas de carte sur la page Contact : un `iframe` Google Maps rappellerait le CDN
de Google sur chaque visite, ce que la section « Polices » explique avoir
justement écarté. L'adresse et les horaires en texte suffisent au visiteur, et
c'est le balisage — pas une carte — que lit le moteur.

**Lighthouse annonce 66 en référencement, et c'est normal en préversion.** Un
seul des onze contrôles échoue, `is-crawlable` : la page est délibérément en
`noindex`. Le score repasse à 100 au passage en `production` — vérifié en
basculant l'interrupteur.

Une réserve de contenu, qui appartient au client : les titres d'onglet
occupent 18 à 34 signes sur la soixantaine que Google affiche, et aucun ne
nomme la zone d'intervention. « Contact — CAMBIOME » plutôt que
« Contact — charpentier à Grenoble | CAMBIOME » laisse de côté la requête qui
amène vraiment quelqu'un. Ils sont tous dans le CMS, un par page.

## À compléter avant mise en ligne

Ces éléments manquent au brief. Tant qu'ils sont vides, le site masque les blocs
concernés plutôt que d'afficher de fausses informations.

- [ ] Basculer l'hébergement vers OVH — les mentions légales le désignent
      **déjà** comme hébergeur, ce qui ne sera exact qu'une fois la bascule
      faite (voir « Migrer vers un hébergeur »). Tant qu'elle ne l'est pas, la
      page nomme un hébergeur qui ne sert pas le site.
- [ ] **Médiateur de la consommation** : les mentions légales n'en désignent
      aucun. L'article L616-1 du code de la consommation impose à tout
      professionnel travaillant pour des particuliers d'en nommer un, avec son
      adresse et son site, sur son propre site. Le bandeau « page à compléter »
      ne le détecte pas : il ne surveille que les champs existants, et
      celui-ci n'a pas encore de champ. À adhérer d'abord (un médiateur du
      bâtiment, payant), puis à ajouter au CMS.
- [ ] Photos supplémentaires dans la galerie — les quatre métiers y sont
      représentés, mais la rénovation thermique n'a qu'une seule photo alors
      que c'est le métier mis en avant par la qualification RGE
- [ ] `astro.config.mjs` → passer `HEBERGEMENT` à `'production'` au moment de
      la bascule vers `www.cambiome.fr`. Un seul mot, qui commande `site`,
      `base` et l'indexation (voir « Passer à un domaine propre »)
- [ ] **Horaires de l'atelier** dans le CMS, entrée « Entreprise » → bloc
      « Atelier ». Tant qu'ils sont vides, le balisage reste en
      `Organization` : le site n'invite pas à venir, et le référencement local
      s'en tient à la zone d'intervention. Les renseigner fait la bascule à lui
      seul (voir « Le type suit les horaires »)
- [ ] Une fois en ligne, hors du dépôt : créer la fiche **Google Business
      Profile** — sur des requêtes de ce type, l'établissement local pèse plus
      lourd que tout le référencement technique décrit plus haut — et déposer
      le sitemap dans la **Search Console**. Y déclarer l'**atelier**,
      `19 bis rue de la Liberté, 38600 Fontaine`, écrit exactement comme dans
      le CMS : c'est sur cette concordance que Google rapproche la fiche du
      site (voir « Les deux adresses »)

## Qualification RGE

Le sujet a sa page, `/rge-qualibat` : les aides ouvertes (MaPrimeRénov', CEE),
les quatre domaines qualifiés, ce que la qualification ne couvre pas, et
l'attestation. La mention apparaît en outre à trois endroits, qui y renvoient
ou la reprennent en une ligne : la page Métiers (renvoi sous le bloc Rénovation
thermique, `RgeRenvoi.astro`), le bandeau du pied de page (logo et numéro de
certificat) et les mentions légales. Les quatre sont pilotés par
`src/content/rge.yaml` (CMS : « Qualification RGE »), dont les valeurs
proviennent du registre public de l'ADEME.

Passée la date `rge.fin`, les quatre emplacements se masquent d'eux-mêmes :
afficher une qualification expirée serait une allégation trompeuse. Mais le
site est statique — **le retrait ne prend effet qu'au build suivant**. Un push
quelconque après la date suffit à l'appliquer ; sans push, la mention resterait
en ligne.

La page `/rge-qualibat`, elle, continue d'exister : elle est déjà indexée et
liée depuis l'extérieur, la faire disparaître donnerait un 404. Elle se réduit
alors à quelques lignes qui annoncent l'échéance, passe en `noindex` et sort du
sitemap (`filter` dans `astro.config.mjs`).

Quand une nouvelle attestation est délivrée, mettre à jour `debut`, `fin`,
`certificat` et `attestation`.

Le logo `src/assets/logos/rge-qualibat.png` a été extrait de l'attestation
Qualibat elle-même (`pdfimages`, puis normalisation du fond que la compression
JPEG avait teinté). Il fait 144 × 175 px : largement de quoi servir les 44 px
du pied de page en écran haute densité, et les 96 px de la page dédiée à 1,5×
sans agrandissement. La source officielle reste
le kit de communication de l'espace client Qualibat : s'il faut un jour
l'afficher plus grand, c'est là qu'il faut le prendre. Le droit d'usage de la
marque est attaché à la certification — il tombe avec elle, à la même date.

Il n'y a **pas** de logo en face, du côté Pro-Paille : le RFCP délivre une
attestation de réussite, pas une marque d'usage. La mention du pied de page est
donc typographique — voir la section suivante.

Pour revérifier la qualification à la source :

```sh
curl -s "https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/lines?siret_eq=93322608600017"
```

## Certification Pro-Paille

Deuxième entrée du bandeau de pied de page, à la place de la mention « société
à mission » qui s'y trouvait (voir la section suivante).

Pro-Paille est la formation aux **règles professionnelles de construction en
paille CP 2012**. Elle est dispensée par des formateurs agréés par le
[RFCP](https://www.rfcp.fr/propaille/) — Réseau français de la construction
paille — et sanctionnée par un examen, qui donne une attestation de réussite.

Deux différences avec la qualification RGE, à garder en tête :

| | RGE Qualibat | Pro-Paille |
| --- | --- | --- |
| Porte sur | l'entreprise | une personne formée |
| Expire | oui, `rge.fin` | non |
| Pilotée par | `src/content/rge.yaml` (CMS) | écrite en dur dans `PiedDePage.astro` |
| Renvoie à | `/rge-qualibat` | `rfcp.fr/propaille/` |
| Dans le JSON-LD | oui, `hasCredential` | non |

Le lien sort vers le RFCP faute de mieux : c'est la seule preuve consultable
tant que l'attestation n'est pas au dépôt. **Si l'attestation existe en PDF**,
la bonne suite est de la traiter comme le RGE — un `propaille.yaml` avec le nom
du titulaire, la date et le fichier, un renvoi depuis le bandeau vers une page
ou vers le PDF, et une entrée `hasCredential` de plus dans le JSON-LD. Une
certification adossée à sa pièce vaut nettement mieux, en référencement comme
en crédibilité, qu'un intitulé qui renvoie au site de l'organisme.

## Société à mission : retirée du site

Le site ne se prévaut plus de cette qualité. Rien n'en subsiste : la section de
`/demarche` qui reproduisait l'article 3 des statuts, son contenu
(`mission.yaml`), ses schémas, ses deux entrées CMS, la mention du bandeau de
pied de page, la ligne « Statut » des mentions légales et la description SEO de
`/demarche` qui s'en réclamait.

**Ce retrait est éditorial, pas juridique.** L'art. L210-10 du code de commerce
ouvre une faculté — une société *peut* faire publiquement état de cette
qualité — et n'impose aucun affichage : cesser de s'en prévaloir sur le site ne
soulève donc aucune difficulté. Mais tant que les statuts portent la mission et
que le RNE l'enregistre, **la société reste société à mission**, avec les
obligations qui vont avec (comité ou référent de mission au sens du 3°,
vérification par un organisme tiers indépendant). Y renoncer pour de bon passe
par une modification des statuts puis la mise à jour du RNE, hors du dépôt.

Deux vérifications à faire une fois cette formalité accomplie :

- `annuaire-entreprises.data.gouv.fr` ne doit plus afficher la qualité
- rien ne doit rester dans le dépôt :
  `grep -rn 'L210-10\|société à mission' src .pages.yml README.md`

Si la décision devait s'inverser, tout le dispositif éditorial revient d'un
seul revert :

```sh
git log --oneline -S 'societeAMission' -- src/pages/demarche.astro
git revert <commit>
```

## Déploiement

Le workflow `.github/workflows/deploy.yml` construit et publie sur GitHub Pages
à chaque push sur `main`, en trois jobs :

| Job | Rôle |
| --- | --- |
| `build` | `check` (types et props), `build`, puis `verifier` (liens internes) |
| `deploy` | publie l'artefact sur Pages |
| `fumee` | interroge le site publié : pages en 200, 404 servie, CSP présente |

**Settings → Pages → Build and deployment → Source** doit rester sur **GitHub
Actions**. S'il repointe sur une branche, GitHub relance en parallèle son
constructeur Jekyll historique, qui échoue à chaque push sur un site Astro : un
second run rouge, sans rapport avec le déploiement réel. Ce réglage n'est pas
automatisable depuis le workflow — l'API demande des droits d'administration que
`GITHUB_TOKEN` n'a pas. Pour le vérifier sans passer par l'interface :

```sh
gh api repos/gagnairn/cambiome/pages --jq .build_type   # doit dire « workflow »
```

Les deux dernières étapes existent parce que le reste ne suffit pas.
`astro check` ne regarde pas les URL : le favicon a été servi en 404 pendant
deux commits sans que rien ne devienne rouge. Et un déploiement peut réussir
sur un artefact vide. `verifier` attrape le premier cas avant publication,
`fumee` le second après.

L'étape de publication porte `include-hidden-files: true`, et il ne faut pas
l'enlever. Depuis sa v4, `upload-pages-artifact` exclut les fichiers cachés de
l'archive. `dist/` en contient deux, tous deux venus de `public/` :
`.nojekyll`, et `.htaccess` qui attend la migration chez un hébergeur Apache.
Sans cette ligne ils disparaîtraient de la publication **sans qu'aucun log ne
le signale** — le run reste vert. (`.git` et `.github` restent exclus d'office.)

Les actions du workflow sont épinglées sur un SHA de commit, pas sur un tag.
`.github/dependabot.yml` les tient à jour : Dependabot connaît la convention
`@<sha> # <version>` et propose chaque semaine le SHA **et** le commentaire
correspondants. Les dépendances npm suivent au mois, mineures et correctives
groupées en une seule demande pour éviter le bruit. Une seule exception y est
inscrite, `typescript` en `7.x` (motif plus haut) : sans elle, Dependabot
rouvrirait tous les mois une demande qui ne peut que rougir.

Un second workflow, `.github/workflows/photos.yml`, se déclenche sur toute
poussée touchant `src/assets/realisations/**` : il ramène à 2400 px / q82 les
images plus grandes, et recommite. Une photo arrivée du CMS sort d'un téléphone
— 4000 px, plusieurs mégaoctets — et un dépôt Git ne se dégonfle pas. C'est le
**seul job du dépôt qui écrive** (`contents: write`) ; les jobs de publication
n'ont que `contents: read`, d'où le fichier séparé. Son commit, signé par
`GITHUB_TOKEN`, ne redéclenche rien : la publication déclenchée par le
téléversement tourne donc sur l'original, ce qui ne change rien au rendu.

Le test de fumée se rejoue en local sur le site en ligne :

```sh
./scripts/fumee.sh https://gagnairn.github.io/cambiome/
```

URL par défaut : `https://gagnairn.github.io/cambiome/`

### Passer à un domaine propre

Domaine prévu : **`https://www.cambiome.fr`**.

1. `astro.config.mjs` : passer `HEBERGEMENT` de `'preversion'` à
   `'production'`. **C'est le seul interrupteur** — il commande `site`, `base`
   et l'indexation d'un coup.
2. Rien à faire pour `robots.txt` ni le manifeste : ils sont générés depuis
   `site` et `base` (`src/pages/robots.txt.ts`, `src/pages/site.webmanifest.ts`).
3. Ajouter `public/CNAME` contenant `www.cambiome.fr` — utile seulement tant
   que l'hébergement reste GitHub Pages.
4. Renseigner le domaine dans **Settings → Pages → Custom domain**.

#### Pourquoi un seul interrupteur

`site` et `base` sont **solidaires**, et ne peuvent pas anticiper le domaine.
Dès que `base` disparaît, tous les liens visent la racine ; tant que les pages
sont servies depuis `gagnairn.github.io/cambiome/`, elles répondent toutes en
404. `site` ne sert pas non plus qu'aux balises : il construit l'adresse de
retour du formulaire quand JavaScript n'est pas disponible
(`FormulaireContact.astro`). Déclarer le domaine avant qu'il ne serve le site
casserait donc la navigation *et* le formulaire.

#### L'indexation suit le même interrupteur

Tant que `HEBERGEMENT` vaut `preversion`, chaque page porte
`<meta name="robots" content="noindex, follow">`. C'est délibéré : le site est
servi à une adresse qui n'est pas la sienne, et la laisser indexer coûterait
cher à la bascule — les pages de la marque installées sous un sous-domaine
personnel, puis deux adresses servant le même contenu, sans possibilité de
rediriger, GitHub Pages ne sachant pas émettre de 301.

La balise est **déduite du nom d'hôte** (`src/layouts/Base.astro`) et non d'un
drapeau à part : elle disparaît d'elle-même au passage en `production`. Rien à
penser à retirer, donc rien à oublier.

Et c'est bien un `noindex`, pas un `Disallow` dans `robots.txt` : interdire
l'exploration empêcherait justement les moteurs de *lire* la balise, et
l'adresse pourrait ressortir malgré tout dans les résultats, sans description.
Laisser explorer et demander à ne pas indexer est la seule combinaison qui
tient.

#### www ou domaine nu ?

Un seul des deux doit être l'adresse officielle, l'autre s'y redirige en 301.
S'ils répondent tous les deux, la même page existe à deux URL : les moteurs
partagent le référencement entre elles, et le `<link rel="canonical">` que
génère Astro depuis `site` en désigne une seule, ce qui contredit l'autre.

`www` étant l'adresse retenue, la redirection du domaine nu vers `www` est
préparée — commentée — dans `public/.htaccess`, à activer une fois le DNS en
place.

### Migrer vers un hébergeur

Le site est entièrement statique : déployer, c'est téléverser le contenu de
`dist/`. Rien à installer côté serveur, ni Node ni base de données.

1. `astro.config.mjs` : passer `HEBERGEMENT` à `'production'` — c'est le même
   interrupteur qu'à la section précédente, et il n'y en a pas d'autre.
2. Rien à faire pour `robots.txt` ni le manifeste : ils sont générés depuis
   `site` et `base` (`src/pages/robots.txt.ts`, `src/pages/site.webmanifest.ts`).
3. `src/content/entreprise.yaml` → `hebergeur` (CMS : « L'entreprise →
   Hébergeur du site ») : rien à faire si la cible est bien OVH,
   dont les coordonnées y figurent déjà. Pour tout autre hébergeur, ce sont
   son nom, son adresse et son téléphone qu'il faut y mettre : la mention est
   une obligation légale et doit désigner l'hébergeur réel.
4. `npm run build`, puis téléverser `dist/`.
5. Vérifier que les en-têtes de sécurité sortent bien (voir ci-dessous).

Les en-têtes sont déjà écrits, dans deux formats livrés à la racine du site :

| Hébergeur | Fichier |
| --- | --- |
| Netlify, Cloudflare Pages | `public/_headers` |
| Apache — OVH, o2switch, Infomaniak… | `public/.htaccess` |
| nginx / VPS | à recopier dans le bloc `server` (voir plus bas) |

GitHub Pages les ignore tous les deux, ce qui est sans conséquence : ils
attendent la migration.

## Sécurité

Ce qui est en place :

- **CSP** générée par Astro (`security.csp` dans `astro.config.mjs`) et injectée
  en `<meta>` avec le hachage de chaque script inline. Aucun `unsafe-inline`.
  Les seules destinations externes autorisées sont celles du formulaire de
  contact (`api.web3forms.com`). Astro ne hache que les scripts qu'il groupe —
  aucun hachage n'est donc à déclarer à la main : le site n'a plus de script
  `is:inline`, les seuls qui échappent à Astro.
- **Actions GitHub épinglées sur un SHA de commit** plutôt que sur un tag
  mutable, pour qu'un tag repointé ne puisse pas exécuter de code arbitraire
  dans le workflow.
- **Aucune ressource tierce au chargement** : polices auto-hébergées, pas de
  cookie, pas de mesure d'audience.
- **En-têtes HTTP** prêts pour la migration (`_headers`, `.htaccess`) :
  `frame-ancestors` / `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, `Cross-Origin-Opener-Policy`, HSTS.

La CSP complète n'est **pas** répétée dans les fichiers d'en-têtes. Quand une
CSP arrive par en-tête *et* par meta, le navigateur applique l'intersection des
deux : un en-tête `script-src 'self'` sans les hachages bloquerait les scripts
que la meta autorise. Ces fichiers ne portent donc que `frame-ancestors`, seule
directive que le navigateur ignore lorsqu'elle vient d'une meta. Les deux
sources ne peuvent pas diverger.

### nginx

```nginx
add_header Content-Security-Policy "frame-ancestors 'none'" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), xr-spatial-tracking=()" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
# À n'activer qu'une fois le HTTPS en place sur tout le domaine.
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
```

Attention : dans nginx, un `add_header` déclaré dans un bloc imbriqué
(`location`) annule **tous** ceux du bloc parent. Si un `location` du fichier
ajoute déjà un en-tête, il faut y recopier cette liste.

### Restant à faire, côté comptes

- [ ] **Web3Forms** : dans le tableau de bord, restreindre la clé au domaine du
      site et activer le captcha. La clé d'accès est publique par conception —
      elle est dans le HTML — donc c'est cette restriction, et elle seule, qui
      empêche un tiers de s'en servir pour inonder la boîte de réception.
- [ ] **Compte GitHub `gagnairn`** : activer l'authentification à deux facteurs.
      Qui prend le compte prend le site.
- [ ] **Settings → Advanced Security** : activer *Dependabot alerts* et
      *Dependabot security updates*. Le fichier `.github/dependabot.yml` ne
      commande que les mises à jour de routine ; les alertes de vulnérabilité,
      elles, sont un réglage du dépôt et ne s'activent pas depuis le code.

### Vérifier après mise en ligne

```sh
curl -sI https://www.cambiome.fr | grep -i '^\(content-security\|x-frame\|x-content\|referrer\|permissions\|cross-origin\|strict-transport\)'
```

Un rapport complet est disponible sur
[securityheaders.com](https://securityheaders.com) et
[observatory.mozilla.org](https://observatory.mozilla.org).

## Sources

Le brief remis par CAMBIOME — mémo éditorial et images en pleine résolution —
**n'est plus dans le dépôt** : il pesait 45 Mo sur 52, pour des fichiers dont
le site n'a pas besoin au build. Il est archivé hors dépôt, dans
`cambiome-brief-archive-2026-08-14.tar.gz`. C'est désormais la seule copie :
l'historique git en a été purgé, elle ne se récupère pas par `git checkout`.

Ce qu'il reste dans `src/assets/` couvre tout ce dont le site se sert :

- **les logos** (`bloc-bleu`, `logo-noir`, `logo-blanc`, `titre-horizontal`,
  `bloc-terracotta`) sont les fichiers livrés **tels quels**, à l'octet près.
  Rien de plus défini n'existait dans le brief : c'était déjà le même fichier ;
- **les photos** sont des versions allégées (2400 px, JPEG q82). Les originaux,
  eux, ne sont plus que dans l'archive — pour un recadrage large ou un tirage,
  c'est là qu'il faut aller les chercher.

Huit photos font exception : elles ne viennent pas du brief mais du compte
[Instagram](https://www.instagram.com/cambiome_charpente) de CAMBIOME, dont
elles gardent le plafond de **1080 px** au lieu de 2400. Ce sont la couverture
à tasseaux, la structure de lucarne, la soudure de chéneau, la pergola, les
chevrons porteurs, les consoles de chêne, le bardage mélèze et le garde-corps.
Elles suffisent à la galerie, qui ne demande jamais plus de 1200 px, mais un
tirage y perdrait — si les originaux ressortent du téléphone, il n'y a que les
fichiers de `src/assets/realisations/` à réécrire, les noms ne bougent pas.

Ces huit-là sont aussi les seules à avoir été **recadrées**, serré sur
l'ouvrage et au format 4/3 des vignettes : le carré d'Instagram y perdait un
huitième en haut et en bas au rognage, ce qui coupait la rive du pan de zinc
et le faîtage du pignon en mélèze, et le reste du cadre montrait surtout le
chantier autour. Le recadrage est fait dans le fichier plutôt que par
`object-position` en CSS, pour ne pas servir des octets qui ne s'affichent
jamais ; le prix est qu'il n'y reste plus de marge. Les versions non recadrées
sont récupérables dans l'historique git (`git log -- src/assets/realisations`).
Attention en y touchant : les `legende` et les `alt` de `realisations.yaml`
décrivent le cadrage actuel, pas la photo publiée.

`bloc-terracotta` est la variante secondaire du bloc, référencée nulle part
dans le site. Elle reste malgré tout la source d'une couleur de la feuille de
style : `terre-*`, la teinte des messages d'erreur, est le `#AD7B7A` relevé
dessus. Supprimer le fichier laisserait cette valeur sans origine vérifiable.

Aucun de ces cinq logos n'est importé par un composant : ils n'apparaissent
donc jamais dans `dist/`, et ne coûtent rien au poids du site. Quatre sont les
sources de `npm run images`, qui en tire les marques monochromes et les icônes
— les supprimer rendrait la commande injouable. `marque-blanche.png` fait
exception depuis le passage à Ciel : la marque blanche donne 1,88:1 sur
`#9DC3D4`, plus aucun composant ne l'affiche. Elle continue d'être produite,
pour trois kilo-octets qui ne sont jamais servis.
