/**
 * Façade de la prose des pages.
 *
 * Pendant du module `site.ts`, pour l'autre moitié du contenu : `site.ts` porte
 * les données de l'entreprise — nom, coordonnées, métiers, chantiers — et ce
 * module porte les phrases écrites des pages, un fichier par page dans
 * `src/content/pages/`. Un fichier par page, et non un gros fichier unique :
 * dans le CMS, chaque page devient une entrée du menu avec son formulaire
 * court, plutôt qu'un seul formulaire de soixante champs où l'on cherche
 * l'accroche de l'accueil entre les mentions légales et la page 404.
 *
 * Ce qui reste écrit dans les `.astro` et n'est pas ici :
 *
 *   — les intitulés d'interface qui nomment un rouage plutôt qu'ils ne
 *     s'adressent au lecteur : « Nous joindre », « Téléphone », « SIRET : » ;
 *   — les phrases dont la structure même est calculée — la ligne d'assurance
 *     des mentions légales, qui n'affiche l'adresse de l'assureur que si elle
 *     est renseignée. En faire un texte à trous rendrait le formulaire
 *     illisible pour un gain nul ;
 *   — les avertissements destinés à nous, pas au visiteur : le bandeau « page à
 *     compléter » des mentions légales.
 *
 * Deux conventions, expliquées dans `~/lib/gabarit` : `{nom}` et consorts sont
 * remplacés par les valeurs de `site.ts`, et `{lienCnil}` marque l'endroit d'un
 * lien dans une phrase.
 */
import { z } from 'astro/zod';
import { charger } from '~/lib/contenu';
import { remplir, scinder } from '~/lib/gabarit';
import { rge, site } from '~/data/site';

/** Chaîne non vide, avec un message en français plutôt que « Required ». */
const texte = (quoi: string) =>
  z.string().trim().min(1, `${quoi} ne peut pas être vide.`);

/**
 * Exige d'un texte qu'il porte les jetons annoncés.
 *
 * `remplir` refuse un jeton mal orthographié, mais un jeton *supprimé* ne lui
 * apparaît pas : il ne voit que ce qui reste. La phrase se rendrait alors sans
 * sa valeur — « L'ensemble du site est la propriété de . » — et partirait en
 * ligne sans que rien ne proteste. C'est le seul endroit où l'absence se
 * constate : ici, on sait ce que la phrase doit porter ; à la substitution, non.
 *
 * Le contrôle porte sur le texte entier, avant tout découpage : un jeton reste
 * valable où que l'éditeur le déplace dans la phrase.
 */
const avecJetons = (schema: z.ZodType<string>, quoi: string, ...noms: string[]) =>
  schema.superRefine((valeur, ctx) => {
    for (const nom of noms)
      if (!valeur.includes(`{${nom}}`))
        ctx.addIssue({
          code: 'custom',
          message:
            `${quoi} doit contenir « {${nom}} », remplacé à l'affichage par sa valeur. ` +
            'Le retirer publierait la phrase amputée.',
        });
  });

/**
 * Le résumé affiché sous le lien dans les résultats de recherche. La limite est
 * haute exprès : `scripts/verifier-metadonnees.mjs` signale déjà le dépassement
 * des 160 signes utiles sur le site construit. Ce plafond-ci n'arrête que le
 * paragraphe entier collé par mégarde dans le champ.
 */
const description = texte('La description')
  .max(320, 'La description de la page dépasse 320 signes ; les moteurs la couperont.');

/** L'en-tête commun à toutes les pages hors accueil. */
const enTete = {
  titreOnglet: texte("Le titre d'onglet"),
  description,
  surtitre: texte('Le surtitre'),
  titre: texte('Le titre'),
};

const paragraphes = z
  .array(texte('Un paragraphe'))
  .min(1, 'Il faut au moins un paragraphe.');

const commun = charger(
  'pages/commun',
  z.object({
    appelContact: z.object({
      titre: texte('Le titre'),
      texte: texte('Le texte'),
      bouton: texte('Le libellé du bouton'),
    }),
    renvoiRge: z.object({
      surtitre: avecJetons(texte('Le surtitre'), 'Le surtitre', 'organisme'),
      texte: texte('Le texte'),
      lien: texte('Le libellé du lien'),
    }),
  }),
);

export const appelContact = commun.appelContact;

export const renvoiRge = {
  ...commun.renvoiRge,
  surtitre: remplir(commun.renvoiRge.surtitre, { organisme: rge.organisme }),
};

export const accueil = charger(
  'pages/accueil',
  z.object({
    // Pas de titre d'onglet ni de description ici : l'accueil porte le titre du
    // site lui-même et la description générale, tous deux dans `entreprise.yaml`.
    hero: z.object({
      titre: texte('Le titre du hero'),
      texte: texte('Le texte du hero'),
      boutonMetiers: texte('Le libellé du bouton'),
      boutonContact: texte('Le libellé du bouton'),
    }),
    metiers: z.object({
      surtitre: texte('Le surtitre'),
      titre: texte('Le titre'),
      texte: texte('Le texte'),
    }),
    demarche: z.object({
      surtitre: texte('Le surtitre'),
      titre: texte('Le titre'),
      texte: texte('Le texte'),
      bouton: texte('Le libellé du bouton'),
    }),
    realisations: z.object({
      surtitre: texte('Le surtitre'),
      titre: texte('Le titre'),
      bouton: texte('Le libellé du bouton'),
    }),
  }),
);

