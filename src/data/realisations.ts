import type { ImageMetadata } from 'astro';

import aretier from '~/assets/realisations/charpente-aretier.jpg';
import poutreI from '~/assets/realisations/charpente-poutre-en-i.jpg';
import fibreDeBois from '~/assets/realisations/isolation-fibre-de-bois.jpg';
import tasseaux from '~/assets/realisations/couverture-a-tasseaux.jpg';
import bardageMeleze from '~/assets/realisations/bardage-meleze-pignon.jpg';
import lucarne from '~/assets/realisations/lucarne-structure.jpg';
import chevronsPorteurs from '~/assets/realisations/charpente-chevrons-porteurs.jpg';
import cheneau from '~/assets/realisations/soudure-cheneau.jpg';
import pergola from '~/assets/realisations/pergola-bioclimatique.jpg';
import balcon from '~/assets/realisations/balcon-suspendu.jpg';
import acroteres from '~/assets/realisations/habillage-acroteres.jpg';
import gardeCorps from '~/assets/realisations/garde-corps-meleze.jpg';
import solivage from '~/assets/realisations/solivage-queue-daronde.jpg';
import consoles from '~/assets/realisations/consoles-chene.jpg';

export type Realisation = {
  titre: string;
  metier: string;
  /** slug du métier, pour filtrer */
  metierSlug: string;
  legende: string;
  /** Texte alternatif : décrit l'image, ne répète pas le titre. */
  alt: string;
  image: ImageMetadata;
};

/**
 * L'ordre compte à deux endroits : la page d'accueil affiche les trois
 * premières, et la page Métiers illustre chaque métier avec la première
 * réalisation qui porte son `metierSlug`. Déplacer une entrée vers le haut,
 * c'est la promouvoir.
 *
 * Les huit chantiers ajoutés depuis le compte Instagram de CAMBIOME
 * (couverture à tasseaux, lucarne, chéneau, pergola, chevrons porteurs,
 * consoles, bardage mélèze, garde-corps) n'existent qu'en 1080 px : c'est le
 * maximum servi par Instagram, pas les 2400 px du reste du dossier. Ils
 * tiennent en galerie, qui ne demande jamais plus de 1200 px ; en illustration
 * de métier, où la page monte à 1400, Astro les laisse à leur taille native.
 * Si les originaux ressortent un jour, il suffit de réécrire les fichiers.
 *
 * Instagram rend aussi ses photos au carré, quand les vignettes du site sont
 * en 4/3 : le rognage par défaut, centré, coupait la rive du pan de zinc, le
 * faîtage du pignon en mélèze, le cordon de soudure du chéneau. Les huit
 * fichiers ont donc été recadrés serré sur l'ouvrage, en 4/3 dans le fichier
 * lui-même — plutôt qu'un ancrage CSS, qui aurait laissé le navigateur
 * décider et gardé du décor inutile dans les octets servis. Les versions
 * d'origine restent dans l'historique Git si un cadrage se révélait trop
 * juste. Une conséquence à retenir : les légendes et les `alt` décrivent le
 * fichier tel qu'il est aujourd'hui, pas la photo publiée sur Instagram.
 */
