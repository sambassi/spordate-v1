# 🚀 Guide de Déploiement Vercel - Spordateur

## Étape 1 : Préparer la Base de Données

### Option A : Vercel Postgres (Recommandé)

1. Dans le dashboard Vercel, aller dans **Storage** > **Create Database**
2. Choisir **Postgres**
3. Créer la database et noter le `DATABASE_URL`

### Option B : Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Dans Settings > Database, copier la **Connection String** (mode **Transaction**)
3. Remplacer `[YOUR-PASSWORD]` par votre mot de passe

### Option C : Neon, Railway, ou autre PostgreSQL

Toute base PostgreSQL compatible fonctionnera.

---

## Étape 2 : Configurer Stripe

1. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Activer le **Mode Live**
3. Récupérer :
   - `STRIPE_SECRET_KEY` (Developers > API keys > Secret key - commence par `sk_live_`)
   - `STRIPE_PUBLISHABLE_KEY` (Developers > API keys > Publishable key - commence par `pk_live_`)

---

## Étape 3 : Déployer sur Vercel

### 3.1 Import du projet

```bash
# Option 1 : Via GitHub
git push origin main
# Puis dans Vercel : New Project > Import Git Repository

# Option 2 : Via Vercel CLI
npm i -g vercel
vercel
```

### 3.2 Configuration des variables d'environnement

Dans Vercel Dashboard > Settings > Environment Variables, ajouter :

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
```

⚠️ **Important** : Ajouter ces variables pour tous les environnements (Production, Preview, Development)

---

## Étape 4 : Initialiser la Base de Données

Une fois le premier déploiement effectué :

```bash
# Se connecter à votre projet Vercel
vercel env pull .env.local

# Générer le client Prisma
npx prisma generate

# Appliquer le schéma à la base de données
npx prisma db push

# (Optionnel) Ouvrir Prisma Studio pour voir la DB
npx prisma studio
```

---

## Étape 5 : Configurer le Webhook Stripe

1. Dans Stripe Dashboard > Developers > Webhooks
2. Cliquer **Add endpoint**
3. **URL du endpoint** : `https://votre-app.vercel.app/api/webhooks/stripe`
4. **Événements à écouter** :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copier le **Signing secret** (commence par `whsec_`)
6. L'ajouter dans Vercel comme variable `STRIPE_WEBHOOK_SECRET`

---

## Étape 6 : Créer un Utilisateur Admin

### Option 1 : Via Prisma Studio

```bash
npx prisma studio
```

1. Ouvrir la table `User`
2. Créer un nouvel enregistrement avec `role: "admin"`

### Option 2 : Via SQL direct

Connectez-vous à votre base de données et exécutez :

```sql
INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
VALUES (
  'admin-' || substr(md5(random()::text), 0, 10),
  'admin@spordateur.com',
  'Admin',
  'admin',
  NOW(),
  NOW()
);
```

---

## Étape 7 : Créer des Partenaires de Démonstration

1. Accéder à `/admin` avec le compte admin
2. Cliquer sur **Ajouter une salle**
3. Remplir :
   - Nom : "ArtBoost Paris"
   - Ville : "Paris"
   - Adresse : "42 Rue de la Danse, 75001 Paris"
   - Prix Solo : `0` (pour tester les séances gratuites)
   - Prix Duo : `0`

Répéter pour créer plusieurs salles avec des prix variés.

---

## Étape 8 : Tester l'Application

### Tests essentiels :

1. ✅ **PWA** : Installer l'app sur mobile
2. ✅ **Séance gratuite (0€)** :
   - Sélectionner un partenaire avec prix = 0
   - Vérifier que Stripe est bypassé
   - Confirmer que le ticket s'affiche
3. ✅ **Séance payante** :
   - Sélectionner un partenaire avec prix > 0
   - Tester le paiement Stripe
   - Vérifier le webhook
4. ✅ **Dashboard Admin** :
   - Modifier les prix d'un partenaire
   - Vérifier que les changements sont instantanés sur `/discovery`
5. ✅ **Ticket Digital** :
   - Tester le partage WhatsApp
   - Tester l'ajout au Google Calendar

---

## 🔧 Troubleshooting

### Erreur : "Prisma Client not found"

```bash
vercel env pull
npx prisma generate
git add -A
git commit -m "Add generated Prisma client"
git push
```

### Erreur : "Database connection failed"

Vérifier que `DATABASE_URL` est bien configuré dans Vercel et commence par `postgresql://`

### Webhook Stripe ne fonctionne pas

1. Vérifier que l'URL est correcte : `https://votre-app.vercel.app/api/webhooks/stripe`
2. Vérifier que `STRIPE_WEBHOOK_SECRET` est bien configuré
3. Tester le webhook dans Stripe Dashboard > Webhooks > Envoyer un événement test

### Le build échoue

Si le build dépasse la limite de temps de Vercel :
1. Vérifier qu'il n'y a pas d'imports circulaires
2. Simplifier les dépendances
3. Contacter le support Vercel pour augmenter la limite

---

## 📱 PWA : Notes Importantes

### Installation iOS

Sur iOS, l'installation PWA se fait via Safari :
1. Ouvrir l'app dans Safari
2. Cliquer sur l'icône Partager
3. "Ajouter à l'écran d'accueil"

### Icons PWA

Pour la production, générer des vraies icônes PNG :
1. Utiliser `public/icon.svg` comme base
2. Convertir en PNG aux tailles requises
3. Remplacer dans `public/manifest.json`

---

## 🎉 C'est terminé !

Votre application Spordateur est maintenant déployée et prête à l'emploi !

**URL Admin** : `https://votre-app.vercel.app/admin`
**URL Discovery** : `https://votre-app.vercel.app/discovery`

---

## Support

Pour toute question, consultez :
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Stripe](https://stripe.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
