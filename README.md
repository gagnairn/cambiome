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
commande — ou on laisse la CI le faire, voir ci-dessous.

### Les trois dossiers de `src/assets/logos/`

| Dossier | Contenu | Téléversable au CMS |
|---|---|---|
| `marque/` | logos fournis par CAMBIOME | **oui** |
| `partenaires/` | Qualibat, RFCP | **oui** |
| `derives/` | produits par `npm run images` | non |

`derives/marque-noire.png` est le logo affiché en haut du site, et c'est un
**fichier généré** : découpé dans `marque/logo-noir.png` à des coordonnées
mesurées au pixel. Il n'est donc pas exposé au CMS — un remplacement y serait
écrasé à la génération suivante. Idem pour `public/` : favicon, icônes,
image de partage.

Les découpes étant mesurées, `generer-images.mjs` **refuse une source dont les
dimensions ont changé**, en nommant le fichier et la taille attendue. Changer
délibérément de logo suppose donc de remesurer `MARQUE` et `SEULE` dans le
script. Sans ce contrôle, un logo d'une autre taille produirait des icônes
fausses en silence.

## Structure

```
src/
├── content/     ← TOUT le contenu, en YAML — c'est ce qu'écrit le CMS
│   └── pages/   ← la prose des pages, un fichier par page
├── data/        ← lecture et validation zod du contenu
├── assets/      ← logos (marque/ partenaires/ derives/) et photos
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
| `build` | `images`, `check`, `build`, `verifier`, puis dépose `dist/` en artefact |
| `deploy` | reprend l'artefact et le miroite en SFTP chez OVH |
| `fumee` | interroge le site en ligne : pages en 200, 404 servie, CSP présente |

Secrets attendus — en secrets et non en variables, le dépôt étant public :

| Secret | Contenu |
|---|---|
| `OVH_SFTP_SERVEUR` | `ssh.clusterXXX.hosting.ovh.net` — **pas** `sftp.`, voir ci-dessous |
| `OVH_SFTP_LOGIN` | login de l'hébergement |
| `OVH_SFTP_MOTDEPASSE` | son mot de passe |
| `OVH_SFTP_CLE_HOTE` | sortie de `ssh-keyscan <serveur>`, relevée une fois |
| `OVH_SFTP_REPERTOIRE` | racine du site, **relative** : `www`. Un chemin absolu (`/www`) échoue |

Le préfixe `ssh.` n'est pas une coquille. `sftp.clusterXXX.hosting.ovh.net`
existe, mais pointe sur l'IP web du cluster, où rien n'écoute sur le port 22 :
la connexion TCP est acceptée puis coupée, ce qui donne un `nc -z` trompeur et
un `ssh-keyscan` muet. Seul `ssh.clusterXXX` répond vraiment.

Trois choses à ne pas défaire :

- `OVH_SFTP_REPERTOIRE` doit désigner la racine du **site**. Le transfert emploie
  `mirror --delete` ; pointé sur la racine du compte, il emporte tout le reste.
- `include-hidden-files: true` sur l'artefact. Sans cette ligne, `dist/.htaccess`
  disparaît sans qu'aucun log ne le signale — et c'est lui qui porte les en-têtes
  de sécurité et la page 404.
- Les actions sont épinglées au SHA, pas au tag. Dependabot les tient à jour.

`npm run images` tourne **avant** `check`, et c'est ce qui rend la marque
modifiable sans développeur : remplacer `marque/logo-noir.png` depuis le CMS met
à jour le logo de l'en-tête, le favicon, les icônes et l'image de partage dans
la même publication. La sortie étant déterministe, l'étape ne produit aucune
différence tant que les logos ne bougent pas.

Deux autres workflows, les seuls jobs du dépôt qui **écrivent** — d'où leurs
fichiers séparés, `deploy.yml` n'ayant que `contents: read` :

| Workflow | Déclencheur | Effet |
|---|---|---|
| `photos.yml` | `src/assets/realisations/**` | ramène les photos du CMS à 2400 px, recommite |
| `images.yml` | `src/assets/logos/marque/**` | régénère les dérivés, recommite |

`images.yml` ne tient que la cohérence du **dépôt** — la production, elle, est
déjà juste puisque `deploy.yml` régénère avant de construire. Sans lui,
`npm run dev` montrerait l'ancienne marque après un changement de logo au CMS.
Un push signé par `GITHUB_TOKEN` ne redéclenchant aucun workflow, son commit ne
relance pas de publication : c'est voulu, il n'y a rien à republier.

Le test de fumée se rejoue en local :

```sh
./scripts/fumee.sh https://www.cambiome.fr
```

## La qualification RGE ne s'auto-retire plus

Le dépôt portait une règle d'échéance (`src/lib/echeance.ts`, `rgeEnCours`) qui
masquait la mention RGE partout passée `rge.fin` : page vidée et sortie du
sitemap, encadré de renvoi et bandeau du pied de page retirés. **Elle a été
supprimée à la demande de l'entreprise** — un renouvellement en cours
d'instruction faisait disparaître la page pour la durée du dossier.

`debut` et `fin` restent saisis et publiés (`validUntil` du balisage), mais ne
commandent plus rien. Le seul contrôle qui subsiste sur ces dates est leur
cohérence entre elles.

Ce que ça déplace : afficher un RGE non renouvelé est une allégation trompeuse
au sens du code de la consommation, et le dépôt ne s'y oppose plus. Le retrait
est désormais une opération manuelle, et elle demande une intervention sur le
code — il n'y a pas d'interrupteur dans le CMS.

> Si un interrupteur est souhaité un jour, la forme idiomatique ici serait de
> rendre les champs de `rge.yaml` facultatifs et de conditionner l'affichage à
> leur présence, comme le fait déjà chaque coordonnée. C'est une décision, pas
> un oubli : elle n'a pas été prise.

Pour rétablir la règle : `git revert` du commit qui l'a retirée.

## À faire

- [ ] **Médiateur de la consommation** : les mentions légales n'en désignent
      aucun, alors que l'article L616-1 du code de la consommation l'impose.
      Adhérer à un médiateur du bâtiment, puis l'ajouter au CMS.
- [ ] **Photos** : l'architecture n'en a aucune, la rénovation thermique une
      seule alors que c'est le métier porté par la qualification RGE.
- [ ] Hors dépôt : créer la fiche **Google Business Profile** avec l'adresse de
      l'atelier écrite exactement comme dans le CMS, et déposer le sitemap dans
      la **Search Console**.

      Le site est prêt à l'accueillir : coller le lien de la fiche dans
      **Textes de service → L'entreprise → Coordonnées → Fiche Google**
      ajoute le bouton « Itinéraire » à la page Contact et le `sameAs` au
      balisage. Rien d'autre à toucher, et rien ne s'affiche tant que le
      champ est vide.

      Deux points décident du rapprochement fiche ↔ site. D'abord la
      concordance nom / adresse / téléphone, au signe près : `CAMBIOME` seul,
      sans mot-clé ajouté au nom, `19 bis rue de la Liberté, 38600 Fontaine`
      (l'atelier, pas le siège), `06 27 80 42 38`. Ensuite la catégorie
      principale, qui pèse plus lourd que tout le reste du formulaire —
      *Charpentier*, les autres métiers en catégories secondaires.

      L'adresse de l'atelier n'est pas celle immatriculée au RCS. Si la
      vérification bute là-dessus, deux issues : déclarer l'atelier comme
      établissement secondaire au greffe, ou créer la fiche au siège — et
      dans ce second cas vider `atelier.adresse` dans le CMS, faute de quoi
      le balisage déclarerait une adresse que la fiche ne connaît pas.
