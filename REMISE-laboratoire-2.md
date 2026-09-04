# Laboratoire 2 — Fiche de remise

> À déposer sur Teams. Ce fichier contient la **liste des membres**, le **lien du dépôt GitHub** et la validation des exigences.

## 👥 Équipe

| Nom complet |
| :--- |
| Eva Bessette |
| Charles Legeault |
| Marc-André Dufour |

## 🎯 Sujet (choisi au Laboratoire 1)

Sujet : **E-Learning (Mini-Moodle)**

## 🔗 Dépôt GitHub

Lien : [https://github.com/bleeband/TP1_Service_Web_ELearning](https://github.com/bleeband/TP1_Service_Web_ELearning)

## ▶️ Lancer le projet

> Note : Avec l'autorisation de l'enseignant, le projet est développé en **Next.js Full-Stack** (App Router avec React côté client et API Routes côté serveur), combinant le frontend et le backend avec support CORS complet.

```bash
# Installation des dépendances
npm install

# Configuration de la base de données (Neon Postgres)
npx prisma generate
npx prisma migrate dev

# Lancement de l'application (http://localhost:3000)
npm run dev
```

Variables d'environnement requises dans `.env` (non committé) :

- `DATABASE_URL` : URL de connexion PostgreSQL (Neon)
- `JWT_SECRET` : Clé secrète de signature des tokens JWT
- `TRIVIA_API` : `https://opentdb.com/api.php` (valeur par défaut automatique)
- `PORT` : `3000`

## ✅ Fonctionnalités réalisées

- [x] Backend : CRUD complet sur l'entité principale (Cours : GET all, GET/:id, POST, PUT, DELETE)
- [x] Backend : Filtres et pagination via query string (`page`, `limit`, `niveau`, `recherche`)
- [x] Backend : Authentification JWT + mots de passe hachés avec bcrypt
- [x] Backend : Gestion des rôles et distinction stricte HTTP 401 (non authentifié) vs 403 (accès refusé)
- [x] Backend : Intégration de l'API publique (Open Trivia DB via Axios pour générer 5 questions de quiz)
- [x] Backend : CORS activé sur les routes `/api/*`
- [x] Frontend : Affichage des données (useEffect + axios) avec gestion des 3 états (chargement, erreur, succès)
- [x] Frontend : Formulaire contrôlé de création de cours (avec validation et rafraîchissement dynamique)
- [x] Frontend : Formulaires de connexion et inscription (stockage du token dans localStorage, envoi Authorization Bearer)
- [x] Frontend : AuthContext centralisé (état connecté/déconnecté global, déconnexion)
- [x] Frontend : Actions protégées visibles selon le rôle et l'état de connexion (M'inscrire, passer un quiz, progression, etc.)

## 📝 Remarques

Le backend Express initial (issu du Labo 1) a été consolidé et migré vers l'architecture Next.js (App Router + API Routes) avec l'autorisation de l'enseignant, garantissant une intégration full-stack complète et fluide.
