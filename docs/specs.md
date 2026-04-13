# Hyperfocus - Spécifications Techniques et Fonctionnelles
> Application de suivi scolaire pour collégien avec TDAH

---

## Vue d'ensemble

### Objectif
Application web (PWA) permettant à un collégien TDAH de suivre ses matières, cours, devoirs et notes avec un système de gamification pour maintenir l'engagement.

### Stack technique

| Couche | Technologies |
|--------|--------------|
| **Backend** | Node.js, Express, TypeScript |
| **ORM** | Prisma |
| **Base de données** | PostgreSQL |
| **Auth** | JWT (jsonwebtoken), bcrypt |
| **Upload** | Multer |
| **Frontend** | React, Vite, TypeScript |
| **Styling** | TailwindCSS |
| **State** | Zustand |
| **Animations** | Framer Motion |
| **HTTP Client** | Axios |

### Structure du projet
```
Workspace_Hyperfocus/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── App.tsx
│   └── package.json
└── docs/
```

---

# MODULE 0 : Authentification

## Fonctionnalités

### F0.1 - Inscription
- L'utilisateur peut créer un compte avec : prénom, email, mot de passe
- Le mot de passe est hashé (bcrypt) avant stockage
- Un JWT est retourné à la création

### F0.2 - Connexion
- L'utilisateur se connecte avec email + mot de passe
- Retourne un JWT valide 7 jours
- Message d'erreur générique si échec (sécurité)

### F0.3 - Session
- Le JWT est stocké côté client (localStorage)
- Envoyé dans le header `Authorization: Bearer <token>`
- Middleware vérifie et décode le token sur les routes protégées

## Modèle de données

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String   @map("password_hash")
  avatarUrl    String?  @map("avatar_url")
  role         Role     @default(ELEVE)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  subjects     Subject[]

  @@map("users")
}

enum Role {
  ELEVE
  PARENT
}
```

## API Endpoints

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/auth/register` | Inscription | Non |
| POST | `/api/auth/login` | Connexion | Non |
| GET | `/api/auth/me` | User courant | Oui |
| PUT | `/api/auth/profile` | Modifier profil | Oui |

### POST /api/auth/register

**Request:**
```json
{
  "name": "Yassine",
  "email": "yassine@example.com",
  "password": "monmotdepasse123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Yassine",
    "email": "yassine@example.com",
    "role": "ELEVE"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /api/auth/login

**Request:**
```json
{
  "email": "yassine@example.com",
  "password": "monmotdepasse123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Yassine",
    "email": "yassine@example.com",
    "role": "ELEVE"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /api/auth/me

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Yassine",
  "email": "yassine@example.com",
  "avatarUrl": null,
  "role": "ELEVE"
}
```

---

# MODULE 1 : Matières et Cours

## Fonctionnalités

### F1.1 - Liste des matières
- Affiche toutes les matières de l'utilisateur
- Chaque matière a un nom et une couleur personnalisée
- Affiche le nombre de cours par matière
- Affiche le % de progression global (moyenne des cours)

### F1.2 - Gestion des matières
- Créer une nouvelle matière (nom + couleur)
- Modifier une matière existante
- Supprimer une matière (et ses cours associés)

### F1.3 - Liste des cours d'une matière
- Affiche tous les cours d'une matière
- Pour chaque cours :
  - **Titre** du cours
  - **Pourcentage écrit** (0-100%) avec barre de progression
  - **Screenshot** du cours (thumbnail cliquable)
  - **Icône révisé** : ✓ vert si révisé, ✗ gris sinon
- Tri par ordre personnalisé (drag & drop futur) ou par date

### F1.4 - Gestion des cours
- Ajouter un cours à une matière
- Modifier : titre, pourcentage, screenshot
- Marquer comme révisé / non révisé
- Supprimer un cours

### F1.5 - Upload screenshot
- Upload d'une image (JPG, PNG, max 5MB)
- Stockage sur le serveur dans `/uploads/screenshots/`
- Génération d'un thumbnail (optionnel MVP)

## Modèles de données

```prisma
model Subject {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  name      String
  color     String   @default("#6366f1") // Couleur hex
  icon      String?  // Emoji ou nom d'icône (optionnel)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessons Lesson[]

  @@map("subjects")
}

