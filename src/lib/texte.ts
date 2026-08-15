/**
 * Retouches typographiques appliquées à l'affichage, jamais à la donnée.
 *
 * Le principe : `src/data/site.ts` reste lisible et modifiable par quelqu'un
 * qui ne connaît pas les entités HTML. C'est au rendu de coller les espaces
 * qu'il ne faut pas casser.
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
