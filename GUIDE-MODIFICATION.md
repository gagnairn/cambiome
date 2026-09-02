# Modifier le site soi-même

Ce guide s'adresse à CAMBIOME, pas à un développeur. Il explique comment ajouter
un chantier avec sa photo, corriger un numéro de téléphone ou réécrire un texte,
depuis un simple navigateur, sans rien installer sur l'ordinateur.

Tout se fait à une seule adresse :

> **https://app.pagescms.org/gagnairn/cambiome/main/file**

C'est la seule voie de modification décrite ici, et la seule à emprunter : rien
de ce qui suit ne demande d'aller ailleurs.

**Vous ne pouvez pas casser le site en ligne.** C'est le point le plus important,
et il vaut la peine de comprendre pourquoi.

Le site publié n'est jamais modifié directement. Vous remplissez un formulaire ;
celui-ci enregistre votre texte ; le site est alors **reconstruit** à partir de ce
texte, et ce n'est qu'une fois la reconstruction réussie que la nouvelle version
remplace l'ancienne. Entre les deux, une série de contrôles automatiques relit
tout : les champs obligatoires, les liens internes, les photos référencées, la
cohérence des métiers. Si l'un d'eux échoue, la publication est annulée et **le
site en ligne reste exactement tel qu'il était**.

Le pire qui puisse arriver, c'est que votre modification ne parte pas. Jamais
qu'elle mette le site en panne. Vous pouvez donc essayer sans crainte.

---

## Avant la première fois

Vous recevez un e-mail intitulé **« You were added to 'cambiome' on Pages CMS »**.
Il contient un lien : suivez-le.

1. Sur la page qui s'ouvre, saisissez votre adresse e-mail — la même que celle à
   laquelle l'invitation est arrivée.
2. Un **code à six chiffres** vous est envoyé par e-mail. Saisissez-le.
3. Vous voilà connecté·e, sur le dépôt **cambiome**, à l'adresse
   https://app.pagescms.org/gagnairn/cambiome/main/file. C'est de là que part
   toute modification du site.

Il n'y a **pas de mot de passe** à retenir : à chaque nouvelle connexion, un
nouveau code à six chiffres est envoyé. Il n'y a pas non plus de compte GitHub à
créer. Si le code n'arrive pas, regardez dans les indésirables avant de nous
écrire.

Trois adresses sont à garder sous la main :

| | |
|---|---|
| **Modifier le site** | https://app.pagescms.org/gagnairn/cambiome/main/file |
| Le site en ligne | https://gagnairn.github.io/cambiome |
| L'état des publications | https://github.com/gagnairn/cambiome/actions |

La première est **la seule par laquelle on modifie le site**, et c'est elle
qu'il faut mettre en favori : elle ouvre directement la liste des contenus de
CAMBIOME, sans passer par un choix de dépôt. Les deux autres ne servent qu'à
regarder — le site tel que le voient les visiteurs, et l'état de la dernière
publication. On n'écrit rien depuis elles.

---

## Ce que vous voyez en arrivant

Une colonne, à gauche, liste tout ce qui est modifiable :

| Entrée | Contenu |
|---|---|
| **Chantiers** | la galerie de réalisations, photos comprises |
| **Textes des pages** | un dossier, une entrée par page du site |
| **Les métiers** | les métiers |
| **Les piliers de la démarche** | les piliers |
| **L'entreprise** | coordonnées, identité légale, assurance, hébergeur |
| **Qualification RGE** | organisme, certificat, dates, domaines |
| **Mission de la société à mission** | le texte statutaire |

Plus une rubrique **Media → Photos de chantiers**, qui donne accès aux images
déjà téléversées.

Chaque entrée est un formulaire : on clique dedans, on modifie, on enregistre.

### Pourquoi deux entrées portent le nom d'une même page

Dans « Textes des pages », vous trouverez **Nos métiers** et **Notre démarche**.
Et plus bas, dans la colonne, **Les métiers** et **Les piliers de la démarche**.
Ce n'est pas un doublon : ces deux entrées ne contiennent pas la même chose, et
la seconde ne sert pas qu'à sa page.

| Vous voulez modifier… | Entrée à ouvrir |
|---|---|
| le titre et le chapô en haut de la page Métiers | Textes des pages → **Nos métiers** |
| le texte d'un métier, ses paragraphes, ses puces | **Les métiers** |
| le titre et le chapô en haut de la page Démarche | Textes des pages → **Notre démarche** |
| le texte d'un pilier | **Les piliers de la démarche** |

