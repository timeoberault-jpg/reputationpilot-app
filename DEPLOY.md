# Déploiement en production

## 1. Pousser le code sur GitHub (si pas déjà fait)
```bash
cd reputationpilot
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<ton-compte>/reputationpilot.git
git push -u origin main
```

## 2. Importer le projet sur Vercel
1. Va sur https://vercel.com, connecte-toi avec GitHub.
2. "Add New Project" → sélectionne le dépôt `reputationpilot`.
3. Vercel détecte automatiquement Next.js, aucune configuration de build
   à changer.
4. **Avant de cliquer "Deploy"**, ajoute toutes les variables
   d'environnement (section "Environment Variables") — reprends chaque
   ligne de ton `.env.local`, plus :
   - `NEXT_PUBLIC_APP_URL` → mets ton futur domaine définitif dès
     maintenant (ex : `https://reputationpilot.app`), pas `localhost`.
5. Clique "Deploy". Au bout d'environ une minute, ton app est en ligne
   sur une URL `https://reputationpilot-xxxx.vercel.app`.

## 3. Brancher ton nom de domaine
1. Achète un domaine (Namecheap, ou directement dans Vercel : Project
   Settings > Domains).
2. Dans Vercel, "Project Settings > Domains", ajoute ton domaine.
3. Vercel te donne les enregistrements DNS à créer chez ton registrar
   (généralement un enregistrement A ou CNAME) — suis les instructions
   affichées, la propagation prend de quelques minutes à quelques heures.
4. Une fois actif, retourne dans les variables d'environnement Vercel et
   mets à jour `NEXT_PUBLIC_APP_URL` avec ce domaine définitif, puis
   redéploie (Vercel le propose automatiquement).

## 4. Mettre à jour Supabase pour la production
1. Dans ton projet Supabase, "Authentication > URL Configuration" :
   - Site URL : ton domaine de production
   - Redirect URLs : ajoute `https://tondomaine.com/auth/callback` (garde
     aussi celle de localhost si tu continues à développer en local)

## 5. Passer Stripe en mode Live
Tant que tu testais, tu étais en mode Test (clés commençant par
`sk_test_...`). Pour accepter de vrais paiements :
1. Dans le dashboard Stripe, bascule le switch "Test mode" → "Live mode"
   (en haut à droite).
2. Recrée tes deux produits (Starter/Pro) en mode Live — les IDs de prix
   sont différents du mode Test.
3. Récupère ta clé secrète **Live** (`sk_live_...`) et mets à jour
   `STRIPE_SECRET_KEY` et `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_PRO` dans
   Vercel.
4. Crée un vrai endpoint webhook (Developers > Webhooks > Add endpoint) :
   - URL : `https://tondomaine.com/api/stripe/webhook`
   - Événements à écouter : `checkout.session.completed`,
     `customer.subscription.updated`, `customer.subscription.deleted`
   - Copie le "Signing secret" (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET`
     sur Vercel.
5. Redéploie après chaque changement de variable d'environnement.

## 6. Vérifier le cron
Une fois déployé, Vercel active automatiquement le cron défini dans
`vercel.json` (visible dans Project Settings > Cron Jobs). `CRON_SECRET`
est injecté automatiquement par Vercel, rien à configurer.

## 7. Checklist finale avant d'annoncer le lancement
- [ ] Inscription + connexion fonctionnent sur le vrai domaine
- [ ] Connexion d'un vrai commerce Google fonctionne
- [ ] Un vrai paiement test passe (utilise ta propre carte, annule juste après)
- [ ] Le portail client Stripe permet bien d'annuler
- [ ] L'email d'alerte arrive bien (déclenche `/api/cron/sync-reviews`
      manuellement une fois pour vérifier, avec le bon `CRON_SECRET`)
- [ ] La landing page s'affiche correctement sur mobile
