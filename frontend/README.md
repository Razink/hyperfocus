# Hyperfocus Frontend

Interface web pour l'application de suivi scolaire Hyperfocus.

## Stack

- React + Vite + TypeScript
- TailwindCSS
- React Router
- Zustand (state management)
- Axios (HTTP client)
- Framer Motion (animations)
- Lucide React (icônes)

## Installation et démarrage

### Développement local

```bash
# Installer les dépendances
npm install

# Configurer l'URL de l'API dans .env
cp .env.example .env

# Démarrer en mode dev
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Avec Docker

```bash
# Build l'image
docker build -t hyperfocus-frontend .

# Lancer le container
docker run -p 5173:5173 hyperfocus-frontend
```

## Structure du projet

```
frontend/
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/           # Pages de l'application
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Subjects.tsx
│   │   └── Lessons.tsx
│   ├── services/        # Services API
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── subject.service.ts
│   │   └── lesson.service.ts
│   ├── store/           # State management (Zustand)
│   │   └── auth.store.ts
│   ├── types/           # Types TypeScript
│   │   └── index.ts
│   ├── App.tsx          # Routeur principal
│   ├── main.tsx         # Point d'entrée
│   └── index.css        # Styles globaux
├── .env                 # Variables d'environnement
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Fonctionnalités implémentées

### Module 0 - Authentification
- [x] Page de connexion
- [x] Page d'inscription
- [x] Routes protégées
- [x] Store Zustand pour l'auth
- [x] Déconnexion

### Module 1 - Matières
- [x] Liste des matières avec stats
- [x] Création/modification de matière
- [x] Sélecteur de couleur
- [x] Icône par matière
- [x] Suppression de matière
- [x] Barre de progression par matière

### Module 1 - Cours
- [x] Liste des cours d'une matière
- [x] Création/modification de cours
- [x] Upload de screenshot
- [x] Toggle "révisé"
- [x] Slider de progression (%)
- [x] Suppression de cours
- [x] Affichage des screenshots

## Design System

### Composants de base
- **Button** : Variantes primary, secondary, danger
- **Input** : Input avec label et erreur
- **Card** : Carte avec bordure colorée optionnelle
- **Modal** : Modal responsive avec backdrop
- **ProgressBar** : Barre de progression avec couleur personnalisable

### Palette de couleurs
- Primary : Indigo (#6366f1)
- Matières : Rouge, Orange, Jaune, Vert, Bleu, Violet, Rose

### Typographie
- Display : Quicksand (titres)
- Sans : Inter (texte)

## Scripts disponibles

```bash
npm run dev      # Mode développement
npm run build    # Build production
npm run preview  # Preview du build
npm run lint     # Linter ESLint
```

## Variables d'environnement

```env
VITE_API_URL=http://localhost:3000/api
```

## Écrans

### Login / Register
- Design moderne avec gradient
- Validation des formulaires
- Messages d'erreur

### Liste des Matières
- Cards colorées par matière
- Stats : nombre de cours, progression, révisés
- Modal de création/édition
- Color picker

### Cours d'une Matière
- Liste avec screenshots
- Barre de progression par cours
- Toggle révisé avec animation
- Modal d'édition avec upload

## TODO (prochaines features)

- [ ] Dashboard avec profil
- [ ] Système de points et récompenses
- [ ] Emploi du temps
- [ ] Devoirs avec urgence
- [ ] Examens avec countdown
- [ ] Notes et moyennes
- [ ] Animations confettis
- [ ] Mode sombre
