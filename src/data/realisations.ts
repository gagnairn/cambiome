import type { ImageMetadata } from 'astro';

import aretier from '~/assets/realisations/charpente-aretier.jpg';
import poutreI from '~/assets/realisations/charpente-poutre-en-i.jpg';
import balcon from '~/assets/realisations/balcon-suspendu.jpg';
import acroteres from '~/assets/realisations/habillage-acroteres.jpg';
import solivage from '~/assets/realisations/solivage-queue-daronde.jpg';
import chene from '~/assets/realisations/charpente-chene.jpg';

export type Realisation = {
  slug: string;
  titre: string;
  metier: string;
  /** slug du métier, pour filtrer */
  metierSlug: string;
  legende: string;
  /** Texte alternatif : décrit l'image, ne répète pas le titre. */
  alt: string;
  image: ImageMetadata;
};

export const realisations: Realisation[] = [
  {
    slug: 'charpente-aretier',
    titre: 'Charpente à arêtier',
    metier: 'Charpente',
    metierSlug: 'charpente-ossature-bois',
    legende:
      "Charpente neuve montée sur un bâti de village, arêtier et chevrons posés avant couverture.",
    alt: "Charpente en bois clair fraîchement montée sur un toit, vue depuis le faîtage ; toits de tuiles, clocher et falaise en arrière-plan.",
    image: aretier,
  },
  {
    slug: 'charpente-poutre-en-i',
    titre: 'Solivage en poutres en I',
    metier: 'Ossature bois',
    metierSlug: 'charpente-ossature-bois',
    legende:
      "Extension en ossature bois : solivage en poutres en I et contreventement, avant fermeture de l'enveloppe.",
    alt: "Intérieur d'une extension en cours de construction, plafond composé de poutres en I régulières et murs en ossature bois avec panneaux de contreventement.",
    image: poutreI,
  },
  {
    slug: 'balcon-suspendu',
    titre: 'Balcon suspendu',
    metier: 'Structure bois',
    metierSlug: 'structure-bois-menuiserie',
    legende:
      'Balcon suspendu et bardage vertical, contreventés sur la structure existante.',
    alt: "Balcon en bois suspendu à la façade d'une maison en bardage bois vertical, vu en contre-plongée sur ciel bleu.",
    image: balcon,
  },
  {
    slug: 'habillage-acroteres',
    titre: "Habillage d'acrotères",
    metier: 'Zinguerie',
    metierSlug: 'couverture-zinguerie',
    legende: "Angle d'acrotère façonné à l'atelier, plis et soudures réalisés sur mesure.",
    alt: "Pièce de zinc pliée en angle posée sur un établi d'atelier, plis nets et surface satinée.",
    image: acroteres,
  },
  {
    slug: 'solivage-queue-daronde',
    titre: "Solivage en queue d'aronde",
    metier: 'Charpente',
    metierSlug: 'charpente-ossature-bois',
    legende:
      "Plancher neuf assemblé en queue d'aronde dans un comble ancien, sous charpente d'origine conservée.",
    alt: "Comble ancien aux murs de pierre, solives neuves en bois clair posées au sol sous une charpente ancienne en bois sombre.",
    image: solivage,
  },
  {
    slug: 'charpente-chene',
    titre: 'Charpente chêne',
    metier: 'Charpente',
    metierSlug: 'charpente-ossature-bois',
    legende: 'Pause sur une poutre de chêne, en cours de taille.',
    alt: "Deux tasses à café émaillées posées sur une poutre de chêne fraîchement taillée, devant un mur de pierre.",
    image: chene,
  },
];
