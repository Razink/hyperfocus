# FRONT-hyperfocus.md
> Spécifications frontend — Application Hyperfocus
> Suivi scolaire pour collégien avec TDAH

---

## 1. Identité visuelle

### Philosophie
- Interface **colorée, vivante, énergique** — pas un outil scolaire austère
- Chaque écran doit donner envie d'être ouvert
- Iconographie expressive et colorée (pas des icônes grises génériques)
- Ambiance "jeu / progression" plutôt que "cahier de textes"

### Palette
- Couleurs vives et saturées, une couleur dominante par matière
- Fond sombre ou fond clair au choix (à définir)
- Accents lumineux pour les éléments de récompense (or, jaune, orange)

### Typographie
- Police ronde et lisible, accessible pour profil TDAH
- Titres grands et contrastés
- Pas de murs de texte — hiérarchie visuelle forte

---

## 2. Structure de navigation

5 onglets principaux (barre de navigation basse) :

| Onglet | Icône | Contenu |
|--------|-------|---------|
| Accueil / Dashboard | 🏠 | Profil, points, encouragements, résumé du jour |
| Emploi du temps | 📅 | Grille semaine interactive |
| Devoirs | 📝 | Liste avec urgence visuelle |
| Examens | 📋 | Calendrier avec compte à rebours |
| Notes | 📊 | Moyennes, progression, historique |

---

## 3. Écrans

### 3.1 Dashboard (écran principal)
- **Photo de profil** de l'élève (grande, bien visible)
- **Prénom** affiché en grand
- **Message d'encouragement dynamique** — change à chaque ouverture ou selon la performance
  - Exemples : *"Bien joué champion !"*, *"Tu assures !"*, *"En forme aujourd'hui ?"*, *"Allez, on y va !"*
- **Compteur de points** bien visible (XP, étoiles ou autre — à définir)
- **Résumé du jour** : cours du jour, devoirs urgents
- **Streak** (jours consécutifs d'utilisation) — important pour l'engagement TDAH

### 3.2 Emploi du temps
- Grille semaine (Lundi → Vendredi)
- Chaque case cliquable pour ajouter/modifier un cours
- Couleur par matière
- Mise en valeur du jour actuel

### 3.3 Devoirs
- Liste triée par urgence
- Indicateur visuel fort : vert / orange / rouge selon délai
- Case à cocher → animation de validation + gain de points immédiat
- Filtre : À faire / Fait / Tout

### 3.4 Examens
- Carte par examen avec compte à rebours (J−N)
- Notes de révision associées
- Alerte visuelle quand < 3 jours

### 3.5 Notes
- Moyenne par matière avec barre de progression colorée
- Historique des notes
- Moyenne générale en grand sur le dashboard
- Évolution dans le temps (graphique simple)

---

## 4. Système de points & récompenses

> C'est la colonne vertébrale de l'app — pas un ajout cosmétique.

### Principe
Chaque action rapporte des points immédiatement avec feedback visuel (animation, son optionnel).

### Actions récompensées (exemples à affiner)
| Action | Points |
|--------|--------|
| Cocher un devoir comme fait | +10 pts |
| Ajouter un devoir | +2 pts |
| Renseigner une note | +5 pts |
| Ouvrir l'app (streak journalier) | +5 pts |
| Streak 7 jours consécutifs | +50 pts bonus |
| Note ≥ 15/20 | +20 pts |
| Note ≥ 18/20 | +50 pts |

### Niveaux / Badges
- Système de niveaux (ex : Apprenti → Explorateur → Champion → Légende)
- Badges débloquables (premier devoir coché, première bonne note, etc.)
- Affichage des badges sur le profil

### Feedback immédiat (crucial pour TDAH)
- Animation "+10 pts" qui s'envole à chaque action
- Son de validation optionnel
- Confettis ou effet visuel sur les jalons importants

---

## 5. Considérations TDAH

- **Pas de surcharge cognitive** : une info principale par écran
- **Feedback immédiat** sur chaque action
- **Micro-objectifs** visibles (pas juste une moyenne annuelle)
- **Couleurs et icônes** comme repères visuels (pas uniquement du texte)
- **Messages positifs** — jamais de formulation négative
- **Animations courtes** — engagement sans distraction excessive
