#!/usr/bin/env bash
#
# Test de fumée : interroge le site réellement publié.
#
# Un déploiement peut réussir sur un site cassé — artefact vide, page 404 non
# servie, CSP disparue. Le workflow est vert, le site ne marche pas. Ce script
# est ce qui fait la différence entre « le déploiement s'est terminé » et « le
# site fonctionne ».
#
#   ./scripts/fumee.sh https://www.cambiome.fr
#
# Il vérifie aussi, depuis le 3 septembre 2026, ce que `public/.htaccess`
# AFFIRME : en-têtes de sécurité, types MIME, durées de cache et nombre de
# sauts de redirection.
#
# Ce sont quatre pannes silencieuses qui l'ont fait écrire, toutes trouvées à
# la main un `curl` après l'autre, aucune visible à la lecture du .htaccess :
# des types MIME absents, un `Cache-Control` en double, un `Vary` parasite, et
# des pages qui redirigeaient vers `…cambiome.fr:443/`. Ce script ne les voyait
# pas — il ne regardait que des codes de statut, et suivait les redirections
# avec `-L` sans jamais compter les sauts ni lire l'adresse d'arrivée.
#
# Toute règle ajoutée au .htaccess doit venir avec son assertion ici.
#
# Derrière un proxy d'entreprise qui intercepte TLS, exporter
# FUMEE_CURL_OPTS=-k pour tester en local. À n'utiliser que là : en CI, la
# vérification du certificat doit rester active.

set -uo pipefail

BASE="${1:?Usage: fumee.sh <url-du-site>}"
BASE="${BASE%/}"

# shellcheck disable=SC2206  # découpage en mots voulu
CURL=(curl -sS -L --max-time 20 ${FUMEE_CURL_OPTS:-})
# Sans `-L` : pour lire une redirection il faut ne pas la suivre.
# shellcheck disable=SC2206
TETE=(curl -sSI --max-time 20 ${FUMEE_CURL_OPTS:-})

echec=0
signaler() {
  echo "  ✗ $1"
  echec=1
}

# Valeur d'un en-tête dans un bloc de réponse, ou chaîne vide.
valeur() { # <bloc> <nom>
  grep -i "^$2:" <<<"$1" | head -1 | sed 's/^[^:]*: *//'
}

# Une attente avant le premier appel. Elle servait à laisser le CDN de GitHub
# Pages propager ; chez OVH le dépôt SFTP est immédiat, mais le miroir écrit
# les fichiers un par un et le dernier peut arriver après le premier appel.
# Sans cette boucle, le job échouerait par intermittence — et un test qui
# clignote est un test qu'on finit par ignorer.
echo "Attente de la propagation de $BASE/ ..."
for tentative in 1 2 3 4 5; do
  code=$("${CURL[@]}" -o /dev/null -w '%{http_code}' "$BASE/") && [ "$code" = 200 ] && break
  if [ "$tentative" = 5 ]; then
    echo "  ✗ $BASE/ ne répond toujours pas 200 après 5 tentatives (dernier code : ${code:-aucun})"
    exit 1
  fi
  echo "  ... tentative $tentative : ${code:-aucune réponse}, nouvelle tentative dans 10 s"
  sleep 10
done
echo "  ✓ site joignable"

# Lue une fois, relue partout : contenu éditorial, forme des liens internes, et
# adresses des fichiers de `_astro/` sur lesquels porteront les contrôles de
# type MIME et de cache. Les déduire de la page plutôt que de les écrire ici
# évite d'avoir à mettre ce script à jour à chaque changement d'empreinte.
accueil=$("${CURL[@]}" "$BASE/")

echo
echo "Pages et ressources :"
# Les chemins de page portent leur slash final : c'est l'adresse canonique,
# celle du sitemap et du `<link rel="canonical">`. La section
# « Canonicalisation » plus bas vérifie séparément que les autres formes y
# ramènent.
# Liste explicite plutôt que déduite du sitemap : /merci en est volontairement
# absent, et une page qu'on oublierait d'ajouter ici serait de toute façon
# rattrapée par le vérificateur de liens au build.
for chemin in "" contact/ metiers/ realisations/ demarche/ rge-qualibat/ \
              mentions-legales/ merci/ \
              robots.txt sitemap-index.xml site.webmanifest \
              favicon.ico apple-touch-icon.png; do
  code=$("${CURL[@]}" -o /dev/null -w '%{http_code}' "$BASE/$chemin")
  if [ "$code" = 200 ]; then
    echo "  ✓ /$chemin"
  else
    signaler "/$chemin — $code au lieu de 200"
  fi
done

echo
echo "Pages d'erreur :"
code=$("${CURL[@]}" -o /dev/null -w '%{http_code}' "$BASE/cette-page-nexiste-pas")
if [ "$code" = 404 ]; then
  echo "  ✓ une URL inconnue répond bien 404"
