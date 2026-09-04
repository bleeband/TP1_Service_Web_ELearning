# Académie en Ligne — Laboratoire 2 (Service Web 25604)

Plateforme d'apprentissage en ligne (*mini-Moodle*) développée avec **Next.js Full-Stack (App Router + React + API Routes)**, **Prisma ORM**, **Neon PostgreSQL**, **Axios**, **bcryptjs** et **JWT**.

## 👥 Équipe

- **Eva Bessette**
- **Charles Legeault**
- **Marc-André Dufour**

---

## 🚀 Démarrage rapide

### 1. Cloner et installer les dépendances

```bash
git clone https://github.com/bleeband/TP1_Service_Web_ELearning.git
cd TP1_Service_Web_ELearning
npm install
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine à partir du modèle `.env.example` :

```env
DATABASE_URL="postgresql://utilisateur:motdepasse@ep-xyz.neon.tech/neondb?sslmode=require"
JWT_SECRET="votre_cle_secrete_jwt"
PORT=3000
TRIVIA_API="https://opentdb.com/api.php"
```

### 3. Migration de la base de données

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Pile technologique

- **Framework Full-Stack** : Next.js 16 (App Router + API Routes)
- **Frontend** : React 19, TailwindCSS, Axios (instance avec intercepteur JWT), Context API (`AuthContext`)
- **Backend & Base de données** : Node.js, Prisma ORM, Neon PostgreSQL
- **Sécurité** : Hachage des mots de passe avec `bcryptjs`, authentification par token JWT signé, gestion stricte des rôles (401 vs 403)
- **API Externe** : Open Trivia DB (via Axios) pour la génération de quiz dynamiques
- **CORS** : Configuré sur toutes les routes `/api/*`

---

## 📡 Documentation des routes d'API

### 🔐 Authentification (`/api/auth`)

| Méthode | Route | Accès | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Inscription d'un utilisateur (nom, email, motDePasse) |
| `POST` | `/api/auth/login` | Public | Connexion (email, motDePasse) -> retourne token JWT et profil |

### 📚 Cours (`/api/cours`)

| Méthode | Route | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cours` | Public | Liste paginée avec filtres query : `?page=1&limit=10&niveau=DEBUTANT&recherche=...` |
| `GET` | `/api/cours/:id` | Public | Détails d'un cours avec formateur et leçons ordonnées |
| `POST` | `/api/cours` | `FORMATEUR` | Création d'un cours (titre, description, niveau) |
| `PUT` | `/api/cours/:id` | `FORMATEUR` (auteur) ou `ADMIN` | Modification de son propre cours |
| `DELETE` | `/api/cours/:id` | `FORMATEUR` (auteur) ou `ADMIN` | Suppression de son propre cours |
| `GET` | `/api/cours/:id/lecons` | Public | Liste des leçons d'un cours ordonnées |
| `POST` | `/api/cours/:id/lecons` | `FORMATEUR` | Ajout d'une leçon à un cours |

### 📝 Inscriptions & Progression (`/api/inscriptions`)

| Méthode | Route | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/inscriptions` | `ETUDIANT` | Liste des inscriptions de l'étudiant connecté |
| `POST` | `/api/inscriptions` | `ETUDIANT` | Inscription à un cours (`coursId`) |
| `PUT` | `/api/inscriptions/:id/progression` | `ETUDIANT` | Mise à jour de la progression (0 à 100 %) |

### 🧠 Quiz (`/api/quiz`)

| Méthode | Route | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/quiz` | `ETUDIANT` | Liste des quiz passés par l'étudiant |
| `POST` | `/api/quiz/generer` | `ETUDIANT` | Interroge Open Trivia DB via Axios, génère 5 questions et stocke le quiz |
| `PUT` | `/api/quiz/:id/score` | `ETUDIANT` (auteur) | Enregistrement du score du quiz |

### 👤 Administration des utilisateurs (`/api/utilisateurs`)

| Méthode | Route | Accès | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/utilisateurs` | `ADMIN` | Liste de tous les utilisateurs (401 si non connecté, 403 si non ADMIN) |
| `GET` | `/api/utilisateurs/:id` | `ADMIN` | Détail d'un utilisateur |
| `DELETE` | `/api/utilisateurs/:id` | `ADMIN` | Suppression d'un utilisateur |

---

## 📐 Modélisation du Domaine (Diagramme UML de classes)

```mermaid
classDiagram
  direction LR

  class Utilisateur {
    +Int id
    +String email
    +String motDePasseHash
    +String nom
    +Role role
    +DateTime dateCreation
  }

  class Cours {
    +Int id
    +String titre
    +String description
    +NiveauCours niveau
    +DateTime dateCreation
    +Int formateurId
  }

  class Lecon {
    +Int id
    +String titre
    +String contenu
    +Int ordre
    +Int coursId
  }

  class Inscription {
    +Int id
    +StatutInscription statut
    +Int progression
    +DateTime dateInscription
    +Int etudiantId
    +Int coursId
  }

  class Quiz {
    +Int id
    +Int score nullable
    +DateTime dateCreation
    +Int coursId
    +Int etudiantId
  }

  class Question {
    +Int id
    +String enonce
    +String bonneReponse
    +String[] mauvaisesReponses
    +Int quizId
  }

  class Role {
    <<enumeration>>
    ETUDIANT
    FORMATEUR
    ADMIN
  }

  class NiveauCours {
    <<enumeration>>
    DEBUTANT
    INTERMEDIAIRE
    AVANCE
  }

  class StatutInscription {
    <<enumeration>>
    ACTIVE
    TERMINEE
    ABANDONNEE
  }

  Utilisateur "1" --> "0..*" Cours : publie
  Cours "1" *-- "0..*" Lecon : contient
  Utilisateur "1" --> "0..*" Inscription : etudiant
  Cours "1" --> "0..*" Inscription : inscriptions
  Cours "1" *-- "0..*" Quiz : quiz
  Utilisateur "1" --> "0..*" Quiz : passe
  Quiz "1" *-- "0..*" Question : questions

  Utilisateur ..> Role : role
  Cours ..> NiveauCours : niveau
  Inscription ..> StatutInscription : statut
```
