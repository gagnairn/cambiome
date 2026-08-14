# CAMBIOME — site web

Site vitrine de **CAMBIOME**, entreprise d'éco-construction (charpente et
ossature bois, couverture et zinguerie, rénovation thermique, structure bois et
menuiserie).

Statique, sans JavaScript côté client, sans cookie ni appel à un service tiers.

## Stack

| | |
|---|---|
| Framework | [Astro](https://astro.build) 7 — génération statique |
| Styles | [Tailwind CSS](https://tailwindcss.com) 4 (plugin Vite) |
| Polices | Jost + Inter, auto-hébergées via Fontsource |
| Images | `astro:assets` — redimensionnement et conversion AVIF/WebP au build |
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
| `npm run check` | vérification des types Astro/TypeScript |

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

- [ ] `src/data/site.ts` → `contact` : téléphone, email, adresse, Instagram
- [ ] `src/data/site.ts` → `contact.siret` et `contact.assurance` (décennale)
- [ ] `src/data/site.ts` → `contact.formulaireEndpoint` : URL d'un service de
      formulaire (Formspree, Basin, Web3Forms) — sans quoi le formulaire de
      contact n'est pas affiché
- [ ] `src/pages/mentions-legales.astro` : forme juridique, capital, directeur
      de la publication, hébergeur — **obligatoire** (art. 6-III LCEN)
- [ ] Photos supplémentaires par métier (la rénovation thermique n'a pas encore
      d'illustration propre)
- [ ] `astro.config.mjs` → `site` / `base` si un nom de domaine est acheté

## Déploiement

Le workflow `.github/workflows/deploy.yml` construit et publie sur GitHub Pages
à chaque push sur `main`. À activer une fois : **Settings → Pages → Source →
GitHub Actions**.

URL par défaut : `https://gagnairn.github.io/cambiome/`

### Passer à un domaine propre

1. `astro.config.mjs` : `site: 'https://cambiome.fr'`, supprimer `base`.
2. `public/robots.txt` : mettre à jour l'URL du sitemap.
3. Ajouter `public/CNAME` contenant `cambiome.fr`.
4. Renseigner le domaine dans **Settings → Pages → Custom domain**.

## Sources

`docs/brief/` contient le mémo d'origine et les fichiers image livrés par
CAMBIOME (logos et photos en pleine résolution). C'est la référence : les
fichiers de `src/assets/` en sont des versions optimisées pour le web.