La règle est la même dans les deux cas : l'entrée du dossier « Textes des pages »
ne touche que **l'en-tête** de sa page ; l'entrée du bas porte le contenu, et ce
contenu est **repris sur la page d'accueil** — les métiers en cartes, les piliers
en liste numérotée. Modifier un métier change donc deux pages à la fois. Une
phrase le rappelle une fois l'entrée ouverte, sous la liste.

---

## Le geste de base

Il est le même pour toutes les modifications décrites plus bas.

1. Cliquez sur l'entrée à modifier, dans la colonne de gauche.
2. Modifiez ce que vous voulez dans le formulaire.
3. Cliquez sur **`Save`**, en haut à droite.
4. C'est parti : le site se reconstruit tout seul.
5. Attendez **deux à trois minutes**, puis rechargez le site. Si vous ne voyez
   pas le changement, forcez le rechargement : `Ctrl+Maj+R`
   (`Cmd+Maj+R` sur Mac).

Il n'y a pas d'aperçu avant publication : le formulaire montre le texte brut,
sans la mise en page. La mise en page, elle, ne bouge pas — c'est justement pour
cela qu'il n'y a rien à prévisualiser.

Vous pouvez enregistrer plusieurs fois de suite. Chaque enregistrement lance une
publication ; si vous en enchaînez trois, seule la dernière compte.

