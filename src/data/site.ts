// Source unique de vérité pour le contenu éditorial du site.
// Les textes des métiers proviennent du brief remis par CAMBIOME, qui n'est
// plus versionné ici (voir la section « Sources » du README).
//
// ⚠ À COMPLÉTER : les champs marqués TODO sont des valeurs d'attente.
// Tant qu'ils ne sont pas renseignés, le bloc correspondant est masqué à
// l'affichage (voir PiedDePage.astro / contact.astro) plutôt que d'exposer un
// faux numéro ou une fausse adresse.

export const site = {
  nom: 'CAMBIOME',
  baseline: "Habitats d'avenir",
  // Ces deux chaînes composent le titre et la description de l'accueil : le
  // titre est `nom — accroche`, et il doit tenir sous 60 signes pour ne pas se
  // tronquer dans un résultat de recherche ; la description sous 160. Les
  // longueurs sont contrôlées au build par scripts/verifier-metadonnees.mjs.
  accroche: 'Charpente et rénovation en éco-construction',
  description:
    "Charpente, ossature bois, couverture, zinguerie et rénovation thermique à Grenoble. Éco-construction : isolation bio-sourcée et étanchéité à l'air.",
  zone: 'Grenoble et son bassin',
} as const;

export const contact = {
  // TODO renseigner
  email: 'contact@cambiome.fr',
  telephone: '06 27 80 42 38',
  adresse: '36 avenue Jean Jaurès, 38600 Fontaine',
  instagram: 'https://instagram.com/cambiome_charpente',
  siret: '933 226 086 00017',
  // Forme juridique et capital : obligatoires pour une société (art. 6-III
  // LCEN). Le capital est celui inscrit aux statuts.
  // Les statuts (art. 1er) retiennent « société par actions simplifiée », et
  // l'art. 2 impose de faire figurer cette mention et le capital sur les
  // documents destinés aux tiers — ce site en est un. « SASU » qu'affiche le
  // RNE décrit le même objet : une SAS à associé unique. On suit les statuts.
  formeJuridique: 'SAS',
  formeJuridiqueLongue: 'société par actions simplifiée à associé unique',
  capital: '6 000 €',
  // Immatriculée au greffe de Grenoble le 20/09/2024.
  rcs: '933 226 086 R.C.S. Grenoble',
  // Numéro de TVA intracommunautaire : FR + clé de contrôle + SIREN.
  tva: 'FR56933226086',
  // Le directeur de la publication est le représentant légal — pour une SASU,
  // le président.
  directeurPublication: 'Nicolas Hans',
  /**
   * Assurance professionnelle. Un seul contrat couvre les deux garanties : la
   * responsabilité civile d'exploitation et la garantie décennale, cette
   * dernière obligatoire au titre de l'art. L241-1 du code des assurances.
   *
   * L'art. L243-2 impose d'en mentionner les coordonnées — assureur, contrat,
   * couverture géographique. `adresse` complète ces coordonnées ; tant qu'elle
   * est vide la page n'affiche que le nom, ce qui reste exact.
   */
  assurance: {
    souscrite: true,
    assureur: 'BPCE IARD',
    contrat: '138297629 Q - MCE - 001',
    // Siège social. À ne pas confondre avec l'adresse de résiliation du
    // contrat (BP 8410, 79024 Niort Cedex 9) : celle-ci sert à écrire à
    // l'assureur, elle n'a rien à faire dans des mentions légales.
    adresse: 'Route de Chaban, 79180 Chauray' as string,
    couverture: 'France',
  },
  /**
   * Clé d'accès Web3Forms (https://web3forms.com) : le site est statique, il
   * faut un service tiers pour recevoir les messages et les réexpédier par
   * email. On obtient la clé en saisissant l'adresse de réception sur
   * web3forms.com, puis en validant le mail de confirmation — pas de compte à
   * créer. Cette clé est publique par conception : elle a vocation à figurer
   * dans le HTML, il n'y a rien à cacher ici.
   *
   * Tant que ce champ est vide, le formulaire n'est pas affiché — seuls les
   * moyens de contact directs le sont.
   * ex. '0a1b2c3d-4e5f-6789-abcd-ef0123456789'
   */
  web3formsCle: '' as string,
} as const;

/**
 * Qualification RGE « Reconnu Garant de l'Environnement ».
 *
 * C'est elle qui ouvre à vos clients MaPrimeRénov' et les CEE : sans RGE, pas
 * d'aide, quelle que soit la qualité du chantier. Les valeurs ci-dessous sont
 * celles du registre public de l'ADEME (jeu de données « liste des entreprises
 * RGE » sur data.ademe.fr), pas une déclaration interne.
 *
 * ⚠ La qualification expire. Passée `fin`, l'afficher serait trompeur : les
 * composants la masquent alors d'eux-mêmes (voir `rgeEnCours` ci-dessous).
 * Comme le site est statique, ce retrait ne prend effet qu'au build suivant :
 * sans push après cette date, la mention resterait en ligne.
 */
