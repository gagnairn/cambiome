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
| `npm run images` | régénère les icônes et l'image de partage dans `public/` |

Les fichiers produits par `npm run images` (favicon `.ico`, icônes 192/512,
`apple-touch-icon`, `og-image.jpg`) sont versionnés, mais ne se retouchent pas à
la main : on modifie le logo source ou la photo, puis on relance la commande. Le
détail des sources est en tête de `scripts/generer-images.mjs`.

Toutes les icônes sont dérivées du logo (`src/assets/logos/bloc-bleu.png`), dont
la marque est détourée automatiquement. En dessous de 96 px, ses cernes
concentriques ne tiennent plus dans les pixels disponibles : le script les fond
en une silhouette pleine, seule forme lisible dans un onglet. Il n'y a pas de
favicon SVG — le logo n'existe qu'en raster, et un SVG serait un redessin qui
divergerait de la marque.

## Où modifier quoi

```
src/
├── data/
│   ├── site.ts           ← coordonnées, métiers, démarche  ⟵ 90 % des modifs
│   └── realisations.ts   ← photos de chantiers + légendes
├── assets/
│   ├── logos/            ← logos fournis par CAMBIOME
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
- [ ] Photos supplémentaires par métier (les quatre ont désormais une
      illustration, mais une seule chacun pour certains)
- [ ] `astro.config.mjs` → `site` / `base` si un nom de domaine est acheté

## Déploiement

Le workflow `.github/workflows/deploy.yml` construit et publie sur GitHub Pages
à chaque push sur `main`, en trois jobs :

| Job | Rôle |
| --- | --- |
| `build` | `check` (types et props), `build`, puis `verifier` (liens internes) |
| `deploy` | publie l'artefact sur Pages |
| `fumee` | interroge le site publié : pages en 200, 404 servie, CSP présente |

Un réglage est à faire une fois pour toutes dans **Settings → Pages → Build and
deployment → Source**, à mettre sur **GitHub Actions**. Tant qu'il pointe sur
une branche, GitHub lance en parallèle son constructeur Jekyll historique, qui
échoue à chaque push sur un site Astro : un second run rouge, sans rapport avec
le déploiement réel. Ce réglage n'est pas automatisable depuis le workflow —
l'API demande des droits d'administration que `GITHUB_TOKEN` n'a pas.

Les deux dernières étapes existent parce que le reste ne suffit pas.
`astro check` ne regarde pas les URL : le favicon a été servi en 404 pendant
deux commits sans que rien ne devienne rouge. Et un déploiement peut réussir
sur un artefact vide. `verifier` attrape le premier cas avant publication,
`fumee` le second après.

Le test de fumée se rejoue en local sur le site en ligne :

```sh
./scripts/fumee.sh https://gagnairn.github.io/cambiome/
```

URL par défaut : `https://gagnairn.github.io/cambiome/`

### Passer à un domaine propre

1. `astro.config.mjs` : `site: 'https://cambiome.fr'`, supprimer `base`.
2. Rien à faire pour `robots.txt` ni le manifeste : ils sont générés depuis
   `site` et `base` (`src/pages/robots.txt.ts`, `src/pages/site.webmanifest.ts`).
3. Ajouter `public/CNAME` contenant `cambiome.fr`.
4. Renseigner le domaine dans **Settings → Pages → Custom domain**.

### Migrer vers un hébergeur

Le site est entièrement statique : déployer, c'est téléverser le contenu de
`dist/`. Rien à installer côté serveur, ni Node ni base de données.

1. `astro.config.mjs` : mettre `site` à l'URL réelle et supprimer `base`.
2. Rien à faire pour `robots.txt` ni le manifeste : ils sont générés depuis
   `site` et `base` (`src/pages/robots.txt.ts`, `src/pages/site.webmanifest.ts`).
3. `src/data/site.ts` → `hebergeur` : nom, adresse et téléphone du nouvel
   hébergeur — c'est une obligation légale, et la mention doit désigner
   l'hébergeur réel. Les coordonnées d'OVH sont déjà écrites en commentaire
   au-dessus du bloc.
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

### Vérifier après mise en ligne

```sh
curl -sI https://cambiome.fr | grep -i '^\(content-security\|x-frame\|x-content\|referrer\|permissions\|cross-origin\|strict-transport\)'
```

Un rapport complet est disponible sur
[securityheaders.com](https://securityheaders.com) et
[observatory.mozilla.org](https://observatory.mozilla.org).

## Sources

`docs/brief/` contient le mémo d'origine et les fichiers image livrés par
CAMBIOME (logos et photos en pleine résolution). C'est la référence : les
fichiers de `src/assets/` en sont des versions optimisées pour le web.