Pour suivre la publication en direct, ouvrez l'onglet
[Actions](https://github.com/gagnairn/cambiome/actions) : un point orange
signifie « en cours », une coche verte « c'est en ligne », une croix rouge
« refusé, le site n'a pas bougé » (voir la section dédiée plus bas).

---

## Ajouter un chantier

C'est le geste le plus fréquent, et celui pour lequel ce système existe.

La liste s'ouvre repliée : un bandeau par chantier, portant son titre. Cliquez
sur un bandeau pour le déplier.

1. Ouvrez **Chantiers**.
2. En bas de la liste, cliquez sur **`Add an item`**. Un bloc vide s'ajoute.
3. Remplissez les six champs :

| Champ | Ce qu'on y met |
|---|---|
| **Titre** | le nom du chantier, affiché sur la photo — 60 signes au plus |
| **Étiquette** | le mot dans le coin de la vignette : « Charpente », « Zinguerie »… |
| **Métier** | une liste déroulante ; elle décide sur quelle page métier la photo apparaît |
| **Légende** | une à trois phrases : la contrainte du chantier, et comment elle a été résolue |
| **Description de la photo** | ce qu'on **voit** sur l'image (voir l'encadré ci-dessous) |
| **Photo** | le fichier |

4. **Faites glisser le bloc à sa place** dans la liste, par la poignée à gauche :
   l'ordre de la liste est l'ordre du site.
5. **`Save`**.

### La photo

Dans le champ **Photo**, cliquez, puis choisissez le fichier sur votre ordinateur
— ou faites-le glisser dessus.

**Téléversez la photo telle qu'elle sort de l'appareil ou du téléphone.** Ne la
réduisez pas à l'avance : une fois publiée, une tâche automatique la ramène à
2400 pixels de large et la réenregistre allégée. C'est fait pour vous.

Le nom du fichier est nettoyé à l'arrivée : les espaces, accents et parenthèses
d'un `IMG_2026-08-14 (1).jpg` disparaissent. C'est normal.

Cadrez serré sur l'ouvrage. Le format paysage est préférable, c'est celui que la
galerie met le mieux en valeur.

> **La « Description de la photo » n'est pas la légende.**
>
> Elle est lue à voix haute par les logiciels des personnes aveugles, et par
> Google. Elle décrit l'image, elle ne la commente pas.
>
> - Légende : « Reprise complète de la charpente d'une grange de 1890, sans
>   dépose de la couverture. »
> - Description : « Charpente neuve en bois clair vue depuis le faîtage, toits de
>   tuiles anciens en arrière-plan. »
>
> Recopier la légende dans les deux champs, c'est faire lire deux fois la même
> phrase à quelqu'un qui ne voit pas la photo.

### Où le chantier apparaîtra

- Sur la page **Réalisations**, dans l'ordre de la liste.
- Sur la page d'**accueil**, s'il fait partie des **trois premiers**.
- Sur la page du **métier** choisi dans la liste déroulante — et le **premier**
  chantier d'un métier est celui qui l'illustre.

Donc : pour mettre un chantier en avant, faites-le remonter dans la liste.

---

## Réordonner, modifier ou retirer un chantier

**Réordonner** — ouvrez **Chantiers**, attrapez un bandeau par sa poignée (les
six points, à gauche), glissez-le, **`Save`**. Nul besoin de déplier.

**Modifier** — cliquez sur le bandeau pour le déplier, corrigez, **`Save`**.

**Retirer** — cliquez sur l'icône de corbeille, à droite du bandeau. Une fenêtre
demande confirmation (**Remove this item?**) ; cliquez sur **`Remove`**, puis sur
**`Save`**. La photo, elle, reste dans la médiathèque : le chantier disparaît du
site, l'image reste disponible si vous voulez la remettre. Pour supprimer aussi
le fichier, passez par **Media → Photos de chantiers**.

Gardez au moins **trois chantiers** : la page d'accueil en affiche trois.

---

## Modifier le texte d'une page

Ouvrez le dossier **Textes des pages**. Il contient une entrée par page :

**Accueil** · **Nos métiers** · **Réalisations** · **Notre démarche** ·
**Contact** · **Entreprise RGE Qualibat** · **Mentions légales** ·
**Merci (après envoi du formulaire)** · **Page introuvable** ·
**Blocs répétés sur plusieurs pages**

Les deux avant-dernières sont des pages que le visiteur ne voit qu'en passant :
celle qui le remercie après l'envoi du formulaire, et celle qui s'affiche s'il
suit un lien mort. Elles sont modifiables comme les autres.

Dans chaque page, vous trouvez, dans cet ordre :

- **Titre d'onglet** et **Description** — ce que lisent l'onglet du navigateur et
  les résultats de recherche. Invisibles sur la page elle-même.
- **Surtitre** et **Titre** — l'en-tête affiché en haut de la page.
- Puis les textes de la page, dans l'ordre où ils y apparaissent.

L'entrée **Blocs répétés sur plusieurs pages** contient les textes qui reviennent
à plusieurs endroits — l'encadré « Parlons de votre projet », le renvoi vers la
page RGE. Les modifier les change partout à la fois : c'est voulu.

### Les mots entre accolades

Certains textes contiennent des mots entre accolades : `{nom}`, `{zone}`,
`{organisme}`, `{lienCnil}`…

Ce ne sont pas des fautes de frappe, mais des **emplacements**, remplis au moment
de la publication par une valeur du site ou par un lien. `{nom}` devient le nom de
l'entreprise ; `{lienCnil}` devient un lien cliquable vers la CNIL.

**Recopiez-les tels quels, accolades comprises.** Vous pouvez déplacer la phrase
autour, changer les mots voisins — mais gardez le jeton.

Si vous en supprimez un, la publication échoue avec un message qui le nomme :

> Le texte de propriété doit contenir « {nom} », remplacé à l'affichage par sa
> valeur. Le retirer publierait la phrase amputée.

Une faute de frappe dans un jeton est refusée de la même façon, en listant ceux
qui sont acceptés à cet endroit. Rien ne part en ligne amputé : remettez le
jeton, réenregistrez.

---

## Les modifications courantes

### Téléphone, e-mail, adresse

**L'entreprise → Coordonnées.** Il n'y a **qu'un seul endroit à corriger** : ces
coordonnées alimentent à la fois le pied de page, la page Contact et les mentions
légales.

Un champ laissé vide fait **disparaître** la ligne du site au lieu d'afficher un
blanc. C'est voulu : mieux vaut ne rien annoncer qu'annoncer un numéro qui ne
répond plus.

### Le texte d'un métier

**Les métiers.** Chaque métier a quatre parties :

| | |
|---|---|
| **Titre** | le nom affiché — apparaît aussi dans le menu du pied de page |
| **Phrase d'introduction** | le chapô, en gros caractères |
| **Paragraphes** | le corps du texte, un paragraphe par ligne de la liste |
| **Liste à puces** | les points clés, un par ligne |

Comme les chantiers, les métiers s'affichent repliés, un bandeau par
métier. Pour ajouter ou retirer un paragraphe ou une puce, utilisez
**`Add an item`** et l'icône de corbeille de la sous-liste concernée.

Ne touchez pas au champ **Identifiant** : c'est l'adresse web du métier, la
changer casserait les liens du menu et les résultats Google.

### L'adresse qui reçoit les messages du formulaire

Le formulaire de la page Contact est **en service**. Les messages arrivent à
l'adresse indiquée au moment où la clé a été créée, sur web3forms.com.

Pour recevoir les messages **ailleurs**, il ne suffit pas de changer l'e-mail
de contact du site : demandez une nouvelle clé gratuite sur
[web3forms.com](https://web3forms.com) en y saisissant la nouvelle adresse, puis
collez-la dans **L'entreprise → Formulaire de contact → Clé Web3Forms**.

Vider ce champ **retire le formulaire** de la page Contact, qui n'affiche alors
plus que le téléphone et l'e-mail. C'est le repli prévu si le service devait
s'interrompre : la page reste utile, et personne ne se retrouve devant un
formulaire qui n'envoie rien.

Cette clé est publique par conception : elle apparaît dans le code de la page, il
n'y a rien à cacher.

### La qualification RGE

**Qualification RGE** : organisme, numéro de certificat, lien vers l'attestation
PDF, dates de validité, domaines qualifiés.

**La date de fin est surveillée par le site.** Une fois cette date passée, et sans
que personne ait à intervenir :

- la page RGE cesse d'annoncer une qualification en cours et explique qu'elle est
  arrivée à échéance ;
- l'encadré de renvoi de la page Rénovation thermique disparaît ;
- le bandeau du pied de page — logo Qualibat et numéro de certificat — disparaît
  de tout le site ;
- la page sort des résultats de recherche.

C'est une obligation : afficher un RGE expiré est une allégation trompeuse au sens
du code de la consommation.

Une réserve importante : le site étant figé, ce retrait ne prend effet qu'à la
publication suivante. **Le jour où la qualification est renouvelée, comme le jour
où elle expire, prévenez-nous** — il faut relancer une publication pour que le
site se remette à jour.

⚠ Les **domaines qualifiés** se recopient du registre public de l'ADEME, à
l'identique. N'en ajoutez pas « parce qu'on sait le faire » : ce qui est écrit là
engage l'entreprise.

---

## Les textes qu'il ne faut pas reformuler

Vous avez accès à **tous** les textes du site, y compris les textes juridiques.
C'est un choix : il vaut mieux pouvoir corriger une virgule dans les mentions
légales que devoir nous écrire pour ça.

Mais quelques textes ne sont pas de la rédaction. Ils sont **contraints** : leur
contenu est imposé par la loi ou par les statuts, et une reformulation, meilleure
fût-elle sur le plan du style, en fait un texte faux. Dans le formulaire, ils sont
signalés par un **⚠** dans leur description.

**La mission de la société** — l'entrée *Mission de la société à mission*, et le
bloc mission de la page Démarche. Elle est reprise mot pour mot de l'article 3 des
statuts du 11 septembre 2024. Une société à mission est **engagée** par ce texte
(art. L210-10 du code de commerce) : le site doit dire ce que disent les statuts,
pas une version arrangée. Si la mission doit changer, ce sont les statuts qui
changent d'abord — le site ensuite.

**L'identité légale** — SIRET, forme juridique, capital, RCS, TVA, directeur de la
publication. Contenu imposé par l'article 6-III de la LCEN. À ne corriger qu'à
partir d'un document officiel : extrait Kbis, statuts.

**L'assurance professionnelle.** La garantie décennale est obligatoire
(art. L241-1 du code des assurances) et l'article L243-2 impose d'en afficher
l'assureur, le contrat et la couverture géographique. À reprendre de l'attestation,
sans rien arrondir.

**L'hébergeur.** Nom, adresse et téléphone, exigés par le même article 6-III. Cette
mention sert à savoir qui détient les fichiers en cas de litige : elle doit donc
désigner l'hébergeur **réel du moment**. Ne la modifiez que si l'hébergement
change — et dans ce cas prévenez-nous, c'est une bascule technique.

**Les paragraphes des mentions légales** — statut, données personnelles, droits
RGPD, cookies. Ils décrivent ce que le site fait réellement. Réécrire « le site ne
dépose aucun cookie » en quelque chose de plus vague, ou l'inverse, crée un écart
entre ce qui est annoncé et ce qui est fait.

**Les domaines RGE**, déjà évoqués plus haut.

La règle tient en une phrase : **ces textes-là se corrigent document en main,
jamais de mémoire.** Si vous n'avez pas le document sous les yeux, ne touchez pas.

---

## Ce qui n'est pas modifiable, et pourquoi

Tout le contenu du site est dans le CMS. Ce qui n'y figure pas n'est pas du
contenu :

**Les intitulés d'interface** — « Nous joindre », « Zone d'intervention »,
« Sommaire », les libellés du menu. Ils nomment un rouage de la page plutôt qu'ils
ne s'adressent au lecteur ; les changer relève de la mise en page.

**La ligne d'assurance des mentions légales.** Sa phrase est **construite** à
partir des champs Assureur, Contrat et Couverture : selon que l'adresse de
l'assureur est renseignée ou non, la phrase n'a pas la même forme. Vous en
modifiez le contenu par les champs ; sa charpente, elle, est calculée. De même, la
phrase qui indique où exercer ses droits RGPD bascule seule sur le téléphone si
l'e-mail est vide.

**Le bandeau « page à compléter »** des mentions légales. C'est un avertissement
qui nous est destiné, pas au visiteur : il n'apparaît que s'il manque une mention
obligatoire, et disparaît de lui-même une fois le trou comblé.

**L'année du copyright, en pied de page.** Elle est écrite en dur dans le code : le
site est entièrement statique, il n'a pas d'horloge. Il faut donc nous demander de
la passer à 2027 en début d'année prochaine — c'est l'affaire d'une minute.

---

## Les cinq règles à respecter

Les deux premières sont tenues par la machine : les enfreindre fait échouer la
publication. Les trois suivantes, personne ne les fera respecter à votre place.

1. **Ne supprimez pas les mots entre accolades.** `{nom}`, `{zone}`,
   `{lienCnil}` : ce sont des emplacements, pas du texte.
2. **Remplissez toujours la « Description de la photo ».** Sans elle, la
   publication est refusée — et les visiteurs aveugles sont laissés de côté.
3. **Gardez au moins trois chantiers.** Rien ne vous en empêchera, mais la page
   d'accueil en présente trois : à deux, sa rangée de réalisations est bancale.
4. **Les textes marqués ⚠ se corrigent document en main**, jamais de mémoire.
5. **Après avoir enregistré, attendez trois minutes et allez vérifier sur le
   site.** Une publication sur laquelle on ne revient pas est une publication dont
   on ne sait pas si elle a réussi.

Les accents, les majuscules et la ponctuation française ne posent aucun problème.

---

## Si une croix rouge apparaît

Elle signifie qu'une erreur a été détectée et que **la publication a été
refusée**. Le site en ligne est intact : les visiteurs ne voient rien, ils ont
toujours la version précédente. Il n'y a donc aucune urgence, et rien à réparer
dans la précipitation.

1. Sur [la page des publications](https://github.com/gagnairn/cambiome/actions),
   cliquez sur la ligne rouge, puis sur l'étape en échec. Le message d'erreur est
   en bas, en rouge. Il est en général explicite : un champ obligatoire vide, un
   jeton `{…}` supprimé, une photo introuvable.
2. Si vous voyez ce qui cloche, retournez dans le CMS, corrigez, **`Save`**. Une
   nouvelle publication part.
3. Si le message ne vous parle pas, **envoyez-nous le lien de la page en échec** :
   c'est tout ce dont nous avons besoin.

---

## Le site n'apparaît pas encore dans Google

C'est voulu. Chercher « cambiome » sur Google ne donnera rien pour l'instant, et
il n'y a là aucun problème à signaler.

L'adresse actuelle, `gagnairn.github.io/cambiome`, est une adresse de travail :
elle n'appartient pas à l'entreprise. Si Google référençait les pages sous ce
nom, elles y resteraient — et le jour de la bascule vers `www.cambiome.fr`, le
site existerait à deux adresses à la fois, sans que Google sache laquelle
proposer. Chaque page demande donc, pour le moment, à ne pas être répertoriée.

Cela ne limite rien d'autre : le site est public, il fonctionne entièrement, et
vous pouvez le consulter, le montrer et en envoyer le lien à qui vous voulez. Il
n'est simplement pas *trouvable par une recherche*.

Le référencement démarre le jour où le site passe sur `www.cambiome.fr` : c'est
la même opération, il n'y a rien à demander en plus. Comptez ensuite quelques
semaines pour que Google ait parcouru l'ensemble des pages.

---

## Ce qu'il vaut mieux nous demander

- **Ajouter, retirer ou renommer une page.**
- **Ajouter ou supprimer un métier** — ils structurent la navigation.
- **Changer l'identifiant d'un métier** : c'est son adresse web, la modifier casse
  les liens existants et les résultats Google.
- **Les couleurs, les polices, la mise en page.**
- **L'année du copyright**, une fois par an.
- **Changer d'hébergeur**, ou basculer sur le domaine `www.cambiome.fr`.
- **Le renouvellement ou l'expiration du RGE**, pour relancer une publication.
- Toute question sur un message d'erreur que vous ne comprenez pas.
- **Une modification urgente alors que le CMS est inaccessible.** Il n'y a pas
  de voie de secours à votre main : le contenu se modifie par
  https://app.pagescms.org/gagnairn/cambiome/main/file et par là seulement.
  Écrivez-nous, nous intervenons directement dans les fichiers.
