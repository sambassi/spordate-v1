# Spordateur - Sport Dating PWA

Application Progressive Web App (PWA) pour rencontres sportives et réservations de séances.

## 🚀 Déploiement sur Vercel

### 1. Prérequis

- Compte Vercel
- Base de données PostgreSQL (Vercel Postgres, Supabase, ou autre)
- Compte Stripe (Live keys)

### 2. Variables d'environnement requises

Configurez ces variables dans Vercel :

```bash
DATABASE_URL="postgresql://..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Après création du webhook
NEXT_PUBLIC_APP_URL="https://votre-app.vercel.app"
```

### 3. Déploiement

1. **Importer le projet sur Vercel**
   ```bash
   vercel import
   ```

2. **Configurer les variables d'environnement** dans le dashboard Vercel

3. **Déployer**
   ```bash
   vercel --prod
   ```

4. **Initialiser la base de données**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Configurer Stripe Webhook**
   - URL: `https://votre-app.vercel.app/api/webhooks/stripe`
   - Événements: `checkout.session.completed`, `payment_intent.succeeded`

## 🏗️ Architecture

### Pages principales

- `/discovery` - Page d'accueil avec profils et réservations
- `/admin` - Dashboard administrateur complet
- `/success` - Page de confirmation avec ticket digital

### Features PWA

- ✅ Installation sur mobile/PC
- ✅ Splash screen violet (#7B1FA2)
- ✅ Manifest configuré
- ✅ Service Worker automatique

### Dashboard Admin

Accès: `/admin`

Fonctionnalités:
- 🏢 Gestion des partenaires (Nom, Adresse, Prix Solo/Duo)
- 👥 Gestion des utilisateurs
- 🎫 Liste des réservations
- 📊 Statistiques globales
- ⚙️ Paramètres du site

### Système de paiement

- **Prix 0€** → Bypass Stripe, confirmation directe
- **Prix > 0€** → Redirection Stripe Checkout

Les prix sont **dynamiques** et configurables par partenaire dans l'admin.

## 📱 PWA Features

### Installation

L'application peut être installée comme une app native sur :
- 📱 iOS (Safari > Partager > Ajouter à l'écran d'accueil)
- 🤖 Android (Chrome > Menu > Installer l'application)
- 💻 Desktop (Chrome > Installer Spordateur)

### Splash Screen

Écran de démarrage violet avec logo animé pendant 1.5s

### Notifications

- Toast notifications avec Sonner
- Confirmation de réservation
- Erreurs et succès

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npx prisma generate
npx prisma db push
npx prisma studio
```

## 📦 Structure du projet

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/          # Stripe checkout
│   │   ├── partners/          # API partenaires
│   │   └── admin/             # API admin
│   ├── admin/                 # Dashboard admin
│   ├── discovery/             # Page principale
│   └── success/               # Page de confirmation
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── SplashScreen.tsx       # PWA splash screen
│   └── SkeletonLoaders.tsx    # Loading states
├── lib/
│   ├── prisma-helpers.ts      # Database helpers
│   └── db.ts                  # Legacy Firebase helpers
└── hooks/
    └── use-confetti.ts        # Confetti animations
```

## 🔐 Sécurité

- Toutes les API admin sont protégées
- Validation des prix côté serveur
- Stripe en mode Live uniquement
- Variables d'environnement sécurisées

## 📝 License

Propriétaire - Spordateur © 2024
