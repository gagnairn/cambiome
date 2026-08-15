/**
 * Galerie des chantiers.
 *
 * Le contenu est dans `src/content/realisations.yaml`, modifiable depuis le
 * CMS. Ce module le lit, le valide, et rattache chaque entrée à son fichier
 * image.
 *
 * L'ordre du fichier compte à deux endroits : la page d'accueil affiche les
 * trois premières entrées, et la page Métiers illustre chaque métier avec la
 * première réalisation qui porte son `metierSlug`. Déplacer une entrée vers le
 * haut, c'est la promouvoir.
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
 * lui-même — plutôt qu'un ancrage CSS, qui aurait laissé le navigateur décider
 * et gardé du décor inutile dans les octets servis. Les versions d'origine
 * restent dans l'historique Git si un cadrage se révélait trop juste. Une
 * conséquence à retenir : les légendes et les `alt` décrivent le fichier tel
 * qu'il est aujourd'hui, pas la photo publiée sur Instagram.
 */
import type { ImageMetadata } from 'astro';
import { z } from 'astro/zod';
import { charger } from '~/lib/contenu';
import { metiers } from '~/data/site';

/**
 * Index de toutes les photos du dossier, construit au build.
 *
 * Auparavant chaque photo avait son `import` en tête de fichier. C'était plus
 * direct à lire, mais cela mettait l'ajout d'un chantier hors de portée d'un
 * éditeur : il fallait écrire une ligne d'import puis la référencer. Ici, le
 * YAML ne contient qu'un nom de fichier et la résolution se fait au build.
 *
 * Le glob reste statique — Vite l'exige, et c'est ce qui permet à Astro de
 * n'inclure dans la version publiée que les images réellement citées.
 */
const PHOTOS = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/realisations/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

/**
 * Retrouve une photo à partir de ce qu'écrit le fichier de contenu.
 *
 * On ne compare que le nom de fichier, pas le chemin : selon le réglage
 * `media.output` du CMS, la même photo peut être écrite `consoles-chene.jpg`,
 * `/consoles-chene.jpg` ou `src/assets/realisations/consoles-chene.jpg`. Les
 * trois désignent le même fichier, et un site qui casse parce qu'une barre
 * oblique s'est ajoutée serait un mauvais service rendu à l'éditeur.
 */
function photo(reference: string, titre: string): ImageMetadata {
  const fichier = reference.split('/').pop();
  const trouve = Object.entries(PHOTOS).find(
    ([chemin]) => chemin.split('/').pop() === fichier,
  );

  if (!trouve) {
    // Échouer bruyamment plutôt que d'afficher un trou : la chaîne
    // d'intégration refusera de publier, et le site en ligne gardera sa
    // version précédente le temps que la photo soit téléversée.
    const disponibles = Object.keys(PHOTOS)
      .map((c) => c.split('/').pop())
      .sort()
      .join('\n  ');
    throw new Error(
      `Le chantier « ${titre} » cite la photo « ${reference} », qui n'existe pas ` +
        `dans src/assets/realisations/.\n` +
        `Photos disponibles :\n  ${disponibles}`,
    );
  }

  return trouve[1].default;
}

/**
 * La liste vit sous une clé `chantiers`, et non à la racine du fichier.
 *
 * Ce n'est pas un choix de goût : Pages CMS ne sait construire un formulaire de
 * liste pour un fichier dont la racine est un tableau que si l'entrée déclare
 * exactement `list: true` (`components/entry/entry.tsx`, comparaison stricte).
 * La forme longue — celle qui porte le résumé repliable — n'est honorée que sur
 * un champ. Sans clé de premier niveau, il fallait donc choisir entre un
 * formulaire correct et quatorze blocs intitulés « Item #7 ».
 */
const SchemaChantiers = z
  .array(
    z.object({
      titre: z
        .string()
        .trim()
        .min(1, 'Le titre du chantier ne peut pas être vide.')
        // Le titre est affiché sur une ligne par-dessus la vignette ; au-delà,
        // il passe à la ligne et recouvre la photo.
        .max(
          60,
          'Le titre du chantier dépasse 60 signes ; il recouvrirait la photo.',
        ),
      /** Étiquette affichée sur la vignette, libre — « Zinguerie », « Ossature bois ». */
      metier: z.string().trim().min(1, "L'étiquette de métier ne peut pas être vide."),
      /**
       * Rattache le chantier à l'un des métiers de `metiers.yaml`. La
       * cohérence entre les deux fichiers est vérifiée plus bas : un slug
       * inconnu ferait disparaître silencieusement la photo de la page
       * Métiers, sans que rien ne le signale.
       */
      metierSlug: z.string().trim().min(1, 'Le métier du chantier est obligatoire.'),
      legende: z.string().trim().min(1, 'La légende ne peut pas être vide.'),
      /**
       * Texte alternatif : décrit l'image, ne répète pas le titre. Obligatoire
       * — c'est ce que lisent les personnes aveugles et les moteurs de
       * recherche, et une image décorative n'aurait pas sa place en galerie.
       */
      alt: z
        .string()
        .trim()
        .min(1, "La description de la photo (alt) est obligatoire : elle est lue par les personnes aveugles."),
      image: z.string().trim().min(1, 'Le chantier doit citer une photo.'),
    }),
  )
  .min(1, 'La galerie ne peut pas être vide.')
  // Un `metierSlug` qui ne correspond à aucun métier ne produit pas d'erreur
  // visible : la photo reste en galerie, elle disparaît seulement de la page
  // Métiers. C'est précisément le genre de panne qu'on ne remarque pas. On la
  // transforme donc en échec de build.
  .superRefine((liste, ctx) => {
    const connus = new Set(metiers.map((m) => m.slug));
    liste.forEach((r, i) => {
      if (!connus.has(r.metierSlug)) {
        ctx.addIssue({
          code: 'custom',
          path: [i, 'metierSlug'],
          message:
            `Le chantier « ${r.titre} » est rattaché au métier « ${r.metierSlug} », ` +
            `qui n'existe pas. Métiers possibles : ${[...connus].join(', ')}.`,
        });
      }
    });
  });

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

export const realisations: Realisation[] = charger(
  'realisations',
  z.object({ chantiers: SchemaChantiers }),
).chantiers.map((r) => ({ ...r, image: photo(r.image, r.titre) }));