export const rge = {
  organisme: 'Qualibat',
  certificat: 'QUALIBAT-RGE n° 207847',
  attestation:
    'https://www.qualibat.com/Views/GetFichier.aspx?fn=2025%5CD38-Certificat-207847-E207847-1-20251003-RGEAnnexe.pdf',
  debut: '2024-12-10',
  fin: '2026-12-09',
  domaines: [
    "Isolation par l'intérieur des murs, rampants de toitures ou plafonds",
    "Isolation des murs par l'extérieur",
    "Isolation des toitures terrasses ou des toitures par l'extérieur",
    'Fenêtres de toit',
  ],
} as const;

/** Évalué au build : le site est statique, la date est celle de la génération. */
export const rgeEnCours = new Date().toISOString().slice(0, 10) <= rge.fin;

/**
 * Société à mission (art. L210-10 du code de commerce) : statut déclaré au
 * RNE, vérifiable sur annuaire-entreprises.data.gouv.fr. Ce n'est pas un label
 * marketing — il engage la société sur des objectifs inscrits aux statuts.
 */
export const societeAMission = {
  // Tout ce qui suit est repris mot pour mot de l'article 3 des statuts
  // constitutifs du 11 septembre 2024. Ne pas reformuler : la mission d'une
  // société à mission est opposable, le site doit dire ce que disent les
  // statuts, pas une version arrangée.
  promeut: [
    "le respect de la planète et de ses territoires en privilégiant les circuits courts ainsi que les matériaux et services locaux et respectueux de l'environnement",
    "le respect des objectifs de développement durable de l'ONU, et le cas échéant, d'objectifs plus ambitieux lorsque cela est pertinent et réaliste",
    "les solutions techniques, scientifiques et d'ingénierie aux personnes morales, dans le respect du climat, de la biodiversité et de la société",
  ],
  objectifs: [
    {
      titre: 'Objectifs environnementaux',
      items: [
        "minimiser l'impact environnemental direct et indirect de l'entreprise",
        "proposer des solutions de constructions engagées pour remplacer les matériaux issus de l'industrie pétrolière",
        "proposer des solutions pour le neuf et la rénovation qui soient écologiquement viables et engagées pour faire face au dérèglement climatique, au respect de la biodiversité, et permettre de lutter contre les futures hausses tarifaires du prix de l'énergie",
        'mettre en œuvre des matériaux locaux et simples qui favorisent leur recyclage',
      ],
    },
    {
      titre: 'Objectifs sociaux',
      items: [
        "respecter l'équilibre temps professionnel/temps personnel",
        'favoriser la semaine de 4 jours pour les salariés',
        'favoriser la production locale',
        'favoriser la qualité de vie au travail',
      ],
    },
    {
      titre: 'Objectifs globaux',
      items: [
        "favoriser les fournisseurs et plus généralement les autres parties prenantes en accord avec les objectifs de l'entreprise",
        "prendre en considération l'ensemble des objectifs du développement durable de l'ONU",
        'engagement collectif autour de la mission',
        'engagement sur un temps long de rendement',
        'travailler avec des employés engagés',
        'travailler avec bienveillance en interne comme en externe',
        'apporter la meilleure prestation aux clients dans le respect des DTU, Eurocodes et avis techniques',
      ],
    },
  ],
} as const;

/**
 * Hébergeur du site — nom, adresse et téléphone sont exigés par l'art. 6-III
 * de la LCEN, et la mention doit désigner l'hébergeur *réel du moment* : elle
 * sert à savoir qui détient les fichiers en cas de litige.
 *
 * ⚠ Ces valeurs sont celles d'OVH, l'hébergement cible. Tant que la bascule
 * n'est pas faite, les pages sont servies par GitHub Pages et la mention
 * anticipe donc la réalité. Pour revenir à l'état exact :
 *
 *   nom: 'GitHub, Inc.',
 *   adresse: '88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis',
 *   telephone: '+1 877 448 4820',
 */
export const hebergeur = {
  nom: 'OVH SAS',
  adresse: '2 rue Kellermann, 59100 Roubaix, France',
  telephone: '1007',
} as const;

/**
 * Pistes chromatiques soumises au client. Dispositif TEMPORAIRE : le temps du
 * choix, un sélecteur flottant permet de voir le vrai site dans les trois
 * teintes plutôt que de les décrire sur un nuancier.
 *
 * `selecteur: false` suffit à tout éteindre — le site retombe sur l'ardoise,
 * sans sélecteur ni script. Une fois la direction arrêtée, voir la section
 * « Thèmes » du README pour le nettoyage définitif.
 *
 * Aucune couleur ici : les rampes ET la pastille de chaque piste sont dans
 * src/styles/themes.css, seul endroit où la charte alternative est écrite. Un
 * `style=` en ligne serait de toute façon bloqué par la CSP du site.
 *
 * Le thème par défaut a un `id` vide : c'est le `@theme` de global.css, sans
 * attribut sur <html>. Ajouter une piste = une entrée ici, une rampe et une
 * pastille dans themes.css.
 */
export const themes = {
  selecteur: true,
  liste: [
    { id: '', nom: 'Ardoise' },
    { id: 'terracotta', nom: 'Terracotta' },
    { id: 'ciel', nom: 'Ciel' },
  ],
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
