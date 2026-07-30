# ReputationPilot — bloc 1 : structure + authentification

## Ce que ce bloc contient
- Un projet Next.js 15 (App Router) + TypeScript + Tailwind
- L'authentification complète par email/mot de passe via Supabase
- Un dashboard protégé (redirige vers /login si non connecté)

## Mise en route (à faire une seule fois)

### 1. Créer un projet Supabase
1. Va sur https://supabase.com et crée un compte + un nouveau projet (gratuit).
2. Dans "Project Settings > API", copie l'URL et la clé "anon public".
3. Colle-les dans un fichier `.env.local` (copie `.env.local.example` et renomme-le).
4. Dans Supabase, va dans "Authentication > URL Configuration" et ajoute
   `http://localhost:3000/auth/callback` dans les Redirect URLs (et l'URL de
   ton domaine de production plus tard).

### 2. Installer et lancer en local
Si tu utilises un environnement en ligne avec accès réseau (Replit, Bolt.new,
StackBlitz, ou ton propre poste avec Node.js installé) :

```bash
npm install
npm run dev
```

Puis ouvre http://localhost:3000/signup pour créer ton premier compte.

### 3. Pousser sur GitHub (pour le déploiement Vercel plus tard)
1. Crée un nouveau dépôt vide sur https://github.com
2. Depuis ce dossier :
```bash
git init
git add .
git commit -m "Bloc 1 : structure + authentification"
git branch -M main
git remote add origin <URL_DE_TON_DEPOT>
git push -u origin main
```

## Bloc 2 : Places API + vrais avis

### Mise en route supplémentaire
1. Dans Supabase, va dans "SQL Editor" et exécute le contenu de
   `supabase/migrations/0001_init.sql` pour créer les tables.
2. Crée une clé API sur https://console.cloud.google.com :
   - Active l'API "Places API (New)"
   - Crée une clé API (Credentials > Create Credentials > API Key)
   - Restreins-la à cette API uniquement pour la sécurité
   - Colle-la dans `.env.local` sous `GOOGLE_PLACES_API_KEY`
3. Relance `npm run dev`, connecte-toi, tu seras redirigé vers
   `/dashboard/connect` pour rechercher et lier ton établissement.

