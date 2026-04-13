# Hyperfocus

Application de suivi scolaire pour collégien avec TDAH.

## Vue d'ensemble

Hyperfocus est une application web permettant à un élève de suivre ses matières, ses cours, avec un système de gamification pour maintenir l'engagement.

### Fonctionnalités actuelles (P0 + P1)

#### Module 0 - Authentification
- Inscription / Connexion
- JWT avec expiration 7 jours
- Routes protégées

#### Module 1 - Matières & Cours
- Gestion des matières (CRUD)
- Gestion des cours (CRUD)
- Upload de screenshots
- Progression par cours (%)
- Marquage "révisé"
- Stats : nombre de cours, progression globale, cours révisés

## Stack technique

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT + bcrypt
- Multer (upload)

### Frontend
- React + Vite + TypeScript
- TailwindCSS
- React Router + Zustand
- Axios + Framer Motion
- Lucide React

## Installation

### Prérequis
- Docker + Docker Compose
- Node.js 20+ (si sans Docker)
- PostgreSQL 16+ (si sans Docker)

### Lancement avec Docker

```bash
# Backend (API + PostgreSQL)
cd backend
docker-compose up -d

# Créer les tables (première fois)
docker-compose exec backend npm run prisma:migrate

# Frontend
cd ../frontend
npm install
npm run dev
```

**URLs :**
- Frontend : http://localhost:5173
- Backend API : http://localhost:3000
- Health check : http://localhost:3000/health

## Structure du projet

```
Workspace_Hyperfocus/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   ├── Dockerfile
│   └── README.md
├── docs/
│   ├── specs.md              # Spécifications techniques P0 + P1
│   ├── FRONT-hyperfocus.md   # Specs frontend complètes
│   └── BACK-hyperfocus.md    # Specs backend complètes
└── README.md                 # Ce fichier
```

## Documentation

- **[Backend README](./backend/README.md)** : API endpoints, installation, exemples
- **[Frontend README](./frontend/README.md)** : Composants, pages, installation
- **[Specs Module 1](./docs/specs.md)** : Spécifications détaillées P0 + P1

## Modules à venir

| Priorité | Module |
|----------|--------|
| P2 | Devoirs (CRUD + urgence + gamification) |
| P3 | Notes (CRUD + moyennes + graphiques) |
| P4 | Emploi du temps (grille hebdomadaire) |
| P5 | Examens (countdown + révisions) |
| P6 | Gamification complète (points, badges, streaks) |

## Quick Start

```bash
# 1. Cloner le repo
git clone <repo-url>
cd Workspace_Hyperfocus

# 2. Backend
cd backend
cp .env.example .env
docker-compose up -d
docker-compose exec backend npm run prisma:migrate

# 3. Frontend
cd ../frontend
npm install
cp .env.example .env
npm run dev

# 4. Ouvrir http://localhost:5173
```

## Contribuer

1. Créer une branche : `git checkout -b feature/ma-feature`
2. Commit : `git commit -m "feat: ma feature"`
3. Push : `git push origin feature/ma-feature`
4. Pull Request

## License

Privé - Tous droits réservés
