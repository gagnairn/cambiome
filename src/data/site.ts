/**
 * Façade des contenus éditoriaux du site.
 *
 * Le contenu lui-même est dans `src/content/*.yaml`, pour qu'il soit
 * modifiable depuis un formulaire (Pages CMS) sans écrire de code. Ce module
 * le lit, le valide, et l'expose aux pages sous la forme qu'elles attendent —
 * `site`, `contact`, `rge`… Les pages n'ont pas à savoir d'où vient le texte.
 *
 * Les schémas ci-dessous ne décrivent pas seulement des types : ils portent
 * les règles que la saisie ne doit pas enfreindre. Une adresse e-mail mal
 * formée, une date écrite à l'envers, un domaine RGE effacé — chacune de ces
 * erreurs fait échouer le build, donc la publication, et le site en ligne ne
 * bouge pas. C'est ce qui rend le CMS sûr à confier.
 *
 * ⚠ Ne pas déplacer ici du texte de page : la prose des pages est dans
 * `src/content/pages/`, un fichier par page, lue par `src/data/pages.ts`.
 */
import { z } from 'astro/zod';
import { charger } from '~/lib/contenu';
import { estEnCours } from '~/lib/echeance';
import { CODES_PLAGES } from '~/lib/horaires';

/** Chaîne non vide, avec un message en français plutôt que « Required ». */
const texte = (quoi: string) =>
  z.string().trim().min(1, `${quoi} ne peut pas être vide.`);

/** Date ISO `AAAA-MM-JJ`, la forme comparable telle quelle. */
const dateIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date doit être écrite AAAA-MM-JJ.');

/**
 * Heure `HH:MM` sur 24 heures. C'est la forme qu'attend schema.org, et la
 * seule qu'on puisse comparer ; l'écriture française (« 8 h ») est produite à
 * l'affichage par `heureFrancaise`. Le motif refuse `8:00` et `25:00` : une
 * heure mal formée passerait sans bruit dans le balisage, où elle invalide la
 * plage entière au lieu de sauter aux yeux sur la page.
 */
const heure = (quoi: string) =>
  z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, `${quoi} doit être écrite HH:MM, par exemple 08:30.`);

