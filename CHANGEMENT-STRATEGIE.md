# Pourquoi le produit a changé (juillet 2026)

## Ce qu'on a découvert
La Google Places API (New) renvoie bien la **note moyenne** et le **nombre
total d'avis** d'un commerce, mais **pas le texte des avis** — vérifié en
appelant l'API directement, avec une clé valide, sur un commerce qui a
pourtant 5983 avis. Aucune erreur retournée : le champ `reviews` est
simplement absent de la réponse.

La cause exacte n'est pas confirmée (probablement lié au compte de
facturation européen). À vérifier auprès du support Google Maps Platform.

## Ce que le produit fait maintenant
- Relève chaque jour la note et le nombre d'avis (table `snapshots`)
- Détecte un nouvel avis (le compteur augmente) et une baisse de note
- Envoie une alerte email au commerçant dans ce cas
- Affiche l'historique de la note dans le temps
- Page `/dashboard/compose` : le commerçant colle le texte de l'avis
  (lu sur sa fiche Google), l'IA rédige la réponse

## Ce que le produit ne fait plus
- Afficher la liste des avis dans le dashboard (impossible sans le texte)
- Le widget "preuve sociale" du plan Pro (à retirer de l'offre ou à
  repenser : afficher seulement la note et le nombre d'avis reste possible)

## Prochaine étape stratégique
Demander l'accès à la **Google Business Profile API**, qui est l'API conçue
pour ce cas d'usage : elle donne accès aux avis du commerce lui-même ET
permet d'y répondre directement. Prérequis : gérer un profil Google Business
vérifié depuis plus de 60 jours.

→ **Créer ce profil dès maintenant** pour lancer le compteur. Le produit
actuel permet de tester le marché pendant ces 60 jours.

## Migration à exécuter
Dans le SQL Editor de Supabase : `supabase/migrations/0004_snapshots.sql`