export const realisations: Realisation[] = [
  {
    titre: 'Charpente à arêtier',
    metier: 'Charpente',
    metierSlug: 'charpente-ossature-bois',
    legende:
      "Charpente neuve montée sur un bâti de village, arêtier et chevrons posés avant couverture.",
    alt: "Charpente en bois clair fraîchement montée sur un toit, vue depuis le faîtage ; toits de tuiles, clocher et falaise en arrière-plan.",
    image: aretier,
  },
  {
    titre: 'Solivage en poutres en I',
    metier: 'Ossature bois',
    metierSlug: 'charpente-ossature-bois',
    legende:
      "Extension en ossature bois : solivage en poutres en I et contreventement, avant fermeture de l'enveloppe.",
    alt: "Intérieur d'une extension en cours de construction, plafond composé de poutres en I régulières et murs en ossature bois avec panneaux de contreventement.",
    image: poutreI,
  },
  {
    titre: 'Isolation en fibre de bois',
    metier: 'Rénovation thermique',
    metierSlug: 'renovation-thermique',
    legende:
      "Doublage intérieur en panneaux de fibre de bois entre montants, freine-vapeur continu au plafond et lés adhésivés : l'étanchéité à l'air se joue à ce stade.",
    alt: "Pièce en travaux dont les murs sont doublés de panneaux de fibre de bois entre montants de bois ; au plafond, un freine-vapeur clair aux lés adhésivés, au sol un plancher d'OSB et un panneau isolant posé à plat.",
    image: fibreDeBois,
  },
  {
    titre: 'Couverture à tasseaux',
    metier: 'Couverture',
    metierSlug: 'couverture-zinguerie',
    legende:
      "Lucarne reprise en couverture à tasseaux lors d'une réfection de toiture, à Échirolles.",
    alt: "Pan de toiture neuf en zinc à tasseaux, ses baguettes régulières brillant au soleil, au milieu de toits de tuiles anciens.",
    image: tasseaux,
  },
  {
    titre: 'Pignon de grange en mélèze',
    metier: 'Menuiserie',
    metierSlug: 'structure-bois-menuiserie',
    legende:
      "Pignon de grange fermé en bardage mélèze, alternant lames épaufrées et claire-voie sous la pergola. Le mélèze grise sans traitement et tient dans le temps.",
    alt: "Pignon d'une grange rénovée vu depuis la terrasse couverte : charpente apparente en bois clair sous le faîtage, lames de mélèze en triangle et bandeau de tasseaux verticaux en claire-voie.",
    image: bardageMeleze,
  },
  {
    titre: 'Structure de lucarne',
    metier: 'Charpente',
    metierSlug: 'charpente-ossature-bois',
    legende:
      "Structure d'une lucarne cintrée, levée sur une toiture en rénovation complète.",
    alt: "Structure de lucarne en bois neuf, aux montants cintrés en arc, posée sur un toit en travaux dont le versant est couvert d'un écran de sous-toiture et de liteaux ; ville et arbres en contrebas.",
    image: lucarne,
  },
  {
    titre: 'Charpente à chevrons porteurs',
    metier: 'Charpente',
    metierSlug: 'charpente-ossature-bois',
    legende:
      "Charpente refaite à neuf en chevrons porteurs. La contrainte était de conserver la hauteur de latis existante pour rester dans la continuité des toitures mitoyennes : le chevron porteur réduit les chambrées sans superposer les couches.",
    alt: "Charpente neuve en bois clair vue de l'intérieur du comble, pannes et chevrons assemblés sur ferrures se découpant sur un ciel bleu.",
    image: chevronsPorteurs,
  },
  {
    titre: 'Soudure de chéneau',
    metier: 'Zinguerie',
    metierSlug: 'couverture-zinguerie',
    legende: "Chéneau soudé à l'étain en fond de noue, paré pour la pluie.",
    alt: "Chéneau de zinc neuf longeant un versant d'ardoises, cordon de soudure à l'étain visible en travers du fond ; vallée en contrebas.",
    image: cheneau,
  },
  {
    titre: 'Pergola',
    metier: 'Structure bois',
    metierSlug: 'structure-bois-menuiserie',
    legende:
      "Pergola adossée en façade sud : de l'ombre portée sur la terrasse et sur les baies aux heures les plus chaudes, sans rien changer au bâti.",
    alt: "Pergola en bois clair adossée à une maison blanche à volets rouges, ses chevrons se détachant sur un ciel nuageux ; rosier grimpant au premier plan.",
    image: pergola,
  },
  {
    titre: 'Balcon suspendu',
    metier: 'Structure bois',
    metierSlug: 'structure-bois-menuiserie',
    legende:
      'Balcon suspendu et bardage vertical, contreventés sur la structure existante.',
    alt: "Balcon en bois suspendu à la façade d'une maison en bardage bois vertical, vu en contre-plongée sur ciel bleu.",
    image: balcon,
  },
  {
    titre: "Habillage d'acrotères",
    metier: 'Zinguerie',
    metierSlug: 'couverture-zinguerie',
    legende: "Angle d'acrotère façonné à l'atelier, plis et soudures réalisés sur mesure.",
    alt: "Pièce de zinc pliée en angle posée sur un établi d'atelier, plis nets et surface satinée.",
    image: acroteres,
  },
  {
    titre: 'Garde-corps en mélèze',
    metier: 'Structure bois',
    metierSlug: 'structure-bois-menuiserie',
    legende:
      "Terrasse de grange équipée d'un garde-corps en mélèze de pays, dans le massif de Belledonne.",
    alt: "Grange de pierre à flanc de pré, dont la terrasse sur pilotis de béton est bordée d'un garde-corps neuf en bois clair à barreaux verticaux ; montagne boisée à l'arrière-plan.",
    image: gardeCorps,
  },
  {
    titre: "Solivage en queue d'aronde",
    metier: 'Charpente',
    metierSlug: 'charpente-ossature-bois',
    legende:
      "Plancher neuf assemblé en queue d'aronde dans un comble ancien, sous charpente d'origine conservée.",
    alt: "Comble ancien aux murs de pierre, solives neuves en bois clair posées au sol sous une charpente ancienne en bois sombre.",
    image: solivage,
  },
  {
    titre: 'Consoles de dépassée',
    metier: 'Charpente',
    metierSlug: 'charpente-ossature-bois',
    legende: "Consoles de renfort de dépassée, taillées dans du chêne.",
    alt: "Vue en contre-plongée sous l'avancée d'un toit : une console de chêne clair fraîchement taillée soutient les chevrons anciens en bois sombre, contre un mur de pierres apparentes.",
    image: consoles,
  },
];
