/**
 * Lecture des fichiers de contenu YAML de `src/content/`.
 *
 * Le contenu éditorial du site vit en YAML et non plus en TypeScript, pour
 * qu'un éditeur puisse le modifier depuis un formulaire (Pages CMS) sans
 * écrire de code. Les modules de `src/data/` restent la façade : ils lisent
 * ici, valident, et exposent aux pages les mêmes objets qu'avant.
 *
 * Deux choix à expliquer.
 *
 * `import.meta.glob` plutôt que `fs.readFileSync` : Vite inscrit alors les
 * fichiers dans son graphe de dépendances. Une correction dans un YAML
 * rafraîchit la page en développement, là où une lecture par `fs` ne serait
 * vue qu'au redémarrage du serveur. Le glob est `eager` : tout est inliné au
 * build, il n'y a aucune lecture disque à l'exécution.
 *
 * La validation par schéma n'est pas un ornement : c'est elle qui rend le CMS
 * sûr. La chaîne d'intégration lance `astro check` puis `astro build` avant de
 * publier ; une saisie invalide fait donc échouer le build, et le site en
 * ligne reste sur sa version précédente. Sans schéma, un champ vidé par
 * mégarde passerait et produirait une page trouée.
 */
// Imports nommés et non un objet par défaut : js-yaml 5 a réorganisé son API
// en exports plats et n'expose plus d'export par défaut. La bibliothèque
// embarque désormais ses propres types, `@types/js-yaml` a donc été retiré.
import { load, JSON_SCHEMA } from 'js-yaml';
import type { z } from 'astro/zod';

// `**` : la prose des pages est rangée dans un sous-dossier `pages/`, pour que
// le CMS puisse la présenter comme un groupe à part des données de l'entreprise.
const FICHIERS = import.meta.glob('/src/content/**/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Met une erreur de saisie en français lisible, avec le chemin du champ fautif.
 *
 * Le message par défaut de Zod est un JSON de plusieurs lignes par erreur ;
 * dans un journal d'intégration continue, il noie l'information. Ici on veut
 * qu'un éditeur non technique — ou nous, en lisant le rapport qu'il nous
 * transmet — comprenne quel champ reprendre.
 */
function messageDErreur(
  fichier: string,
  erreurs: readonly z.core.$ZodIssue[],
): string {
  const lignes = erreurs.map((e) => {
    const chemin = e.path.length ? e.path.join(' › ') : '(racine du fichier)';
    return `  • ${chemin} : ${e.message}`;
  });
  return [
    `Le fichier de contenu « ${fichier}.yaml » est invalide.`,
    ...lignes,
    '',
    'Le site n’a pas été publié ; la version précédente reste en ligne.',
  ].join('\n');
}

/**
 * Charge et valide un fichier de `src/content/`.
 *
 * @param nom Nom du fichier sans extension, ex. `'entreprise'`.
 * @param schema Schéma Zod décrivant le contenu attendu.
 */
export function charger<T extends z.ZodTypeAny>(
  nom: string,
  schema: T,
): z.infer<T> {
  const chemin = `/src/content/${nom}.yaml`;
  const brut = FICHIERS[chemin];

  if (brut === undefined) {
    const existants = Object.keys(FICHIERS)
      .map((c) => c.replace('/src/content/', '').replace('.yaml', ''))
      .join(', ');
    throw new Error(
      `Fichier de contenu introuvable : ${chemin}\n` +
        `Fichiers disponibles : ${existants || '(aucun)'}`,
    );
  }

  let donnees: unknown;
  try {
    // JSON_SCHEMA et non le schéma par défaut : ce dernier reconnaît le type
    // « timestamp » de YAML 1.1 et transforme `fin: 2026-12-09` en objet Date.
    // Les dates du site sont comparées en ISO sous forme de chaînes
    // (`rgeEnCours`), et l'éditeur voit dans son formulaire ce qui est écrit
    // dans le fichier. On veut donc des chaînes, pas des Date reconstituées
    // dans le fuseau du serveur de build.
    donnees = load(brut, { schema: JSON_SCHEMA });
  } catch (cause) {
    // Erreur de syntaxe YAML — indentation, guillemet non fermé. Le message de
    // js-yaml porte la ligne et la colonne, on le garde tel quel.
    throw new Error(
      `Le fichier de contenu « ${nom}.yaml » est mal formé :\n` +
        (cause instanceof Error ? cause.message : String(cause)),
    );
  }

  const resultat = schema.safeParse(donnees);
  if (!resultat.success) {
    throw new Error(messageDErreur(nom, resultat.error.issues));
  }
  return resultat.data;
}