const SchemaEntreprise = z.object({
  identite: z.object({
    nom: texte('Le nom'),
    baseline: texte('La baseline'),
    accroche: texte("L'accroche"),
    // Reprise telle quelle dans la balise <meta name="description">, que les
    // moteurs tronquent au-delà d'environ 160 signes. La limite est haute :
    // elle interdit le paragraphe entier collé par erreur, pas une phrase un
    // peu longue.
    description: texte('La description').max(
      320,
      'La description du site dépasse 320 signes ; les moteurs de recherche la couperont.',
    ),
    zone: texte("La zone d'intervention"),
  }),
  /**
   * Un champ de contact laissé vide fait disparaître la ligne du site au lieu
   * d'afficher un blanc — mieux vaut ne rien annoncer qu'un numéro qui ne
   * répond plus. D'où `.default('')` plutôt qu'une chaîne obligatoire : le
   * vide est une valeur de saisie légitime, pas une erreur.
   *
   * ⚠ `adresse` est le SIÈGE SOCIAL, celui immatriculé au RCS. C'est une
   * donnée juridique, pas un choix de rédaction : les mentions légales
   * doivent le publier, et lui seul. Il n'a pas à être l'endroit où l'on
   * travaille, ni celui où l'on reçoit — voir le bloc `atelier`, qui porte
   * l'établissement réel.
   *
   * Les deux paraissent côte à côte sur la page Contact, nommés par leur
   * usage : « Atelier » pour venir, « Courrier » pour écrire. C'est bien au
   * siège qu'aboutit un recommandé, la société y étant domiciliée.
   */
  coordonnees: z.object({
    email: z
      .union([z.literal(''), z.email("L'adresse e-mail est invalide.")])
      .default(''),
    telephone: z.string().default(''),
    adresse: z.string().default(''),
    instagram: z
      .union([z.literal(''), z.url('Le lien Instagram est invalide.')])
      .default(''),
  }),
  /**
   * L'atelier : l'établissement réel, celui qui a une porte, par opposition au
   * siège social ci-dessus. C'est l'adresse qu'un visiteur cherche, celle qui
   * s'affiche au pied de page et sur la page Contact, et celle que le balisage
   * structuré déclare aux moteurs.
   *
   * Le bloc entier est facultatif : tant que `adresse` y est vide, le siège
   * reprend les deux rôles — c'était l'état du site avant qu'un atelier
   * existe. Le remplir ne retire rien au siège, qui reste publié aux mentions
   * légales, où la loi l'attend.
   *
   * `latitude` / `longitude` situent la porte au mètre près et lèvent
   * l'ambiguïté quand une voie porte le même nom dans deux communes voisines.
   * Elles ne se devinent pas : les valeurs du fichier viennent de la Base
   * Adresse Nationale (api-adresse.data.gouv.fr), qui a confirmé le numéro en
   * `housenumber`, c'est-à-dire une adresse existante et non interpolée. Zéro
   * est traité comme absent : c'est la valeur qu'on obtient d'une saisie vide,
   * et elle désigne un point au large du golfe de Guinée.
   *
   * `horaires` commande à lui seul le type déclaré dans le balisage — voir
   * DonneesStructurees.astro. Le laisser vide n'est pas un oubli : c'est ce
   * qui empêche le site d'annoncer « venez ici » sans dire quand.
   */
  atelier: z
    .object({
      adresse: z.string().default(''),
      latitude: z.number().default(0),
      longitude: z.number().default(0),
      horaires: z
        .array(
          z.object({
            jours: z.enum(CODES_PLAGES),
            ouverture: heure("L'heure d'ouverture"),
            fermeture: heure('L’heure de fermeture'),
          }),
        )
        .default([]),
    })
    .default({ adresse: '', latitude: 0, longitude: 0, horaires: [] }),
  formulaire: z.object({
    /**
     * Clé d'accès Web3Forms (https://web3forms.com) : le site est statique, il
     * faut un service tiers pour recevoir les messages et les réexpédier par
     * e-mail. On obtient la clé en saisissant l'adresse de réception sur
     * web3forms.com, puis en validant le mail de confirmation — pas de compte
     * à créer. Cette clé est publique par conception : elle a vocation à
     * figurer dans le HTML, il n'y a rien à cacher ici.
     *
     * Tant que ce champ est vide, le formulaire n'est pas affiché — seuls les
     * moyens de contact directs le sont.
     */
    web3formsCle: z.string().default(''),
  }),
  /**
   * Mentions imposées par l'art. 6-III de la LCEN pour une société : forme
   * juridique, capital, immatriculation, et le directeur de la publication —
   * pour une SASU, le président.
   *
   * Les statuts (art. 1er) retiennent « société par actions simplifiée », et
   * l'art. 2 impose de faire figurer cette mention et le capital sur les
   * documents destinés aux tiers ; ce site en est un. Le « SASU » qu'affiche
   * le RNE décrit le même objet : une SAS à associé unique. On suit les
   * statuts.
   *
   * Aucun de ces champs n'est facultatif : les vider, ce n'est pas alléger la
   * page, c'est se mettre en infraction. Le schéma refuse donc le vide.
   */
  identiteLegale: z.object({
    siret: texte('Le SIRET'),
    formeJuridique: texte('La forme juridique'),
    formeJuridiqueLongue: texte('La forme juridique en toutes lettres'),
    capital: texte('Le capital social'),
    rcs: texte("L'immatriculation au RCS"),
    tva: texte('Le numéro de TVA'),
    directeurPublication: texte('Le directeur de la publication'),
  }),
  /**
   * Assurance professionnelle. Un seul contrat couvre les deux garanties : la
   * responsabilité civile d'exploitation et la garantie décennale, cette
   * dernière obligatoire au titre de l'art. L241-1 du code des assurances.
   *
   * L'art. L243-2 impose d'en mentionner les coordonnées — assureur, contrat,
   * couverture géographique. `adresse` complète ces coordonnées ; tant qu'elle
   * est vide la page n'affiche que le nom, ce qui reste exact. Elle est donc
   * le seul champ facultatif du bloc.
   */
  assurance: z.object({
    souscrite: z.boolean(),
    assureur: texte("Le nom de l'assureur"),
    contrat: texte('Le numéro de contrat'),
    adresse: z.string().default(''),
    couverture: texte('La couverture géographique'),
  }),
  /**
   * Hébergeur du site — nom, adresse et téléphone sont exigés par l'art. 6-III
   * de la LCEN, et la mention doit désigner l'hébergeur *réel du moment* :
   * elle sert à savoir qui détient les fichiers en cas de litige.
   *
   * Les valeurs du fichier sont celles d'OVH SAS, et elles sont exactes depuis
   * la bascule du 2 septembre 2026. Elles ont anticipé la réalité pendant
   * deux semaines et demie, le temps que l'hébergement soit prêt ; ce n'est
   * plus le cas, et il n'y a rien à corriger ici.
   *
   * Changer d'hébergeur oblige à changer ces trois valeurs le jour même : la
   * mention doit désigner qui détient les fichiers, pas qui les détenait.
   */
  hebergeur: z.object({
    nom: texte("Le nom de l'hébergeur"),
    adresse: texte("L'adresse de l'hébergeur"),
    telephone: texte("Le téléphone de l'hébergeur"),
  }),
});

