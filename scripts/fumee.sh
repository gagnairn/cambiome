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
# Derrière un proxy d'entreprise qui intercepte TLS, exporter
# FUMEE_CURL_OPTS=-k pour tester en local. À n'utiliser que là : en CI, la
# vérification du certificat doit rester active.

set -uo pipefail

BASE="${1:?Usage: fumee.sh <url-du-site>}"
BASE="${BASE%/}"

# shellcheck disable=SC2206  # découpage en mots voulu
CURL=(curl -sS -L --max-time 20 ${FUMEE_CURL_OPTS:-})

echec=0
signaler() {
  echo "  ✗ $1"
  echec=1
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

echo
echo "Pages et ressources :"
# Les liens du site pointent vers /contact sans slash final et Pages redirige en
# 301 : `curl -L` suit, on vérifie le code d'arrivée.
# Liste explicite plutôt que déduite du sitemap : /merci en est volontairement
# absent, et une page qu'on oublierait d'ajouter ici serait de toute façon
# rattrapée par le vérificateur de liens au build.
for chemin in "" contact metiers realisations demarche rge-qualibat \
              mentions-legales merci \
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
echo "Page 404 :"
code=$("${CURL[@]}" -o /dev/null -w '%{http_code}' "$BASE/cette-page-nexiste-pas")
if [ "$code" = 404 ]; then
  echo "  ✓ une URL inconnue répond bien 404"
else
  signaler "une URL inconnue répond $code au lieu de 404"
fi

echo
echo "Contenu de la page d'accueil :"
accueil=$("${CURL[@]}" "$BASE/")
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

echo
if [ "$echec" -ne 0 ]; then
  echo "Test de fumée en échec."
  exit 1
fi
echo "Test de fumée réussi."
