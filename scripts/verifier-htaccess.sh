#!/usr/bin/env bash
#
# Fait relire public/.htaccess par un vrai Apache, avant de le déployer.
#
# Une directive mal orthographiée, une expression `expr=` invalide ou une
# balise non refermée ne se voient pas à la lecture : Apache répond alors par
# une erreur 500 sur TOUT le site, pages comprises. Le test de fumée le
# constaterait, mais après coup — le temps de comprendre et de revenir en
# arrière, le site est resté inaccessible. Cette vérification-ci passe avant le
# transfert : une faute de frappe ne quitte jamais le runner.
#
#   ./scripts/verifier-htaccess.sh          (ou : npm run verifier)
#
# `apachectl -t` ne relit PAS les .htaccess : il ne valide que la configuration
# principale. On contourne en incluant le fichier dans un `<Directory>` d'une
# configuration jetable — toutes les directives qu'il contient y sont valides,
# et c'est le même analyseur qui les lit.
#
# Ce que ce contrôle voit : les directives inconnues, les arguments en trop ou
# en trop peu, les expressions `expr=` mal formées, les blocs non refermés.
# Ce qu'il ne voit pas : qu'une règle fasse ce qu'on croit. Cela reste le
# travail de `scripts/fumee.sh`, après le déploiement.

set -uo pipefail

racine=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

# Après un build, c'est la copie de `dist/` qu'on relit — celle qui sera
# réellement déposée. Astro se contente de recopier `public/`, les deux sont
# donc identiques ; mais valider l'artefact plutôt que sa source ferme la
# question sans avoir à faire confiance à la copie. Sans build, on retombe sur
# la source, pour que le script reste utilisable à tout moment.
htaccess="${1:-}"
if [ -z "$htaccess" ]; then
  htaccess="$racine/public/.htaccess"
  [ -f "$racine/dist/.htaccess" ] && htaccess="$racine/dist/.htaccess"
fi

[ -f "$htaccess" ] || { echo "  ✗ $htaccess introuvable"; exit 1; }

apache=$(command -v apache2 || command -v httpd) || apache=''
if [ -z "$apache" ]; then
  # En intégration continue, l'absence d'Apache est une panne d'installation,
  # pas une machine de développement dépourvue : le contrôle doit alors être
  # bruyant plutôt que silencieusement sauté.
  if [ -n "${CI:-}" ]; then
    echo "  ✗ ni apache2 ni httpd dans le PATH — le contrôle n'a pas eu lieu"
    exit 1
  fi
  echo "  · Apache absent de cette machine, contrôle sauté (il tournera en CI)."
  exit 0
fi

# Les modules ne sont pas au même endroit selon la distribution. Sans eux, les
# blocs `<IfModule>` seraient simplement ignorés et le contrôle ne vérifierait
# plus rien — c'est le cas qu'il faut détecter, pas subir.
modules=''
for candidat in /usr/lib/apache2/modules /usr/libexec/apache2 /usr/lib64/httpd/modules \
                /usr/lib/httpd/modules /usr/local/libexec/apache2 /opt/homebrew/lib/httpd/modules; do
  [ -d "$candidat" ] && { modules=$candidat; break; }
done
[ -n "$modules" ] || { echo "  ✗ répertoire des modules Apache introuvable"; exit 1; }

# mpm et unixd font démarrer l'analyseur ; les trois autres sont ceux dont
# .htaccess teste la présence. Si mime, headers ou rewrite manquent, les
# `<IfModule>` correspondants se videraient et le contrôle deviendrait creux.
declare -a indispensables=(mod_mime mod_headers mod_rewrite)
declare -a supports=(mod_mpm_event mod_mpm_prefork mod_unixd mod_authz_core mod_dir)

manquants=()
for m in "${indispensables[@]}"; do
  [ -f "$modules/$m.so" ] || manquants+=("$m")