/**
 * Qualification RGE « Reconnu Garant de l'Environnement ».
 *
 * C'est elle qui ouvre à vos clients MaPrimeRénov' et les CEE : sans RGE, pas
 * d'aide, quelle que soit la qualité du chantier. Les valeurs du fichier sont
 * celles du registre public de l'ADEME (jeu de données « liste des entreprises
 * RGE » sur data.ademe.fr), pas une déclaration interne.
 *
 * ⚠ La qualification expire. Passée `fin`, l'afficher serait trompeur : les
 * composants la masquent alors d'eux-mêmes (voir `rgeEnCours` plus bas).
 * Comme le site est statique, ce retrait ne prend effet qu'au build suivant :
 * sans publication après cette date, la mention resterait en ligne.
 */
const SchemaRge = z
  .object({
    organisme: texte("L'organisme"),
    certificat: texte('Le numéro de certificat'),
    attestation: z.url("Le lien vers l'attestation est invalide."),
    debut: dateIso,
    fin: dateIso,
    // Annoncer un domaine non couvert est une allégation trompeuse au sens du
    // code de la consommation ; en annoncer zéro viderait la page de son
    // objet. Au moins un, donc, et pas de liste fantôme.
    domaines: z
      .array(texte('Un domaine qualifié'))
      .min(1, 'Il faut au moins un domaine qualifié.'),
  })
  // Le contrôle de cohérence ne s'exécute que si les deux dates ont la bonne
  // forme : sinon une date mal écrite déclencherait deux reproches d'un coup,
  // dont un incompréhensible.
  .refine((r) => !dateIso.safeParse(r.debut).success || !dateIso.safeParse(r.fin).success || r.debut <= r.fin, {
    message: 'La date de fin de la qualification précède sa date de début.',
    path: ['fin'],
  });

/**
 * Comme les chantiers, les métiers et les piliers vivent sous une clé de
 * premier niveau plutôt qu'à la racine du fichier : voir l'explication dans
 * `src/data/realisations.ts`. Résumé : sans cette clé, le CMS n'affiche pas de
 * résumé repliable sur les éléments de liste.
 */
