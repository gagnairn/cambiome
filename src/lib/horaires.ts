/**
 * Horaires d'ouverture de l'atelier : la table des jours et sa traduction.
 *
 * Deux lecteurs, deux formats. Le visiteur lit « Lundi – vendredi, 8 h – 12 h »
 * sur la page Contact ; un moteur de recherche lit un
 * `OpeningHoursSpecification` avec des jours en anglais et des heures en
 * `HH:MM`. Les deux sortent de la même saisie — sans quoi la page et le
 * balisage finiraient par annoncer des horaires différents, ce qui est pire
 * que de n'en annoncer aucun.
 *
 * Le CMS ne propose que des plages fermées (« lundi – vendredi », « samedi »)
 * et non une case à cocher par jour. C'est un choix de saisie : sept cases
 * multipliées par plusieurs lignes donnent un formulaire que personne ne
 * remplit juste, alors que ces quelques plages couvrent les horaires d'un
 * artisan. Une plage manquante s'ajoute ici et dans `.pages.yml`, les deux
 * listes étant vérifiées l'une contre l'autre par `npm run verifier`.
 */

/** Les sept jours, dans l'ordre de la semaine, avec leur nom schema.org. */
const SEMAINE = {
  lundi: 'Monday',
  mardi: 'Tuesday',
  mercredi: 'Wednesday',
  jeudi: 'Thursday',
  vendredi: 'Friday',
  samedi: 'Saturday',
  dimanche: 'Sunday',
} as const;

type Jour = keyof typeof SEMAINE;

/**
 * Les plages proposées à la saisie, et les jours que chacune couvre.
 *
 * L'ordre compte : c'est celui du menu déroulant du CMS, et les plages
 * groupées viennent d'abord parce que ce sont elles qu'on choisit presque
 * toujours.
 */
export const PLAGES = {
  'lundi-vendredi': ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
  'lundi-samedi': ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  'samedi-dimanche': ['samedi', 'dimanche'],
  lundi: ['lundi'],
  mardi: ['mardi'],
  mercredi: ['mercredi'],
  jeudi: ['jeudi'],
  vendredi: ['vendredi'],
  samedi: ['samedi'],
  dimanche: ['dimanche'],
} as const satisfies Record<string, readonly Jour[]>;

export type Plage = keyof typeof PLAGES;

/** Les clés, pour que le schéma Zod et le vérificateur du CMS s'y adossent. */
export const CODES_PLAGES = Object.keys(PLAGES) as [Plage, ...Plage[]];

/** Espace insécable, pour que « Lundi – vendredi » ne se coupe pas au tiret. */
const INSECABLE = ' ';

const capitaliser = (mot: string) => mot[0].toUpperCase() + mot.slice(1);

/** `lundi-vendredi` -> « Lundi – vendredi » ; `samedi` -> « Samedi ». */
export function libelleJours(plage: Plage): string {
  const jours = PLAGES[plage];
  return jours.length === 1
    ? capitaliser(jours[0])
    : `${capitaliser(jours[0])}${INSECABLE}–${INSECABLE}${jours[jours.length - 1]}`;
}

/** `lundi-vendredi` -> `['Monday', … , 'Friday']`, pour schema.org. */
export function joursSchema(plage: Plage): string[] {
  return PLAGES[plage].map((j) => SEMAINE[j]);
}

/**
 * `08:00` -> « 8 h » ; `08:30` -> « 8 h 30 ». L'usage français ne met pas de
 * zéro initial à l'heure, écrit `h` et non `:`, et laisse tomber les minutes
 * quand elles sont nulles. Les espaces sont insécables : « 8 h » coupé en fin
 * de ligne se lit mal.
 *
 * La donnée, elle, reste en `HH:MM` — c'est ce que schema.org attend, et c'est
 * la seule forme qu'on puisse comparer ou trier.
 */
export function heureFrancaise(heure: string): string {
  const [h, m] = heure.split(':');
  const debut = `${Number(h)}${INSECABLE}h`;
  return m === '00' ? debut : `${debut}${INSECABLE}${m}`;
}