done
if [ ${#manquants[@]} -gt 0 ]; then
  echo "  ✗ modules absents de $modules : ${manquants[*]}"
  echo "    sans eux les blocs <IfModule> ne seraient pas relus."
  exit 1
fi

nom_module() { # mod_headers -> headers_module
  printf '%s_module' "${1#mod_}"
}

# Équilibre des blocs, contrôlé à part.
#
# C'est le seul angle mort de la méthode : inclus dans un `<Directory>`, un
# bloc laissé ouvert en fin de fichier se referme sur le `</Directory>` de la
# configuration jetable, et Apache le déclare valide. En vrai .htaccess, il
# provoquerait une erreur 500. Vérifié : sans ce contrôle, ajouter un
# `<IfModule mod_headers.c>` sans son `</IfModule>` passait au vert.
#
# Les lignes de commentaire sont écartées d'abord — celles de .htaccess citent
# des balises (`<meta>`, `<IfModule mod_autoindex.c>`) qui fausseraient tout.
desequilibres=$(awk '
  /^[[:space:]]*#/ { next }
  /^[[:space:]]*<\// {
    nom = $0; sub(/^[[:space:]]*<\//, "", nom); sub(/[[:space:]>].*$/, "", nom)
    if (profondeur == 0) { print "ligne " NR " : </" nom "> ne ferme aucun bloc"; next }
    attendu = pile[profondeur]
    if (attendu != nom)
      print "ligne " NR " : </" nom "> ferme un <" attendu "> ouvert ligne " ligne[profondeur]
    profondeur--
    next
  }
  /^[[:space:]]*</ {
    nom = $0; sub(/^[[:space:]]*</, "", nom); sub(/[[:space:]>].*$/, "", nom)
    profondeur++; pile[profondeur] = nom; ligne[profondeur] = NR
  }
  END {
    for (; profondeur > 0; profondeur--)
      print "fin de fichier : <" pile[profondeur] "> ouvert ligne " ligne[profondeur] ", jamais refermé"
  }
' "$htaccess")

if [ -n "$desequilibres" ]; then
  echo "  ✗ $(basename "$htaccess") — blocs mal appariés :"
  echo
  # shellcheck disable=SC2001  # indenter chaque ligne, pas remplacer une sous-chaîne
  echo "$desequilibres" | sed 's/^/    /'
  echo
  exit 1
fi

travail=$(mktemp -d)
trap 'rm -rf "$travail"' EXIT
mkdir -p "$travail/site"

# Copié plutôt que lu depuis public/ : le nom `.htaccess` ferait sauter le
# fichier de certains `Include`, qui ignorent les fichiers cachés.
cp "$htaccess" "$travail/site/regles.conf"

{
  echo "ServerName validation.local"
  echo "ServerRoot \"$travail\""
  echo "ErrorLog \"$travail/erreurs.log\""
  # Un seul MPM, sinon Apache refuse.
  mpm_charge=0
  for m in "${supports[@]}"; do
    case "$m" in
      mod_mpm_*) [ "$mpm_charge" = 1 ] && continue ;;
    esac
    [ -f "$modules/$m.so" ] || continue
    case "$m" in mod_mpm_*) mpm_charge=1 ;; esac
    echo "LoadModule $(nom_module "$m") \"$modules/$m.so\""
  done
  for m in "${indispensables[@]}"; do
    echo "LoadModule $(nom_module "$m") \"$modules/$m.so\""
  done
  echo "DocumentRoot \"$travail/site\""
  echo "<Directory \"$travail/site\">"
  echo "  AllowOverride All"
  echo "  Include \"$travail/site/regles.conf\""
  echo "</Directory>"
} > "$travail/httpd.conf"

sortie=$("$apache" -f "$travail/httpd.conf" -t 2>&1)
etat=$?

# `-t` sort en 0 avec un simple avertissement sur le nom de serveur ; seul le
# code de retour distingue une vraie erreur de configuration.
if [ "$etat" -ne 0 ]; then
  echo "  ✗ $(basename "$htaccess") refusé par Apache :"
  echo
  # Les chemins du répertoire jetable ne veulent rien dire pour le lecteur ;
  # seule compte la ligne fautive, que l'on ramène au vrai fichier.
  echo "$sortie" | sed "s|$travail/site/regles.conf|${htaccess#"$racine"/}|g" | sed 's/^/    /'
  echo
  exit 1
fi

lignes=$(grep -cvE '^\s*(#|$)' "$htaccess")
echo "${htaccess#"$racine"/} : $lignes directives relues par $("$apache" -v | head -1 | sed 's/^Server version: //') — syntaxe valide."