const SchemaMetiers = z
  .array(
    z.object({
      /**
       * Sert d'ancre dans l'URL (`/metiers#charpente-ossature-bois`) et de
       * clé de rapprochement avec `metierSlug` des réalisations. Le modifier
       * casse les liens du pied de page et détache les photos du métier :
       * d'où la contrainte de forme, qui bloque au moins les espaces et les
       * accents.
       */
      slug: z
        .string()
        .regex(
          /^[a-z0-9]+(-[a-z0-9]+)*$/,
          "L'identifiant du métier ne peut contenir que des minuscules sans accent, des chiffres et des tirets.",
        ),
      // La carte de la page d'accueil et le sommaire du pied de page sont
      // dimensionnés pour un intitulé court ; au-delà, le titre passe sur
      // trois lignes et désaligne la grille.
      titre: texte('Le titre du métier').max(
        48,
        'Le titre du métier dépasse 48 signes ; il déborderait des cartes de la page d’accueil.',
      ),
      chapo: texte('Le chapô').max(
        160,
        'Le chapô dépasse 160 signes ; il est affiché en gros caractères et déborderait.',
      ),
      texte: z
        .array(texte('Un paragraphe'))
        .min(1, 'Un métier doit avoir au moins un paragraphe.'),
      points: z.array(texte('Un point')),
    }),
  )
  .min(1, 'Il faut au moins un métier.')
  // Deux métiers de même slug produiraient deux ancres identiques, et la page
  // Métiers illustrerait le second avec les photos du premier.
  .refine((m) => new Set(m.map((x) => x.slug)).size === m.length, {
    message: 'Deux métiers portent le même identifiant.',
  });

const SchemaDemarche = z
  .array(
    z.object({
      titre: texte('Le titre du pilier'),
      texte: texte('Le texte du pilier'),
    }),
  )
  .min(1, 'Il faut au moins un pilier de démarche.');

const entreprise = charger('entreprise', SchemaEntreprise);

export const site = entreprise.identite;

/**
 * Coordonnées et identité légale réunies : les pages qui les affichent — pied
 * de page, page Contact, mentions légales — les prennent dans le même geste.
 */
export const contact = {
  ...entreprise.coordonnees,
  ...entreprise.identiteLegale,
  assurance: entreprise.assurance,
  web3formsCle: entreprise.formulaire.web3formsCle,
  /**
   * L'adresse à MONTRER : l'atelier s'il existe, le siège sinon. Dérivée ici
   * et pas recopiée dans chaque page, pour que le pied de page, la page
   * Contact et le balisage structuré ne puissent pas diverger — trois
   * adresses différentes pour une même entreprise, c'est exactement ce qui
   * fait échouer le rapprochement avec une fiche Google.
   *
   * Les mentions légales, elles, ne passent pas par ici : elles lisent
   * `adresse` directement, parce qu'elles doivent publier le siège même
   * lorsqu'un atelier le masque partout ailleurs.
   */
  adresseVisible: entreprise.atelier.adresse || entreprise.coordonnees.adresse,
  /** Vrai quand l'adresse affichée est l'atelier, qui se nomme autrement. */
  adresseEstAtelier: Boolean(entreprise.atelier.adresse),
};

/**
 * L'atelier, augmenté des deux questions que lui posent les pages et le
 * balisage : sait-on où il est, et sait-on quand il ouvre ?
 *
 * `accueille` est le drapeau qui commande le type déclaré dans le balisage
 * structuré. Il est dérivé et non saisi : cocher « nous recevons » puis
 * oublier de remplir les horaires produirait exactement la fiche qu'on veut
 * éviter — une invitation à venir, sans dire quand. Les horaires étant seuls
 * juges, il n'y a pas d'état incohérent possible.
 */
export const atelier = {
  ...entreprise.atelier,
  situe: entreprise.atelier.latitude !== 0 && entreprise.atelier.longitude !== 0,
  accueille: entreprise.atelier.horaires.length > 0,
};

export const hebergeur = entreprise.hebergeur;

export const rge = charger('rge', SchemaRge);

/**
 * La même règle sert au filtre du sitemap, dans astro.config.mjs, qui ne peut
 * pas importer ce module : voir src/lib/echeance.ts.
 */
export const rgeEnCours = estEnCours(rge.fin);

export type Metier = {
  slug: string;
  titre: string;
  chapo: string;
  texte: string[];
  points: string[];
};

export const metiers: Metier[] = charger(
  'metiers',
  z.object({ metiers: SchemaMetiers }),
).metiers;

export const demarche = charger('demarche', z.object({ piliers: SchemaDemarche })).piliers;