else
  signaler "une URL inconnue répond $code au lieu de 404"
fi
# `Options -Indexes` transforme un dossier sans index en 403, et un nom de
# dossier se devine. Le statut doit rester 403, mais la page servie doit être
# la nôtre et non celle d'Apache, en HTML 2.0.
listing=$("${CURL[@]}" -w '\n%{http_code}' "$BASE/_astro/")
if [ "${listing##*$'\n'}" != 403 ]; then
  signaler "/_astro/ répond ${listing##*$'\n'} au lieu de 403 — le listing de répertoire est-il ouvert ?"
elif ! grep -qi 'CAMBIOME' <<<"$listing"; then
  signaler "/_astro/ répond bien 403 mais avec la page d'erreur par défaut d'Apache (ErrorDocument 403 absent)"
else
  echo "  ✓ /_astro/ répond 403 avec la page du site"
fi

echo
echo "Contenu de la page d'accueil :"
# Distingue un vrai déploiement d'une page blanche ou d'un artefact vide.
if grep -qi 'CAMBIOME' <<<"$accueil"; then
  echo "  ✓ le contenu éditorial est présent"
else
  signaler "le mot « CAMBIOME » est absent de la page d'accueil"
fi
# La CSP est injectée au build : si elle manque, la configuration a sauté.
if grep -qi 'http-equiv="content-security-policy"' <<<"$accueil"; then
  echo "  ✓ la CSP est en place"
else
  signaler "la meta Content-Security-Policy est absente"
fi
# Un lien de page sans slash final coûte une 301 à chaque clic et laisse
# Apache fabriquer l'adresse d'arrivée. C'est ce qui produisait le `:443`.
# Voir `lien()` dans src/lib/base.ts.
sans_slash=$(grep -oE 'href="/[a-z0-9-]+"' <<<"$accueil" | sort -u | tr '\n' ' ')
if [ -n "$sans_slash" ]; then
  signaler "liens de page sans slash final, une 301 par clic : $sans_slash"
else
  echo "  ✓ les liens internes portent leur slash final"
fi

echo
echo "En-têtes de sécurité :"
entetes=$("${TETE[@]}" "$BASE/" | tr -d '\r')
verifier_entete() { # <nom> <fragment attendu>
  local v
  v=$(valeur "$entetes" "$1")
  if [ -z "$v" ]; then
    signaler "$1 absent"
  elif ! grep -qiF -- "$2" <<<"$v"; then
    signaler "$1 : « $v » ne contient pas « $2 »"
  else
    echo "  ✓ $1"
  fi
}
verifier_entete Strict-Transport-Security  'max-age=63072000'
verifier_entete Content-Security-Policy    "frame-ancestors 'none'"
verifier_entete X-Frame-Options            'DENY'
verifier_entete X-Content-Type-Options     'nosniff'
verifier_entete Referrer-Policy            'strict-origin-when-cross-origin'
verifier_entete Permissions-Policy         'geolocation=()'
verifier_entete Cross-Origin-Opener-Policy 'same-origin'

# Lire un en-tête de requête avec `%{HTTP:…}` dans une expression Apache en
# ajoute le nom au `Vary` de la réponse — et fait éclater le stockage de tout
# cache intermédiaire sur une dimension que le client ne fait jamais varier.
# `%{REQ_NOVARY:…}` lit la même valeur sans cet effet.
if grep -qi 'x-forwarded-proto' <<<"$(valeur "$entetes" Vary)"; then
  signaler "Vary contient X-Forwarded-Proto — une expression du .htaccess lit un en-tête avec HTTP: au lieu de REQ_NOVARY:"
else
  echo "  ✓ Vary sans X-Forwarded-Proto"
fi

echo
echo "Types MIME :"
# Apache ne connaît ni .woff2, ni .avif, ni .webmanifest : sans les `AddType`
# du .htaccess il les sert sans aucun Content-Type. Ce qui contredit le
# `nosniff` ci-dessus, et prive ces fichiers de toute durée de cache, celle-ci
# étant choisie par type MIME.
css=$(grep -oE '/_astro/[A-Za-z0-9._-]+\.css' <<<"$accueil" | head -1)
avif=$(grep -oE '/_astro/[A-Za-z0-9._-]+\.avif' <<<"$accueil" | head -1)
woff2=''
[ -n "$css" ] && woff2=$("${CURL[@]}" "$BASE$css" | grep -oE '/_astro/[A-Za-z0-9._-]+\.woff2' | head -1)