### Limite connue (assumée, voir stratégie discutée)
Cette version lit les avis (jusqu'à 5, les plus récents, fournis par Google)
mais ne peut PAS poster de réponse automatiquement sur Google — c'est une
limite de la Places API, pas un bug. L'utilisateur marque manuellement un
avis comme "répondu" après avoir copié la réponse suggérée sur sa fiche
Google. Le prochain bloc ajoute la génération de cette réponse par IA.

## Bloc 3 : réponses générées par IA

### Mise en route supplémentaire
1. Exécute `supabase/migrations/0002_ai_draft.sql` dans le "SQL Editor" Supabase.
2. Crée une clé sur https://console.anthropic.com et colle-la dans
   `.env.local` sous `ANTHROPIC_API_KEY`.
3. `npm run dev` : le bouton "Draft reply with AI" ouvre une modal avec un
   brouillon éditable, une option "Regenerate", et un bouton "Copy reply".

## Bloc 4 : paiements Stripe

### Mise en route supplémentaire
1. Exécute `supabase/migrations/0003_billing.sql` dans le "SQL Editor" Supabase.
   Ça crée la table `accounts` ET un trigger qui démarre automatiquement
   l'essai de 14 jours pour chaque nouvel inscrit.
2. Dans Supabase, "Project Settings > API", copie la clé "service_role"
   (⚠️ secrète, jamais exposée au navigateur) dans `.env.local` sous
   `SUPABASE_SERVICE_ROLE_KEY`.
3. Crée un compte sur https://dashboard.stripe.com (mode Test pour commencer).
4. Dans "Product catalog", crée deux produits avec abonnement mensuel :
   - Starter — 19$/mois
   - Pro — 39$/mois
   Copie l'ID de prix de chacun (commence par `price_...`) dans
   `.env.local` (`STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`).
5. Copie ta clé secrète Stripe (Developers > API keys) dans
   `STRIPE_SECRET_KEY`.
6. Pour tester le webhook en local, installe le Stripe CLI puis lance :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Ça t'affiche un `whsec_...` à coller dans `STRIPE_WEBHOOK_SECRET`.
   (En production, tu créeras un vrai endpoint webhook dans le dashboard
   Stripe pointant vers ton domaine, à l'étape déploiement.)
7. `npm run dev`, va sur `/dashboard/billing` pour tester un abonnement
   (utilise une carte de test Stripe : 4242 4242 4242 4242, n'importe
   quelle date future, n'importe quel CVC).

### Comportement mis en place
- Chaque inscription démarre automatiquement un essai de 14 jours (aucune
  carte demandée).
- Si l'essai expire sans abonnement actif, l'utilisateur est redirigé vers
  `/dashboard/billing` au lieu du dashboard.
- Le webhook Stripe (`/api/stripe/webhook`) garde le statut à jour
  automatiquement, y compris en cas d'annulation.

## Bloc 5 : landing page publique
La page `/` (racine du site) est maintenant la landing page marketing :
hero, comparaison avant/après, fonctionnalités, pricing (aligné sur les
plans Stripe créés au bloc 4). Rien à configurer, elle fonctionne dès que
le projet tourne.

## Bloc 6 : alertes email pour les nouveaux avis

### Comment ça marche (important à comprendre)
Google ne pousse pas de notification en temps réel — il faut interroger
l'API régulièrement et comparer avec les avis déjà connus. C'est ce que
fait la route `/api/cron/sync-reviews`, planifiée via `vercel.json`.

### Mise en route supplémentaire
1. Crée un compte sur https://resend.com, vérifie un domaine (ou utilise
   leur domaine de test pour commencer), copie la clé API dans
   `.env.local` sous `RESEND_API_KEY`.
2. Adapte l'adresse `from:` dans `lib/resend/client.ts` à ton propre
   domaine vérifié.
3. Définis toi-même une variable `CRON_SECRET` dans Vercel (n'importe quelle
   chaîne longue et aléatoire de ton choix). Vercel l'enverra automatiquement
   dans l'en-tête `Authorization` lors de l'appel du cron — mais c'est bien à
   toi de créer cette variable, elle n'est pas générée automatiquement.
   En local, mets la même valeur dans `.env.local` et teste avec :
   `curl -H "Authorization: Bearer TA_VALEUR" http://localhost:3000/api/cron/sync-reviews`

### Limite assumée : fréquence des alertes
Le plan Vercel gratuit (Hobby) limite les cron jobs à **une exécution par
jour**. Concrètement : sur ce plan, tes clients reçoivent une alerte au
maximum une fois par jour, pas en temps réel. Deux options si tu veux
plus réactif sans attendre une V2 :
- Passer au plan Vercel Pro (20$/mois) pour un cron toutes les minutes si besoin
- Utiliser un service de cron externe gratuit (ex : cron-job.org) qui
  appelle `/api/cron/sync-reviews` toutes les heures — le code ne change
  pas, seul le déclencheur change. Dans ce cas, protège la route avec ton
  propre secret plutôt que `CRON_SECRET` (réservé aux crons Vercel).

Un bouton "Sync now" a aussi été ajouté dans le dashboard pour que
l'utilisateur puisse forcer une vérification manuelle à tout moment.

## Bloc bonus : outil gratuit "audit de réputation" (`/audit`)
Page publique, sans inscription, qui affiche un score de réputation basé
sur la note et le nombre d'avis Google d'un commerce, pensée comme aimant
à prospects (CTA vers `/signup`).

⚠️ **Point d'attention avant la mise en ligne publique** : les routes
`/api/audit/search` et `/api/audit/report` sont volontairement
accessibles sans connexion — ce qui veut aussi dire que n'importe qui
peut les appeler en boucle et faire grimper ta facture Places API. Avant
de partager ce lien largement (réseaux sociaux, pub), ajoute une
protection basique : un rate-limit par IP (ex : package `@upstash/ratelimit`
avec Redis, gratuit sur Vercel) ou un captcha simple (Cloudflare Turnstile,
gratuit) devant le formulaire. Pas bloquant pour tester en petit comité,
mais à faire avant une vraie mise en avant publique.

## Ce qui n'est PAS encore inclus
Rien côté produit principal — les 6 blocs de développement sont terminés.
Reste le déploiement (`DEPLOY.md`) et, pour l'outil d'audit, la protection
anti-abus mentionnée ci-dessus.

## Structure des fichiers
```
app/
  layout.tsx          → layout racine
  globals.css         → styles Tailwind
  signup/page.tsx      → inscription
  login/page.tsx       → connexion
  auth/callback/route.ts → confirmation email
  dashboard/page.tsx    → dashboard protégé
  dashboard/logout-button.tsx
lib/supabase/
  client.ts            → client Supabase navigateur
  server.ts             → client Supabase serveur
middleware.ts           → protège les routes /dashboard
```
