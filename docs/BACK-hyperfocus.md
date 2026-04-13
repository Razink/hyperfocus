# BACK-hyperfocus.md
> Spécifications backend — Application Hyperfocus
> Suivi scolaire pour collégien avec TDAH

---

## 1. Vue d'ensemble

### Type d'application
- Web + Mobile (PWA ou React Native — à définir)
- Utilisation familiale : parent + enfant sur le même compte
- Données persistantes côté serveur (pas uniquement localStorage)

### Stack envisagée (à confirmer)
- **Backend** : Node.js / Express ou équivalent
- **Base de données** : PostgreSQL ou SQLite (léger pour MVP)
- **Auth** : simple (email/password ou magic link)
- **Hébergement** : VPS Hetzner existant

---

## 2. Modèles de données

### User / Profil
```
user
  id
  name         (prénom de l'élève)
  avatar_url   (photo de profil)
  email
  password_hash
  role         (parent | eleve)
  created_at
```

### Emploi du temps
```
timetable_slot
  id
  user_id
  day          (lundi..vendredi)
  hour_index   (0..9 → 08h00..17h00)
  subject      (matière)
  remark       (optionnel)
```

### Devoirs
```
homework
  id
  user_id
  subject
  description
  due_date
  done         (boolean)
  done_at      (timestamp)
  created_at
```

### Examens
```
exam
  id
  user_id
  subject
  title
  exam_date
  revision_notes
  created_at
```

### Notes
```
grade
  id
  user_id
  subject
  value        (0.0 → 20.0)
  label        (optionnel : "Contrôle ch.4")
  coefficient  (défaut 1)
  graded_at    (date)
  created_at
```

### Points & Récompenses
```
points_log
  id
  user_id
  action       (homework_done | grade_added | streak | etc.)
  points       (valeur gagnée)
  created_at

user_stats
  user_id
  total_points
  current_streak   (jours consécutifs)
  longest_streak
  level            (1..N)
  last_active_date
  updated_at

badge
  id
  key          (identifiant unique ex: "first_homework")
  label
  description
  icon

user_badge
  user_id
  badge_id
  unlocked_at
```

---

## 3. API — Endpoints principaux

### Auth
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me
```

### Profil
```
GET    /profile
PUT    /profile
POST   /profile/avatar
```

### Emploi du temps
```
GET    /timetable
PUT    /timetable/:day/:hour_index
DELETE /timetable/:day/:hour_index
```

### Devoirs
```
GET    /homeworks
POST   /homeworks
PATCH  /homeworks/:id/done
DELETE /homeworks/:id
```

### Examens
```
GET    /exams
POST   /exams
PUT    /exams/:id
DELETE /exams/:id
```

### Notes
```
GET    /grades
GET    /grades/averages
POST   /grades
DELETE /grades/:id
```

### Points & Gamification
```
GET    /stats              (points, streak, niveau, badges)
GET    /stats/leaderboard  (si multi-profil famille)
GET    /badges
```

---

## 4. Logique de gamification (côté serveur)

### Attribution des points
Centralisée côté serveur — le client ne peut pas tricher.

| Action | Points |
|--------|--------|
| homework_done | +10 |
| homework_added | +2 |
| grade_added | +5 |
| grade_gte_15 | +20 (bonus cumulable) |
| grade_gte_18 | +50 (bonus cumulable) |
| daily_login | +5 |
| streak_7_days | +50 |
| streak_30_days | +200 |

### Calcul de niveau
- Niveau basé sur les points totaux cumulés
- Seuils à définir (ex : 0→100 : Apprenti, 100→300 : Explorateur, etc.)

### Streak
- Calculé à chaque login
- Remis à zéro si aucune activité pendant 24h
- Sauvegardé dans `user_stats.last_active_date`

---

## 5. Considérations techniques

- **Validation** des données côté serveur (valeurs notes entre 0 et 20, dates valides, etc.)
- **Pas de suppression définitive** en MVP — soft delete (deleted_at)
- **Timezone** : à gérer proprement (élève en Tunisie → UTC+1)
- **Upload avatar** : stockage local sur VPS ou service externe (Cloudinary)
- **Sécurité** : JWT avec expiration, routes protégées