model Lesson {
  id              String    @id @default(uuid())
  subjectId       String    @map("subject_id")
  title           String
  order           Int       @default(0)
  contentPercent  Int       @default(0) @map("content_percent") // 0-100
  screenshotUrl   String?   @map("screenshot_url")
  isRevised       Boolean   @default(false) @map("is_revised")
  revisedAt       DateTime? @map("revised_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  subject Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@map("lessons")
}
```

## API Endpoints

### Matières

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/api/subjects` | Liste des matières | Oui |
| POST | `/api/subjects` | Créer matière | Oui |
| GET | `/api/subjects/:id` | Détail matière | Oui |
| PUT | `/api/subjects/:id` | Modifier matière | Oui |
| DELETE | `/api/subjects/:id` | Supprimer matière | Oui |

### Cours

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/api/subjects/:subjectId/lessons` | Cours d'une matière | Oui |
| POST | `/api/subjects/:subjectId/lessons` | Ajouter cours | Oui |
| GET | `/api/lessons/:id` | Détail cours | Oui |
| PUT | `/api/lessons/:id` | Modifier cours | Oui |
| PATCH | `/api/lessons/:id/revised` | Toggle révisé | Oui |
| DELETE | `/api/lessons/:id` | Supprimer cours | Oui |
| POST | `/api/lessons/:id/screenshot` | Upload screenshot | Oui |

### Détails des endpoints

#### GET /api/subjects

**Response (200):**
```json
{
  "subjects": [
    {
      "id": "uuid",
      "name": "Mathématiques",
      "color": "#ef4444",
      "icon": "📐",
      "lessonsCount": 5,
      "progressPercent": 68,
      "revisedCount": 3
    },
    {
      "id": "uuid",
      "name": "Français",
      "color": "#3b82f6",
      "icon": "📚",
      "lessonsCount": 8,
      "progressPercent": 45,
      "revisedCount": 2
    }
  ]
}
```

#### POST /api/subjects

**Request:**
```json
{
  "name": "Histoire-Géo",
  "color": "#f59e0b",
  "icon": "🌍"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Histoire-Géo",
  "color": "#f59e0b",
  "icon": "🌍",
  "lessonsCount": 0,
  "progressPercent": 0,
  "revisedCount": 0
}
```

#### GET /api/subjects/:subjectId/lessons

**Response (200):**
```json
{
  "subject": {
    "id": "uuid",
    "name": "Mathématiques",
    "color": "#ef4444"
  },
  "lessons": [
    {
      "id": "uuid",
      "title": "Chapitre 1 - Les fractions",
      "order": 1,
      "contentPercent": 100,
      "screenshotUrl": "/uploads/screenshots/abc123.jpg",
      "isRevised": true,
      "revisedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "title": "Chapitre 2 - Équations",
      "order": 2,
      "contentPercent": 50,
      "screenshotUrl": null,
      "isRevised": false,
      "revisedAt": null
    }
  ]
}
```

#### POST /api/subjects/:subjectId/lessons

**Request:**
```json
{
  "title": "Chapitre 3 - Géométrie",
  "contentPercent": 0
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Chapitre 3 - Géométrie",
  "order": 3,
  "contentPercent": 0,
  "screenshotUrl": null,
  "isRevised": false,
  "revisedAt": null
}
```

#### PUT /api/lessons/:id

**Request:**
```json
{
  "title": "Chapitre 3 - Géométrie dans le plan",
  "contentPercent": 75
}
```

#### PATCH /api/lessons/:id/revised

**Request:**
```json
{
  "isRevised": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "isRevised": true,
  "revisedAt": "2024-01-20T14:00:00Z"
}
```

#### POST /api/lessons/:id/screenshot

**Request:** `multipart/form-data`
- Field: `screenshot` (file)

**Response (200):**
```json
{
  "screenshotUrl": "/uploads/screenshots/def456.jpg"
}
```

---

## Écrans Frontend

### Page 1 : Liste des Matières (`/subjects`)

```
┌─────────────────────────────────────┐
│  Mes Matières                    +  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📐 Mathématiques          68%  │ │
│ │ ████████████░░░░░  5 cours     │ │
│ │ 3/5 révisés                    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 📚 Français               45%  │ │
│ │ █████████░░░░░░░░  8 cours     │ │
│ │ 2/8 révisés                    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🌍 Histoire-Géo           20%  │ │
│ │ ████░░░░░░░░░░░░░  3 cours     │ │
│ │ 0/3 révisés                    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Interactions :**
- Clic sur carte → navigate vers `/subjects/:id`
- Clic sur `+` → modal création matière
- Long press / menu → modifier / supprimer

### Page 2 : Cours d'une Matière (`/subjects/:id`)

```
┌─────────────────────────────────────┐
│ ← Mathématiques              + Add  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [IMG]  Ch.1 - Fractions        │ │
│ │        ████████████████ 100%   │ │
│ │        ✓ Révisé                │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [IMG]  Ch.2 - Équations        │ │
│ │        ████████░░░░░░░░  50%   │ │
│ │        ○ Non révisé            │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [---]  Ch.3 - Géométrie        │ │
│ │        ░░░░░░░░░░░░░░░░   0%   │ │
│ │        ○ Non révisé            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Interactions :**
- Clic sur carte → modal édition cours
- Clic sur `[IMG]` → affiche screenshot plein écran
- Clic sur checkbox révisé → toggle immédiat
- Slider ou input pour modifier %

### Modal : Créer/Éditer Matière

```
┌─────────────────────────────────────┐
│ Nouvelle Matière              ✕     │
├─────────────────────────────────────┤
│ Nom                                 │
│ ┌─────────────────────────────────┐ │
│ │ Mathématiques                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Couleur                             │
│ 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪             │
│                                     │
│ Icône (optionnel)                   │
│ ┌─────────────────────────────────┐ │
│ │ 📐                              │ │
│ └─────────────────────────────────┘ │
│                                     │
│        [ Annuler ]  [ Créer ]       │
└─────────────────────────────────────┘
```

### Modal : Créer/Éditer Cours

```
┌─────────────────────────────────────┐
│ Nouveau Cours                 ✕     │
├─────────────────────────────────────┤
│ Titre                               │
│ ┌─────────────────────────────────┐ │
│ │ Chapitre 1 - Les fractions     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Progression : 50%                   │
│ ○────────●────────○                 │
│ 0%      50%     100%                │
│                                     │
│ Screenshot                          │
│ ┌─────────────────────────────────┐ │
│ │    📷 Ajouter une image         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ☑ Cours révisé                      │
│                                     │
│        [ Annuler ]  [ Sauver ]      │
└─────────────────────────────────────┘
```

---

## Règles de validation

### Matière
| Champ | Règles |
|-------|--------|
| name | Requis, 1-100 caractères |
| color | Requis, format hex (#RRGGBB) |
| icon | Optionnel, max 10 caractères |

### Cours
| Champ | Règles |
|-------|--------|
| title | Requis, 1-200 caractères |
| contentPercent | Entier 0-100 |
| screenshot | JPG/PNG, max 5MB |

---

## Codes d'erreur API

| Code | Signification |
|------|---------------|
| 400 | Données invalides |
| 401 | Non authentifié |
| 403 | Non autorisé (ressource d'un autre user) |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

**Format erreur :**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Le nom de la matière est requis",
    "field": "name"
  }
}
```
