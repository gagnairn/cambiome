// Source unique de vérité pour le contenu éditorial du site.
// Les textes des métiers proviennent du brief `docs/brief/`.
//
// ⚠ À COMPLÉTER : les champs marqués TODO sont des valeurs d'attente.
// Tant qu'ils ne sont pas renseignés, le bloc correspondant est masqué à
// l'affichage (voir Footer.astro / contact.astro) plutôt que d'exposer un
// faux numéro ou une fausse adresse.

export const site = {
  nom: 'CAMBIOME',
  baseline: "Habitats d'avenir",
  accroche: 'Éco-construction, charpente et rénovation thermique',
  description:
    "CAMBIOME est une entreprise spécialisée dans l'éco-construction : charpente, ossature bois, couverture, zinguerie et rénovation thermique. Isolation bio-sourcée, étanchéité à l'air et ventilation double flux.",
  zone: 'Grenoble et son bassin',
} as const;

export const contact = {
  // TODO renseigner
  email: '' as string, // ex. 'contact@cambiome.fr'
  telephone: '' as string, // ex. '+33 4 76 00 00 00'
  adresse: '' as string, // ex. '12 rue des Charpentiers, 38000 Grenoble'
  instagram: '' as string, // ex. 'https://instagram.com/cambiome'
  siret: '' as string,
  assurance: '' as string, // décennale : assureur + n° de contrat
  /**
   * Endpoint du formulaire de contact. Le site étant statique, il faut un
   * service tiers pour recevoir les messages (Formspree, Basin, Web3Forms…).
   * Tant que ce champ est vide, le formulaire n'est pas affiché — seuls les
   * moyens de contact directs le sont.
   * ex. 'https://formspree.io/f/xxxxxxxx'
   */
  formulaireEndpoint: '' as string,
} as const;

export type Metier = {
  slug: string;
  titre: string;
  chapo: string;
  texte: string[];
  points: string[];
};

export const metiers: Metier[] = [
  {
    slug: 'charpente-ossature-bois',
    titre: 'Charpente et ossature bois',
    chapo:
      'De la reprise ponctuelle d’une ferme ancienne au bâtiment neuf complet.',
    texte: [
      "En étroite collaboration avec un bureau d'études, nous réalisons vos projets de réanimation et de modification de charpente.",
      "Que ce soit la réalisation d'extension en mur ossature bois, la fabrication de lucarnes, le changement de pièces de charpente ou la création d'un bâtiment complet, nos équipes sont formées à ce type de chantier.",
    ],
    points: [
      'Reprise et modification de charpente existante',
      'Extension en mur ossature bois',
      'Fabrication de lucarnes',
      'Bâtiment neuf complet',
      "Travail avec bureau d'études structure",
    ],
  },
  {
    slug: 'renovation-thermique',
    titre: 'Rénovation thermique',
    chapo:
      "Forte épaisseur, matériaux bio-sourcés et étanchéité à l'air maîtrisée.",
    texte: [
      "L'utilisation de matériaux bio-sourcés à faible impact environnemental, en forte épaisseur et forte densité, l'amélioration des performances des fenêtres, la bonne mise en œuvre de l'étanchéité à l'air, la mise en place de protections solaires, la ventilation des parois extérieures et l'installation d'une ventilation double flux.",
      "Autant d'aspects essentiels pour améliorer le confort du bâti existant et diminuer nos consommations d'énergie. Nous pouvons aussi vous proposer un accompagnement à l'auto-rénovation.",
    ],
    points: [
      'Isolation bio-sourcée dense — confort d’été',
      "Étanchéité à l'air du bâtiment",
      'Ventilation double flux',
      'Ventilation des parois extérieures',
      'Protections solaires et menuiseries',
      "Accompagnement à l'auto-rénovation",
    ],
  },
  {
    slug: 'couverture-zinguerie',
    titre: 'Couverture et zinguerie',
    chapo: 'La rénovation des toitures du bâti ancien, jusqu’à la finition.',
    texte: [
      "Une grande partie de l'activité de CAMBIOME consiste en la rénovation des toitures des bâtis anciens.",
      'Une attention particulière est donnée à la finition des sous-faces en lambris et aux travaux de zinguerie.',
    ],
    points: [
      'Rénovation de toiture du bâti ancien',
      'Sous-faces en lambris',
      'Zinguerie façonnée à l’atelier',
      'Habillage d’acrotères, noues et rives',
    ],
  },
  {
    slug: 'structure-bois-menuiserie',
    titre: 'Structure bois et menuiserie',
    chapo: 'Le bois local, du mobilier à la terrasse.',
    texte: [
      'Notre entreprise propose la réalisation de mobilier et de structures bois en tout genre.',
      'Nous apprécierons de relever le défi de vos envies : terrasse en bois local, escalier, cuisine, persiennes, bardage claire-voie et autres claustras.',
    ],
    points: [
      'Terrasse en bois local',
      'Escaliers',
      'Cuisine et mobilier sur mesure',
      'Persiennes',
      'Bardage claire-voie, claustras',
    ],
  },
];

export const demarche = [
  {
    titre: 'Isolation bio-sourcée et dense',
    texte:
      "Des matériaux à faible impact environnemental, posés en forte épaisseur et forte densité. C'est le déphasage qu'ils apportent qui fait le confort d'été, pas seulement la résistance thermique affichée.",
  },
  {
    titre: "Étanchéité à l'air maîtrisée",
    texte:
      "Une isolation ne vaut que par sa mise en œuvre. Nous soignons la continuité de la barrière à l'air, point par point, pour que la performance calculée soit la performance réelle.",
  },
  {
    titre: 'Ventilation double flux',
    texte:
      "Un bâtiment étanche doit être ventilé. La double flux renouvelle l'air en récupérant la chaleur, sans la sensation de courant d'air froid.",
  },
  {
    titre: "Ventilation des parois de l'enveloppe",
    texte:
      "Les parois doivent pouvoir sécher. Nous ventilons l'enveloppe du bâtiment pour évacuer l'humidité et garantir la durabilité de l'ouvrage dans le temps.",
  },
];
