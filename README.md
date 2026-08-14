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
| Polices | Jost + Inter, auto-hébergées via Fontsource |
| Images | `astro:assets` — redimensionnement et conversion WebP au build |
| Déploiement | GitHub Pages via GitHub Actions |

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

```
src/
├── data/
│   ├── site.ts           ← coordonnées, métiers, démarche  ⟵ 90 % des modifs
│   └── realisations.ts   ← photos de chantiers + légendes
├── assets/
│   ├── logos/            ← logos fournis ; les `marque-*` sont générés
│   └── realisations/     ← photos optimisées (2400 px, JPEG q82)
├── components/           ← Header, Footer, cartes, galerie…
├── layouts/Base.astro    ← <head>, métadonnées, structure de page
├── pages/                ← une page = un fichier
└── styles/global.css     ← charte : couleurs, polices, utilitaires
```

Charte relevée sur les logos du brief :

| Rôle | Hex |
|---|---|
| Bleu ardoise (primaire) | `#41738D` |
| Terracotta (secondaire) | `#AD7B7A` |
| Neutres chauds « sable » | `#FBFAF8` → `#B3A996` |
| Encre | `#1A1D1F` |

## À compléter avant mise en ligne

Ces éléments manquent au brief. Tant qu'ils sont vides, le site masque les blocs
concernés plutôt que d'afficher de fausses informations.

- [ ] `src/data/site.ts` → `contact.assuranceDecennale.assureur` : nom de
      l'assureur et numéro de contrat, dont la mention est obligatoire
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

La mention « RGE Qualibat » apparaît à trois endroits : la page Métiers (bloc
Rénovation thermique), le bandeau du pied de page (logo et numéro de
certificat) et les mentions légales. Les trois sont pilotés par `rge` dans
`src/data/site.ts`, dont les valeurs proviennent du registre public de l'ADEME.

Passée la date `rge.fin`, les trois emplacements se masquent d'eux-mêmes :
afficher une qualification expirée serait une allégation trompeuse. Mais le
site est statique — **le retrait ne prend effet qu'au build suivant**. Un push
quelconque après la date suffit à l'appliquer ; sans push, la mention resterait
en ligne.

Quand une nouvelle attestation est délivrée, mettre à jour `debut`, `fin`,
`certificat` et `attestation`.

Le logo `src/assets/logos/rge-qualibat.png` a été extrait de l'attestation
Qualibat elle-même (`pdfimages`, puis normalisation du fond que la compression
JPEG avait teinté). Il fait 144 × 175 px, ce qui suffit largement pour les
44 px du pied de page, même en écran haute densité. La source officielle reste
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

Les actions du workflow sont épinglées sur un SHA de commit, pas sur un tag.
`.github/dependabot.yml` les tient à jour : Dependabot connaît la convention
`@<sha> # <version>` et propose chaque semaine le SHA **et** le commentaire
correspondants. Les dépendances npm suivent au mois, mineures et correctives
groupées en une seule demande pour éviter le bruit.

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
  contact (`api.web3forms.com`).
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

`docs/brief/` contient le mémo d'origine et les fichiers image livrés par
CAMBIOME (logos et photos en pleine résolution). C'est la référence : les
fichiers de `src/assets/` en sont des versions optimisées pour le web.
