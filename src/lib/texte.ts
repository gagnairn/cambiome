/**
 * Retouches typographiques appliquées à l'affichage, jamais à la donnée.
 *
 * Le principe : `src/content/` reste lisible et modifiable par quelqu'un qui ne
 * connaît pas les entités HTML — et qui, depuis le CMS, saisit dans un champ de
 * formulaire. C'est au rendu de coller les espaces qu'il ne faut pas casser.
 */

/** Espace insécable (U+00A0). */
const INSECABLE = ' ';

/**
 * Rend un numéro de téléphone insécable.
 *
 * « 06 27 80 42 38 » écrit avec des espaces ordinaires se coupe en fin de
 * ligne — et un numéro coupé en deux se relit mal, se recopie mal, et se
 * dicte mal. Les colonnes du pied de page et le bloc latéral de la page
 * Contact sont assez étroits pour que le cas se produise.
 *
 * Ne concerne que le texte affiché : le `href="tel:…"` retire les espaces de
 * son côté, il n'a pas à connaître cette fonction.
 */
export function telephoneInsecable(numero: string): string {
  return numero.replace(/ /g, INSECABLE);
}

/**
 * Applique les règles typographiques françaises à un texte destiné à l'écran.
 *
 * Trois règles, et rien d'autre :
 *
 *   — l'apostrophe droite `'` devient `’` entre deux lettres ;
 *   — une espace insécable précède `; : ! ?` ;
 *   — les guillemets français collent à leur contenu, insécablement.
 *
 * C'est l'application au texte courant du principe que ce module porte déjà
 * pour les numéros et les horaires : la donnée reste saisissable au clavier
 * dans un champ de formulaire, la typographie se fait au rendu. Demander à
 * l'éditeur de taper `’` et des insécables serait lui demander de connaître
 * des raccourcis clavier qu'il n'a pas à connaître — et la première faute de
 * frappe passerait inaperçue.
 *
 * ⚠ U+00A0 et non U+202F, l'espace fine insécable, qui serait pourtant la
 * forme juste devant `; ! ?`. Les polices du site sont sous-ensemblées : U+2019
 * et U+00A0 y sont, U+202F n'y est PAS (vérifié dans la table `cmap` des deux
 * woff2). Une fine retomberait sur la police suivante de la pile, avec sa
 * chasse à elle — visible, et pour rien. À reconsidérer le jour où les
 * sous-ensembles sont régénérés avec ce caractère.
 *
 * La fonction est idempotente : une insécable déjà posée n'en appelle pas une
 * seconde. C'est ce qui permet de l'appliquer sans tenir le compte de ce qui
 * est déjà passé par elle.
 */
export function typographie(texte: string): string {
  return (
    texte
      // Entre deux lettres seulement : une apostrophe isolée, ou encadrant un
      // mot cité, n'est pas une élision.
      .replace(/(\p{L})'(\p{L})/gu, `$1’$2`)
      // Le groupe capture la SUITE de ponctuations : « !!! » prend une seule
      // insécable devant, là où un traitement caractère par caractère en
      // glisserait une entre chaque signe. Le regard en avant exige une espace
      // ou une fin de chaîne, ce qui laisse tranquilles `https://`, `:-)` et
      // les rapports de contraste écrits « 4,81:1 ».
      .replace(/[ \t ]*([;:!?]+)(?=\s|$)/g, `${INSECABLE}$1`)
      .replace(/«[ \t ]*/g, `«${INSECABLE}`)
      .replace(/[ \t ]*»/g, `${INSECABLE}»`)
  );
}
