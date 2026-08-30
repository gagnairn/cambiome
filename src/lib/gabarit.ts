/**
 * Substitution de jetons dans les textes du CMS.
 *
 * Quelques phrases du site nomment l'entreprise, sa zone d'intervention ou son
 * organisme certificateur. Ces valeurs vivent déjà dans `entreprise.yaml` et
 * `rge.yaml` : les recopier dans la prose reviendrait à les avoir à deux
 * endroits, et à voir un jour le site annoncer une zone d'intervention dans une
 * phrase et une autre dans la suivante.
 *
 * On garde donc la phrase entière modifiable, avec un jeton pour la valeur :
 *
 *   texte: "{nom} intervient sur {zone}."
 *
 * Ce n'est pas un moteur de gabarits, et ça ne doit pas le devenir : pas de
 * condition, pas de boucle, pas de mise en forme. Une clé entre accolades,
 * remplacée par une chaîne.
 *
 * Un jeton inconnu lève une erreur au build plutôt que de s'afficher tel quel :
 * « {non} » sur une page publiée serait une coquille visible de tous, là où un
 * build rouge n'est vu que de nous.
 *
 * L'absence, elle, ne se voit pas d'ici : un texte dont le jeton a été effacé
 * est un texte comme un autre. C'est le schéma qui l'attrape, dans
 * `src/data/pages.ts` (`avecJetons`), où l'on sait ce que chaque phrase doit
 * porter.
 */

/**
 * Remplace les `{jetons}` d'un texte par leur valeur.
 *
 * @param texte Texte issu d'un fichier de contenu.
 * @param valeurs Jetons reconnus dans ce texte.
 */
export function remplir(texte: string, valeurs: Record<string, string>): string {
  return texte.replace(/\{(\w+)\}/g, (_, cle: string) => {
    if (!(cle in valeurs)) {
      const connus = Object.keys(valeurs).join(', ') || '(aucun)';
      throw new Error(
        `Jeton inconnu « {${cle}} » dans le texte :\n` +
          `  « ${texte} »\n` +
          `Jetons acceptés à cet endroit : ${connus}.`,
      );
    }
    return valeurs[cle];
  });
}

/**
 * Coupe un texte de part et d'autre d'un jeton, pour y insérer un lien.
 *
 * Trois phrases du site portent un lien en leur milieu. Les mettre en YAML avec
 * leur balise `<a>` supposerait de les rendre en `set:html`, c'est-à-dire de
 * faire confiance au contenu du CMS pour produire du HTML — une injection de
 * script à un compte compromis de distance. Les découper en « avant » et
 * « après » dans le formulaire donnerait à l'éditeur deux moitiés de phrase.
 *
 * On garde donc la phrase entière et modifiable, avec le jeton pour marquer où
 * se place le lien ; la page insère l'ancre entre les deux morceaux, qu'Astro
 * échappe l'un et l'autre.
 *
 * @returns Le texte avant le jeton, puis celui qui le suit.
 */
export function scinder(texte: string, jeton: string): [string, string] {
  const marque = `{${jeton}}`;
  const coupe = texte.indexOf(marque);
  if (coupe === -1) {
    throw new Error(
      `Le jeton « ${marque} » manque dans le texte :\n  « ${texte} »\n` +
        'Il marque l’endroit où se place le lien ; sans lui, le lien disparaîtrait de la page.',
    );
  }
  return [texte.slice(0, coupe), texte.slice(coupe + marque.length)];
}
