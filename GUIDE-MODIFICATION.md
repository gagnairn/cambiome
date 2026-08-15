# Modifier le site soi-même

Ce guide s'adresse à CAMBIOME, pas à un développeur. Il explique comment
corriger un numéro de téléphone, un texte ou une légende de photo depuis un
simple navigateur, sans rien installer sur l'ordinateur.

**Vous ne pouvez pas casser le site en ligne.** Avant chaque publication, une
vérification automatique relit tout le site : si quelque chose ne va pas, la
publication est refusée et le site reste exactement comme il était. Le pire qui
puisse arriver, c'est que votre modification ne parte pas — jamais qu'elle
mette le site en panne. Vous pouvez donc essayer sans crainte.

---

## Avant la première fois

Il faut un compte sur [github.com](https://github.com) (gratuit) et que ce
compte ait été **ajouté au dépôt** par la personne qui l'administre :
`Settings` → `Collaborators` → `Add people`.

Sans cet ajout, le bouton de modification fonctionne quand même, mais il
propose votre changement au lieu de l'appliquer — et rien ne se publie tant que
personne ne l'a validé.

Trois adresses à garder sous la main :

| | |
|---|---|
| Le site en ligne | https://gagnairn.github.io/cambiome |
| Les fichiers | https://github.com/gagnairn/cambiome |
| L'état des publications | https://github.com/gagnairn/cambiome/actions |

---

## Le geste de base

Il est le même pour toutes les modifications décrites plus bas.

1. Ouvrez le fichier concerné (les liens sont donnés à chaque fois).
2. Cliquez sur l'icône **crayon** en haut à droite du fichier.
3. Modifiez le texte. **Ne changez que ce qui est entre guillemets.**
4. Cliquez sur le bouton vert **`Commit changes...`** en haut à droite.
5. Dans la fenêtre qui s'ouvre, décrivez en une ligne ce que vous avez fait
   (« Nouveau numéro de téléphone »). Laissez le reste tel quel.
6. Cliquez sur **`Commit changes`**.
7. Attendez **deux à trois minutes**, puis rechargez le site. Si vous ne voyez
   pas le changement, forcez le rechargement : `Ctrl+Maj+R`
   (`Cmd+Maj+R` sur Mac).

Pour suivre la publication en direct, ouvrez l'onglet
[Actions](https://github.com/gagnairn/cambiome/actions) : un point orange
signifie « en cours », une coche verte « c'est en ligne », une croix rouge
« refusé, le site n'a pas bougé » (voir la section dédiée plus bas).

---

## Les modifications courantes

### Téléphone, e-mail, adresse

Fichier : [`src/data/site.ts`](https://github.com/gagnairn/cambiome/edit/main/src/data/site.ts),
dans le bloc `contact` (vers la ligne 20).

```
  email: 'contact@cambiome.fr',
  telephone: '06 27 80 42 38',
  adresse: '36 avenue Jean Jaurès, 38600 Fontaine',
  instagram: 'https://instagram.com/cambiome_charpente',
```

Remplacez uniquement le texte entre les apostrophes. Ces coordonnées
apparaissent à plusieurs endroits du site à la fois (pied de page, page
Contact, mentions légales) : il n'y a qu'un seul endroit à corriger.

Un champ laissé vide (`''`) fait **disparaître** la ligne du site au lieu
d'afficher un vide. C'est voulu : mieux vaut ne rien annoncer qu'annoncer un
numéro qui ne répond plus.

### Le texte d'un métier

Même fichier, bloc `metiers` (vers la ligne 209). Chaque métier a quatre
parties :

| | |
|---|---|
| `titre` | le nom affiché — apparaît aussi dans le menu du pied de page |
| `chapo` | la phrase d'introduction, en gros caractères |
| `texte` | les paragraphes, un par ligne entre guillemets |
| `points` | la liste à puces, un élément par ligne |

Vous pouvez ajouter ou retirer une puce : recopiez une ligne existante avec sa
virgule finale, ou supprimez-la entièrement. Ne touchez pas à la ligne `slug`,
c'est l'adresse interne du métier — la changer casserait les liens du menu.

### Le titre ou la légende d'un chantier

Fichier : [`src/data/realisations.ts`](https://github.com/gagnairn/cambiome/edit/main/src/data/realisations.ts).
Chaque chantier est un bloc entre accolades :

```
  {
    slug: 'couverture-a-tasseaux',
    titre: 'Couverture à tasseaux',
    metier: 'Couverture',
    metierSlug: 'couverture-zinguerie',
    legende:
      "Lucarne reprise en couverture à tasseaux lors d'une réfection de toiture, à Échirolles.",
    alt: "Pan de toiture neuf en zinc à tasseaux, ses baguettes régulières brillant au soleil, au milieu de toits de tuiles anciens.",
    image: tasseaux,
  },
```

`titre` et `legende` sont ce que lisent vos visiteurs. `alt` décrit la photo
pour les personnes aveugles et pour Google : il doit dire ce qu'on **voit**,
pas répéter le titre. Les trois autres lignes (`slug`, `metierSlug`, `image`)
sont de la mécanique interne, laissez-les.

**L'ordre des blocs compte** : la page d'accueil affiche les trois premiers, et
la page Métiers illustre chaque métier avec le premier chantier de sa
catégorie. Déplacer un bloc vers le haut, c'est le mettre en avant.

### Retirer un chantier de la galerie

Supprimez son bloc entier, de l'accolade ouvrante `{` jusqu'à l'accolade
fermante suivie d'une virgule `},`. La photo reste dans le dépôt, elle ne
s'affiche simplement plus.

### La qualification RGE

Même fichier `site.ts`, bloc `rge` (vers la ligne 89). La ligne à surveiller
est la date de fin :

```
  fin: '2026-12-09',
```

Le site cesse **tout seul** d'afficher la qualification après cette date — page
dédiée, bandeau du pied de page, renvoi sur la page Métiers. C'est une
obligation légale : afficher un RGE expiré est une allégation trompeuse.

Une réserve importante : le site étant figé, ce retrait automatique ne prend
effet qu'à la publication suivante. **Le jour où la qualification est
renouvelée, ou le jour où elle expire, prévenez-nous** — il faut relancer une
publication pour que le site se mette à jour.

### Activer le formulaire de contact

Tant que la ligne `web3formsCle: ''` est vide (ligne 73 de `site.ts`), la page
Contact n'affiche que le téléphone et l'e-mail, sans formulaire. Pour
l'activer, il faut une clé gratuite obtenue sur
[web3forms.com](https://web3forms.com) en y saisissant l'adresse qui recevra
les messages. Collez-la entre les apostrophes.

### L'année du copyright

Fichier [`src/components/Footer.astro`](https://github.com/gagnairn/cambiome/edit/main/src/components/Footer.astro),
ligne 9 : `const annee = 2026;`. À changer une fois par an.

---

## Les cinq règles à respecter

1. **Ne modifiez que ce qui est entre guillemets** (`'...'` ou `"..."`). Ce qui
   est à gauche des deux-points est un nom technique.
2. **Gardez la virgule** en fin de ligne. C'est l'oubli le plus fréquent.
3. **Si votre texte contient une apostrophe**, entourez-le de guillemets
   doubles : `"L'étanchéité à l'air"`. Avec des apostrophes simples autour, la
   première apostrophe du mot couperait la phrase en deux.
4. **Ne supprimez jamais une accolade `{ }` ou un crochet `[ ]` seuls.** Ils
   vont par paires.
5. **Pas de mise en forme dans les textes** — ni gras, ni lien, ni saut de
   ligne. Ce sont des phrases simples ; la présentation est gérée ailleurs.

Les accents, les majuscules et la ponctuation française ne posent aucun
problème.

---

## Si une croix rouge apparaît

Elle signifie qu'une erreur a été détectée et que **la publication a été
refusée**. Le site en ligne est intact : les visiteurs ne voient rien, ils ont
toujours la version précédente.

Deux façons de s'en sortir :

- **Corriger** : rouvrez le fichier, cherchez la virgule manquante ou
  l'apostrophe en trop dans la ligne que vous venez de modifier, publiez à
  nouveau.
- **Annuler** : allez dans l'onglet `Commits`, ouvrez votre modification,
  cliquez sur `Revert`. Tout revient à l'état d'avant.

Dans le doute, envoyez-nous le lien de la ligne rouge — l'erreur est écrite en
clair dans le rapport, et elle indique le numéro de la ligne fautive.

---

## Ce qu'il vaut mieux nous demander

- **Ajouter une photo de chantier.** Ce n'est pas un simple téléversement : la
  photo doit être redimensionnée et recadrée, puis déclarée à deux endroits du
  fichier. Envoyez-nous les photos, c'est plus rapide que de s'y risquer.
- **Créer ou supprimer une page**, ajouter un métier, changer le menu.
- **Les couleurs, les polices, la mise en page.**
- **Les mentions légales.** Leur contenu est imposé par la loi (art. 6-III de
  la LCEN, art. L243-2 du code des assurances) : y retirer une ligne, c'est
  s'exposer.
- **Le texte de la mission** sur la page Démarche. Il est repris mot pour mot
  de l'article 3 de vos statuts. Une société à mission est engagée par ce
  texte : le site doit dire ce que disent les statuts, pas une version
  reformulée. Si la mission change, ce sont les statuts qui changent d'abord.