verifier_type() { # <chemin> <type attendu>
  local reel
  reel=$("${CURL[@]}" -o /dev/null -w '%{content_type}' "$BASE$1")
  if [ -z "$reel" ]; then
    signaler "$1 servi sans Content-Type — AddType manquant dans .htaccess"
  elif [ "$(tr '[:upper:]' '[:lower:]' <<<"$reel")" != "$2" ]; then
    signaler "$1 → $reel au lieu de $2"
  else
    echo "  ✓ $1 → $reel"
  fi
}
verifier_type /                 'text/html; charset=utf-8'
verifier_type /site.webmanifest 'application/manifest+json'
if [ -n "$woff2" ]; then verifier_type "$woff2" 'font/woff2'; else signaler "aucune police .woff2 trouvée dans $css"; fi
if [ -n "$avif" ]; then verifier_type "$avif" 'image/avif'; else signaler "aucune image .avif trouvée sur la page d'accueil"; fi

echo
echo "Durées de cache :"
# Les trois régimes que déclare le .htaccess, vérifiés un par un. Chacun est
# posé par un `Header always set` distinct, du plus général au plus spécifique,
# et rien dans le fichier ne dit lequel gagne réellement — c'est ici qu'on le
# constate.
#
# L'en-tête est aussi COMPTÉ. Le 3 septembre 2026, la réponse en portait deux :
# le nôtre, puis le `max-age=900` que le `mod_expires` d'OVH ajoutait à côté.
# La RFC laisse ce cas indéfini, chaque cache le tranche à sa façon, et le gain
# était annulé sans que rien ne le signale — `ExpiresActive Off` a coupé la
# source. Une valeur juste ne suffit donc pas : il faut qu'elle soit seule.
verifier_cache() { # <chemin> <valeur attendue, exacte>
  local bloc n cc
  bloc=$("${TETE[@]}" "$BASE$1" | tr -d '\r')
  n=$(grep -ci '^cache-control:' <<<"$bloc")
  cc=$(valeur "$bloc" Cache-Control)
  if [ "$n" -eq 0 ]; then
    signaler "$1 sans Cache-Control"
  elif [ "$n" -gt 1 ]; then
    signaler "$1 → $n en-têtes Cache-Control ; l'hébergeur ajoute le sien (ExpiresActive Off a-t-il sauté ?)"
  elif [ "$cc" != "$2" ]; then
    signaler "$1 → « $cc » au lieu de « $2 »"
  elif [ -n "$(valeur "$bloc" Expires)" ]; then
    signaler "$1 → Cache-Control juste, mais un Expires vient le contredire"
  else
    echo "  ✓ $1 → $cc"
  fi
}
# `_astro/` : nommé par empreinte du contenu, donc immuable — un an.
[ -n "$css" ]   && verifier_cache "$css"   'public, max-age=31536000, immutable'
[ -n "$woff2" ] && verifier_cache "$woff2" 'public, max-age=31536000, immutable'
[ -n "$avif" ]  && verifier_cache "$avif"  'public, max-age=31536000, immutable'
# Racine : nom stable d'une version à l'autre, doit pouvoir être remplacé — une heure.
verifier_cache /favicon.ico 'public, max-age=3600'
verifier_cache /og-image.jpg 'public, max-age=3600'
# HTML : porte d'entrée, une publication doit se voir vite — un quart d'heure.
verifier_cache /         'public, max-age=900'
verifier_cache /contact/ 'public, max-age=900'

# Le .htaccess promet qu'aucune adresse ne coûte plus d'un saut et que toutes
# arrivent sur la forme canonique. C'est la promesse qui était fausse : les
# pages demandées sans slash final arrivaient sur `…cambiome.fr:443/contact/`,
# Apache fabriquant l'adresse à partir du port qu'il croit servir. `curl -L`
# suivait sans rien dire — d'où le comptage des sauts et la comparaison
# d'adresse exacte.
hote=${BASE#*://}
if [ "${hote#www.}" = "$hote" ]; then
  echo
  echo "Canonicalisation : ignorée, $hote n'est pas le domaine de production."
else
  nu=${hote#www.}
  echo
  echo "Canonicalisation (cible : $BASE/contact/) :"
  for depart in "http://$nu/contact" "https://$nu/contact" \
                "http://$hote/contact" "$BASE/contact" \
                "http://$nu/contact/" "$BASE/contact/"; do
    lecture=$("${CURL[@]}" -o /dev/null -w '%{num_redirects} %{url_effective} %{http_code}' "$depart")
    # shellcheck disable=SC2086  # trois champs, découpage voulu
    set -- $lecture
    sauts=${1:-?} arrivee=${2:-} code=${3:-?}
    if [ "$code" != 200 ]; then
      signaler "$depart → $code"
    elif [ "$arrivee" != "$BASE/contact/" ]; then
      signaler "$depart → $arrivee, et non $BASE/contact/"
    elif [ "$sauts" -gt 1 ]; then
      signaler "$depart → $sauts sauts, un seul est nécessaire"
    else
      echo "  ✓ $depart → $sauts saut(s)"
    fi
  done
fi

echo
if [ "$echec" -ne 0 ]; then
  echo "Test de fumée en échec."
  exit 1
fi
echo "Test de fumée réussi."
