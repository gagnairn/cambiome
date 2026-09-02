# CAMBIOME — site web

Site vitrine de **CAMBIOME**, entreprise d'éco-construction à Fontaine (Isère) :
charpente et ossature bois, couverture et zinguerie, rénovation thermique,
structure bois et menuiserie, architecture.

Statique, sans cookie ni traceur. Le seul JavaScript côté client est l'envoi du
formulaire de contact, et il n'est même pas nécessaire : sans lui, le navigateur
poste le formulaire nativement.

En ligne : **<https://www.cambiome.fr>**

## Stack

| | |
|---|---|
| Framework | [Astro](https://astro.build) 7 — génération statique |
| Styles | [Tailwind CSS](https://tailwindcss.com) 4 (plugin Vite) |
| Types | TypeScript `strict`, **tenu en 6.x** |
| Polices | Jost + Inter, auto-hébergées et sous-ensemblées |
| Images | `astro:assets` — redimensionnement et WebP au build |
| Contenu | YAML dans `src/content/`, édité via [Pages CMS](https://pagescms.org) |
| Hébergement | OVH mutualisé (Apache), dépôt SFTP par GitHub Actions |

> **TypeScript ne doit pas passer en 7.** La 7 est le compilateur réécrit en Go ;
> il n'expose pas l'API dont `astro check` se sert, et `astro check` refuse alors
> de démarrer. L'exception est en dur dans `.github/dependabot.yml`.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:4321
```

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | génère le site dans `dist/` |
| `npm run preview` | sert `dist/` localement |
| `npm run check` | types et props Astro (aussi en CI) |
| `npm run verifier` | `.pages.yml` ↔ `src/content/`, liens internes, métadonnées — après `build` |
| `npm run images` | régénère favicons, icônes et image de partage |

Les fichiers produits par `npm run images` sont versionnés mais **ne se
retouchent pas à la main** : on modifie le logo source, puis on relance la
commande.

## Structure

```
src/
├── content/     ← TOUT le contenu, en YAML — c'est ce qu'écrit le CMS
│   └── pages/   ← la prose des pages, un fichier par page
├── data/        ← lecture et validation zod du contenu
├── assets/      ← logos fournis et photos de chantier
├── components/  ← noms français : EnTete, PiedDePage, CarteMetier…
├── layouts/     ← Base.astro : <head>, métadonnées, structure
├── lib/         ← liens, typographie, lecture YAML, gabarits
├── pages/       ← une page = un fichier
└── styles/      ← global.css : couleurs, polices, utilitaires
```

> **Un lien interne s'écrit `lien('/contact')`**, jamais autrement. La fonction
> vit dans `src/lib/base.ts`, qui n'exporte délibérément pas le préfixe : c'est
> ce qui a permis de changer d'hébergeur sans toucher à un seul lien.

## Contenu et CMS

Le client édite le contenu sur `app.pagescms.org/gagnairn/cambiome/main/file`,
sans compte GitHub ni ligne de commande. Son guide :
[GUIDE-MODIFICATION.md](GUIDE-MODIFICATION.md).

`.pages.yml`, à la racine, décrit les formulaires du CMS. Il n'est lu que par
Pages CMS ; le site ne le connaît pas. Ses pièges et leurs contournements sont
commentés en tête du fichier, et `npm run verifier` refuse toute divergence avec
`src/content/`.

Un enregistrement produit un commit, donc une publication. Une saisie invalide
fait échouer la chaîne, et le site en ligne garde sa version précédente.

## Déploiement

`.github/workflows/deploy.yml`, à chaque push sur `main` :

| Job | Rôle |
|---|---|
| `build` | `check`, `build`, `verifier`, puis dépose `dist/` en artefact |
| `deploy` | reprend l'artefact et le miroite en SFTP chez OVH |
| `fumee` | interroge le site en ligne : pages en 200, 404 servie, CSP présente |

Secrets attendus — en secrets et non en variables, le dépôt étant public :

| Secret | Contenu |
|---|---|
| `OVH_SFTP_SERVEUR` | `sftp.clusterXXX.hosting.ovh.net` |
| `OVH_SFTP_LOGIN` | login de l'hébergement |
| `OVH_SFTP_MOTDEPASSE` | son mot de passe |
| `OVH_SFTP_CLE_HOTE` | sortie de `ssh-keyscan <serveur>`, relevée une fois |
| `OVH_SFTP_REPERTOIRE` | racine du site, **relative** : `www`. Un chemin absolu (`/www`) échoue |

Trois choses à ne pas défaire :

- `OVH_SFTP_REPERTOIRE` doit désigner la racine du **site**. Le transfert emploie
  `mirror --delete` ; pointé sur la racine du compte, il emporte tout le reste.
- `include-hidden-files: true` sur l'artefact. Sans cette ligne, `dist/.htaccess`
  disparaît sans qu'aucun log ne le signale — et c'est lui qui porte les en-têtes
  de sécurité et la page 404.
- Les actions sont épinglées au SHA, pas au tag. Dependabot les tient à jour.

Second workflow, `photos.yml` : ramène à 2400 px les photos arrivées du CMS
depuis un téléphone, et recommite. C'est le seul job du dépôt qui écrive.

Le test de fumée se rejoue en local :

```sh
./scripts/fumee.sh https://www.cambiome.fr
```

## À faire

- [ ] **Médiateur de la consommation** : les mentions légales n'en désignent
      aucun, alors que l'article L616-1 du code de la consommation l'impose.
      Adhérer à un médiateur du bâtiment, puis l'ajouter au CMS.
- [ ] **Horaires de l'atelier** dans le CMS (« Entreprise » → « Atelier »). Tant
      qu'ils sont vides, le balisage reste `Organization` : le site n'invite pas
      à venir.
- [ ] **Photos** : l'architecture n'en a aucune, la rénovation thermique une
      seule alors que c'est le métier porté par la qualification RGE.
- [ ] Hors dépôt : créer la fiche **Google Business Profile** avec l'adresse de
      l'atelier écrite exactement comme dans le CMS, et déposer le sitemap dans
      la **Search Console**.
