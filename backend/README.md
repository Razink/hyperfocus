# Hyperfocus Backend API

Backend API pour l'application de suivi scolaire Hyperfocus.

## Stack

- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Multer (upload screenshots)

## Installation et démarrage

### Avec Docker (recommandé)

```bash
# Copier le fichier .env.example vers .env
cp .env.example .env

# Démarrer les services (PostgreSQL + Backend)
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Créer les tables (première fois uniquement)
docker-compose exec backend npm run prisma:migrate

# Arrêter les services
docker-compose down
```

### Sans Docker (développement local)

```bash
# Installer les dépendances
npm install

# Configurer la base de données dans .env
# DATABASE_URL="postgresql://user:password@localhost:5432/hyperfocus"

# Générer le client Prisma
npm run prisma:generate

# Créer les tables
npm run prisma:migrate

# Démarrer en mode dev
npm run dev
```

## API Endpoints

### Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil utilisateur |

### Matières

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/subjects` | Liste des matières |
| POST | `/api/subjects` | Créer matière |
| GET | `/api/subjects/:id` | Détail matière |
| PUT | `/api/subjects/:id` | Modifier matière |
| DELETE | `/api/subjects/:id` | Supprimer matière |
| GET | `/api/subjects/:id/lessons` | Cours d'une matière |
| POST | `/api/subjects/:id/lessons` | Ajouter cours |

### Cours

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/lessons/:id` | Détail cours |
| PUT | `/api/lessons/:id` | Modifier cours |
| PATCH | `/api/lessons/:id/revised` | Toggle révisé |
| POST | `/api/lessons/:id/screenshot` | Upload screenshot |
| DELETE | `/api/lessons/:id` | Supprimer cours |

## Scripts disponibles

```bash
npm run dev              # Mode développement (hot reload)
npm run build            # Compiler TypeScript
npm start                # Démarrer en production
npm run prisma:generate  # Générer client Prisma
npm run prisma:migrate   # Créer migration
npm run prisma:studio    # Interface admin BD
```

## Variables d'environnement

```env
DATABASE_URL=postgresql://user:password@localhost:5432/hyperfocus
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
```

## Structure du projet

```
backend/
├── src/
│   ├── controllers/     # Logique des routes
│   ├── routes/          # Définition des routes
│   ├── services/        # Logique métier
│   ├── middleware/      # Auth, upload, etc.
│   ├── utils/           # Helpers (prisma, jwt, hash)
│   └── index.ts         # Point d'entrée
├── prisma/
│   └── schema.prisma    # Schéma de la base
├── uploads/             # Screenshots uploadés
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Health Check

```bash
curl http://localhost:3000/health
```

## Exemples de requêtes

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Yassine","email":"yassine@example.com","password":"test123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yassine@example.com","password":"test123"}'
```

### Créer une matière
```bash
curl -X POST http://localhost:3000/api/subjects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mathématiques","color":"#ef4444","icon":"📐"}'
```
