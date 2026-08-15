# CAMBIOME — site web

Site vitrine de **CAMBIOME**, entreprise d'éco-construction (charpente et
ossature bois, couverture et zinguerie, rénovation thermique, structure bois et
menuiserie).

Statique, sans cookie ni traceur. Le seul JavaScript côté client est l'envoi du
formulaire de contact, et il n'est pas nécessaire : sans lui, le formulaire est
posté nativement par le navigateur.

*Pendant la phase de choix des couleurs*, un second script accompagne le
sélecteur de thème et retient la teinte choisie en `localStorage` — une
préférence locale, jamais transmise. Il disparaît avec le sélecteur (voir
« Thèmes »).

## Stack

| | |
|---|---|
| Framework | [Astro](https://astro.build) 7 — génération statique |
| Styles | [Tailwind CSS](https://tailwindcss.com) 4 (plugin Vite) |
| Types | TypeScript en mode `strict` — **tenu en 6.x**, voir ci-dessous |
| Polices | Jost + Inter, auto-hébergées via Fontsource |
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
| `npm run verifier` | vérifie les liens internes de `dist/` — après `build` |
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
décrit les modifications courantes (coordonnées, textes des métiers, légendes,
date du RGE) depuis l'éditeur web de GitHub, sans installation ni ligne de
commande. Il suppose que le compte GitHub de l'entreprise a été ajouté aux
collaborateurs du dépôt. Ce qui suit s'adresse à qui reprend le code.

```
src/
├── data/
│   ├── site.ts           ← coordonnées, métiers, démarche  ⟵ 90 % des modifs
│   └── realisations.ts   ← photos de chantiers + légendes
├── assets/
│   ├── logos/            ← logos fournis ; les `marque-*` sont générés
│   └── realisations/     ← photos optimisées (2400 px, JPEG q82)
├── components/           ← en-tête, pied de page, cartes, galerie…
├── layouts/Base.astro    ← <head>, métadonnées, structure de page
├── lib/                  ← helpers : liens internes (base.ts), typographie (texte.ts)
├── pages/                ← une page = un fichier
└── styles/
    ├── global.css        ← charte : couleurs, polices, utilitaires
    └── themes.css        ← pistes chromatiques alternatives (temporaire)
```

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
| Bleu ardoise (primaire) | `#41738D` |
| Terracotta (secondaire) | `#AD7B7A` |
| Neutres chauds « sable » | `#FBFAF8` → `#B3A996` |
| Encre | `#1A1D1F` |

## Thèmes — trois pistes soumises au client

**Dispositif temporaire**, le temps du choix de la direction couleur. Une carte
flottante en bas à droite permet de parcourir le vrai site dans trois teintes
plutôt que de les juger sur un nuancier. Le choix suit d'une page à l'autre.

| Piste | Ancrage | Où vit la couleur |
| --- | --- | --- |
| **Ardoise** (défaut) | `#41738D` | le `@theme` de `global.css` |
| **Terracotta** | `#AD7B7A` — logo `bloc-terracotta.png` | `themes.css` |
| **Ciel** | `#9DC3D4` | `themes.css` |

Aucun composant n'est concerné : ils écrivent `bg-ardoise-700`, que Tailwind
compile en `var(--color-ardoise-700)`. Un thème ne fait que redéfinir ces
variables sous `html[data-theme=…]`. Deux contraintes à connaître avant
d'ajouter une piste, détaillées en tête de `src/styles/themes.css` :

- les crans ont un emploi imposé — `700` porte du texte blanc, `600` et `500`
  du petit texte sur fond clair, `800` est le fond du pied de page. Une teinte
  de marque trop claire ne peut donc pas occuper le cran 500 : c'est le cas
  des deux pistes alternatives, dont l'ancrage descend au 400 ou au 300 ;
- les blocs sont hors de tout `@layer`, et ne sont pas écrits en `@theme` —
  Tailwind élague les variables de thème inutilisées.

### Les grands aplats : quatre variables à part

Boutons, bloc d'appel, panneau de cernes et pied de page ne visent pas un cran
de la rampe mais quatre variables sémantiques, déclarées dans le `@theme` de
`global.css` et redéfinies par chaque piste :

| Variable | Rôle | Ardoise | Terracotta | Ciel |
| --- | --- | --- | --- | --- |
| `--color-marque` | l'aplat | `#41738d` | `#ad7b7a` | `#9dc3d4` |
| `--color-marque-survol` | l'aplat au survol | `#386478` | `#c09796` | `#86b4c8` |
| `--color-marque-bord` | contour du bouton | `#386478` | `#96625f` | `#0c7d93` |
| `--color-sur-marque` | tout ce qui est posé dessus | `#ffffff` | `#1a1d1f` | `#1a1d1f` |

La raison de ce détour : la teinte relevée sur le logo n'occupe pas le même
rôle d'une piste à l'autre. `#41738d` porte du texte blanc (5,17:1), `#ad7b7a`
ne le porte pas (3,56:1) et réclame de l'encre (4,75:1), `#9dc3d4` porte
l'encre confortablement (9,03:1). Écrire `bg-ardoise-700 text-white` dans les
composants figerait ce choix pour toutes les pistes ; `bg-marque
text-sur-marque` le laisse au thème, et le couple s'inverse tout seul.

Trois conséquences qui se voient dans le code :

- **contour permanent sur les boutons.** Un aplat de marque doit se détacher du
  fond de page à 3:1 (WCAG 1.4.11). Terracotta au survol tombe à 2,48:1 et Ciel
  à 1,80:1. Plutôt qu'un contour n'apparaissant que sur certaines pistes,
  `marque-bord` en donne un à tous, en permanence ;
- **plus de second ton de texte** dans le pied de page ni dans le bloc d'appel.
  Sur un fond à mi-tons il ne reste pas 4,5:1 de marge pour un ton secondaire
  (×1,15 sous Ardoise, ×1,06 sous Terracotta). La hiérarchie y passe par la
  casse, l'interlettrage et la taille ;
- **les deux marques sont rendues** dans le pied de page, et le thème en masque
  une (règles en fin de `themes.css`). La marque blanche donne 1,88:1 sur
  l'aplat clair de la piste Ciel : elle y serait invisible. Un `filter: invert()`
  aurait suffi à l'écran, mais c'est le genre de raccourci qui survit en
  production.

**Ce que le sélecteur ne change pas.** Les logos suivent déjà : l'en-tête et le
pied de page affichent la marque en monochrome. Mais le favicon, l'image de
partage et `theme-color` restent bleus pendant la démonstration — ils sont
générés, et ne se régénèrent qu'une fois le choix fait.

### Une fois la direction arrêtée

1. Reporter la rampe retenue dans le `@theme` de `global.css`, puis supprimer
   `src/styles/themes.css` et son `@import`, `src/components/SelecteurTheme.astro`,
   `src/lib/theme-script.ts`, l'entrée `themes` de `src/data/site.ts`, et dans
   `astro.config.mjs` la constante `HACHAGE_SCRIPT_THEME` avec son
   `scriptDirective`. Le site retrouve son unique script (le formulaire).
2. Reporter aussi les quatre variables `marque` / `sur-marque` de la piste
   retenue dans le `@theme` — elles y sont déjà, aux valeurs de l'ardoise.
   Puis, si `sur-marque` vaut du blanc (cas de l'ardoise seule), retirer du
   pied de page la seconde `<Image>` et les classes `logo-sur-marque-*`, et de
   `Bouton.astro` les variantes `sur-marque` / `contour-sur-marque` si elles
   redeviennent équivalentes à `clair` et à `contour`. Sinon les garder :
   elles portent l'inversion du texte, pas une préférence.
3. Si ce n'est plus l'ardoise : mettre à jour `ARDOISE` dans
   `scripts/generer-images.mjs`, la meta `theme-color` de `Base.astro`,
   `theme_color` dans `src/pages/site.webmanifest.ts`, le tableau de charte
   ci-dessus, puis relancer `npm run images`.
4. Renommer `ardoise-*` d'après la nouvelle teinte — un `sed` sur ~120
   occurrences. **Pas avant** : tant que l'ardoise est le défaut le nom reste
   exact, et renommer pendant la phase de choix ferait bouger tous les
   composants pour une décision qui peut encore changer.

`themes.selecteur = false` dans `src/data/site.ts` éteint tout sans rien
supprimer — utile pour voir le site tel qu'il sera livré.

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

## À compléter avant mise en ligne

Ces éléments manquent au brief. Tant qu'ils sont vides, le site masque les blocs
concernés plutôt que d'afficher de fausses informations.

- [ ] `src/data/site.ts` → `contact.web3formsCle` : clé obtenue sur
      [web3forms.com](https://web3forms.com) (saisir l'adresse de réception,
      valider le mail de confirmation, aucun compte à créer) — sans elle le
      formulaire de contact n'est pas affiché
- [ ] Basculer l'hébergement vers OVH — les mentions légales le désignent
      **déjà** comme hébergeur, ce qui ne sera exact qu'une fois la bascule
      faite (voir « Migrer vers un hébergeur »). Tant qu'elle ne l'est pas, la
      page nomme un hébergeur qui ne sert pas le site.
- [ ] Photos supplémentaires dans la galerie — les quatre métiers y sont
      représentés, mais la rénovation thermique n'a qu'une seule photo alors
      que c'est le métier mis en avant par la qualification RGE
- [ ] `astro.config.mjs` → `site` / `base`, au moment de la bascule vers
      `www.cambiome.fr` (voir « Passer à un domaine propre »)

## Qualification RGE

Le sujet a sa page, `/rge-qualibat` : les aides ouvertes (MaPrimeRénov', CEE),
les quatre domaines qualifiés, ce que la qualification ne couvre pas, et
l'attestation. La mention apparaît en outre à trois endroits, qui y renvoient
ou la reprennent en une ligne : la page Métiers (renvoi sous le bloc Rénovation
thermique, `RgeRenvoi.astro`), le bandeau du pied de page (logo et numéro de
certificat) et les mentions légales. Les quatre sont pilotés par `rge` dans
`src/data/site.ts`, dont les valeurs proviennent du registre public de l'ADEME.

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

Il n'y a **pas** de logo en face pour « société à mission » : c'est une qualité
juridique (art. L210-10 du code de commerce), pas un label, et l'État ne
délivre aucun emblème. La mention du pied de page est donc typographique.

Pour revérifier la qualification à la source :

```sh
curl -s "https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/lines?siret_eq=93322608600017"
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

Le test de fumée se rejoue en local sur le site en ligne :

```sh
./scripts/fumee.sh https://gagnairn.github.io/cambiome/
```

URL par défaut : `https://gagnairn.github.io/cambiome/`

### Passer à un domaine propre

Domaine prévu : **`https://www.cambiome.fr`**.

1. `astro.config.mjs` : `site: 'https://www.cambiome.fr'`, supprimer `base`.
2. Rien à faire pour `robots.txt` ni le manifeste : ils sont générés depuis
   `site` et `base` (`src/pages/robots.txt.ts`, `src/pages/site.webmanifest.ts`).
3. Ajouter `public/CNAME` contenant `www.cambiome.fr` — utile seulement tant
   que l'hébergement reste GitHub Pages.
4. Renseigner le domaine dans **Settings → Pages → Custom domain**.

Ces deux modifications sont **solidaires** : dès que `base` disparaît, tous les
liens du site pointent sur la racine du domaine. Tant que les pages sont
servies depuis `gagnairn.github.io/cambiome/`, elles répondraient toutes en
404. Il faut donc les pousser au moment de la bascule, pas avant.

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

1. `astro.config.mjs` : `site: 'https://www.cambiome.fr'`, supprimer `base`.
2. Rien à faire pour `robots.txt` ni le manifeste : ils sont générés depuis
   `site` et `base` (`src/pages/robots.txt.ts`, `src/pages/site.webmanifest.ts`).
3. `src/data/site.ts` → `hebergeur` : rien à faire si la cible est bien OVH,
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
  contact (`api.web3forms.com`). Astro ne hache que les scripts qu'il groupe :
  le script `is:inline` du sélecteur de thème déclare le sien, dérivé de la
  chaîne elle-même dans `astro.config.mjs` pour que les deux ne divergent pas.
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
Attention en y touchant : les `legende` et les `alt` de `realisations.ts`
décrivent le cadrage actuel, pas la photo publiée.

`bloc-terracotta` est la variante secondaire du bloc : conservée parce qu'elle
fait partie de la charte, mais référencée nulle part dans le site.

Aucun de ces cinq logos n'est importé par un composant : ils n'apparaissent
donc jamais dans `dist/`, et ne coûtent rien au poids du site. Quatre sont les
sources de `npm run images` — les supprimer rendrait la commande injouable.
`bloc-terracotta` est le seul à ne rien alimenter ; il attend la décision sur
la couleur (voir « Thèmes »), et se supprimera avec `themes.css` si la piste
terracotta n'est pas retenue.