export const pageMetiers = charger(
  'pages/metiers',
  z.object({
    ...enTete,
    texte: texte('Le texte'),
    // Nomme le sommaire pour les lecteurs d'écran, qui annoncent les repères de
    // navigation par leur nom ; il n'apparaît pas à l'écran.
    sommaire: texte('Le nom du sommaire'),
  }),
);

export const pageRealisations = charger(
  'pages/realisations',
  z.object({ ...enTete, texte: texte('Le texte') }),
);

export const pageDemarche = charger(
  'pages/demarche',
  z.object({
    ...enTete,
    texte: texte('Le texte'),
    collaboration: z.object({
      surtitre: texte('Le surtitre'),
      titre: texte('Le titre'),
      texte: paragraphes,
    }),
  }),
);

const pageContactBrute = charger(
  'pages/contact',
  z.object({
    ...enTete,
    description: avecJetons(description, 'La description', 'zone'),
    texte: texte('Le texte'),
  }),
);

export const pageContact = {
  ...pageContactBrute,
  description: remplir(pageContactBrute.description, { zone: site.zone }),
};

export const pageMerci = charger(
  'pages/merci',
  z.object({
    ...enTete,
    texte: texte('Le texte'),
    urgence: texte('La phrase sur le téléphone'),
    bouton: texte('Le libellé du bouton'),
  }),
);

export const page404 = charger(
  'pages/404',
  z.object({
    ...enTete,
    texte: texte('Le texte'),
    boutonAccueil: texte('Le libellé du bouton'),
    boutonRealisations: texte('Le libellé du bouton'),
  }),
);

/** « 09/12/2026 », pour une énumération de mentions légales. */
const enChiffres = (iso: string) => iso.split('-').reverse().join('/');

const pageRgeBrute = charger(
  'pages/rge-qualibat',
  z.object({
    ...enTete,
    description: avecJetons(description, 'La description', 'nom'),
    intro: avecJetons(
      texte("Le texte d'introduction"),
      "Le texte d'introduction",
      'nom',
      'organisme',
    ),
    titreAides: texte('Le titre'),
    aides: z
      .array(
        z.object({
          titre: texte("Le titre de l'aide"),
          // Aucun montant n'est donné nulle part : les barèmes changent d'une
          // année sur l'autre, et une page statique qui les affiche devient
          // fausse sans prévenir. Le schéma ne sait pas l'imposer ; la
          // description du champ dans le CMS le rappelle.
          texte: texte("Le texte de l'aide"),
        }),
      )
      .min(1, 'Il faut au moins une aide.'),
    noteAides: texte('La note'),
    titreDomaines: texte('Le titre'),
    noteDomaines: texte('La note'),
    titreAttestation: texte('Le titre'),
    libelleLienAttestation: texte('Le libellé du lien'),
    texteAttestation: avecJetons(
      texte('Le texte'),
      "Le texte de l'attestation",
      'lienAttestation',
    ),
  }),
);

export const pageRge = {
  ...pageRgeBrute,
  description: remplir(pageRgeBrute.description, { nom: site.nom }),
  intro: remplir(pageRgeBrute.intro, {
    nom: site.nom,
    organisme: rge.organisme,
  }),
  /** De part et d'autre du lien vers l'attestation PDF. */
  texteAttestation: scinder(pageRgeBrute.texteAttestation, 'lienAttestation'),
};

const pageMentionsBrute = charger(
  'pages/mentions-legales',
  z.object({
    ...enTete,
    description: avecJetons(description, 'La description', 'nom'),
    titreEditeur: texte('Le titre'),
    titreQualification: texte('Le titre'),
    qualification: avecJetons(
      texte('Le texte'),
      'Le texte de la qualification',
      'certificat',
      'organisme',
      'date',
      'domaines',
    ),
    titreAssurance: texte('Le titre'),
    titreHebergement: texte('Le titre'),
    titrePropriete: texte('Le titre'),
    propriete: avecJetons(texte('Le texte'), 'Le texte de propriété', 'nom'),
    titreDonnees: texte('Le titre'),
    donnees: texte('Le texte'),
    droits: avecJetons(texte('Le texte'), 'Le texte sur les droits', 'contact', 'lienCnil'),
    libelleLienCnil: texte('Le libellé du lien'),
    web3forms: texte('Le texte'),
    titreCookies: texte('Le titre'),
    cookies: texte('Le texte'),
  }),
);

export const pageMentions = {
  ...pageMentionsBrute,
  description: remplir(pageMentionsBrute.description, { nom: site.nom }),
  qualification: remplir(pageMentionsBrute.qualification, {
    certificat: rge.certificat,
    organisme: rge.organisme,
    date: enChiffres(rge.fin),
    domaines: rge.domaines.join(', '),
  }),
  propriete: remplir(pageMentionsBrute.propriete, { nom: site.nom }),
  /**
   * De part et d'autre du lien vers la CNIL. Le jeton `{contact}` qui subsiste
   * dans la première moitié est rempli par la page : sa valeur dépend de ce qui
   * est renseigné — l'adresse e-mail, ou le téléphone à défaut.
   */
  droits: scinder(pageMentionsBrute.droits, 'lienCnil'),
};
