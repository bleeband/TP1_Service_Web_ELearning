# TP1 Service Web - E26-420941MA
- Eva Bessette
- Charles Legeault
- Marc-André Dufour

## Le contexte

Un cégep veut lancer sa propre plateforme de cours en ligne, façon « mini-Moodle ». Les formateurs publient des cours composés de leçons ; les étudiants s'y inscrivent, suivent les leçons et passent des quiz dont les questions sont tirées d'une banque mondiale. Votre équipe construit le cerveau de tout ça : le backend.

# Partie 1

📐 Le diagramme de classes
Avant une seule ligne de code : modélisez le domaine. Votre diagramme doit faire apparaître les entités, leurs attributs typés, les énumérations et les relations (avec cardinalités).

## 👤 Utilisateur

email unique, mot de passe (haché), nom, et un rôle : ETUDIANT, FORMATEUR, ADMIN.

## 📚 Cours & Leçon

Un cours (titre, description, niveau : débutant/intermédiaire/avancé) contient plusieurs leçons ordonnées.

## 📝 Inscription & Quiz

Un étudiant s'inscrit à des cours (statut, progression). Un quiz regroupe des questions et un score.

- Relations attendues (au minimum)
- Un FORMATEUR publie plusieurs cours (1 - N).
- Un cours contient plusieurs leçons (1 - N).
- Un étudiant est inscrit à plusieurs cours et un cours a plusieurs étudiants (N - N, via Inscription).
- Au moins une énumération bien pensée (rôle, niveau, statut d'inscription…).

# Partie 2

## ⚙️ Le backend

Implémentez votre modèle avec Prisma + Neon, exposez-le en API REST avec Express, enrichissez-le via Axios, et protégez-le avec JWT.

## 🗂️ Données & routes (Express + Prisma)

- CRUD des cours : lister, consulter, créer, modifier, supprimer.
- Inscription d'un étudiant à un cours, et suivi de sa progression.
- Consulter les leçons d'un cours, dans l'ordre.
- Organisez le code en routers (cours, auth, inscriptions…).

## 🔐 Sécurité (JWT + rôles)

- Inscription / connexion avec mot de passe haché (bcrypt) et token signé.
- Consulter les cours : public ou tout utilisateur connecté.
- Créer / modifier un cours : réservé au rôle FORMATEUR.
- Gérer les utilisateurs : réservé à ADMIN. Distinguez 401 et 403.


## 🌐 L'intégration Axios — banque de questions de quiz

Pour générer les questions d'un quiz, interrogez l'Open Trivia Database (gratuite, sans clé) : opentdb.com/api.php. Récupérez 5 questions, transformez la réponse (énoncé + bonnes/mauvaises réponses) et stockez le quiz généré dans votre base.

- Validation
- Barème & livrables
- Critère Points
- Diagramme de classes (entités, énums, relations) 20
- Prisma + Neon (schéma migré, ≥ 3 entités, relation) 20
- Express — CRUD complet en routers 20
- Axios — quiz généré depuis l'API 15
- JWT — auth + autorisation par rôle 20
- Démo & qualité du dépôt 5

## 📦 À remettre

Le diagramme (image / PDF).
Le dépôt Git sans le .env.
Un README (lancement + routes).
La collection de tests (auth + CRUD + quiz).
