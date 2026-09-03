classDiagram
direction LR

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

class Utilisateur {
  +Int id
  +String email
  +String motDePasseHash
  +String nom
  +Role role
  +DateTime createdAt
  +DateTime updatedAt
}

class Cours {
  +Int id
  +String titre
  +String description
  +NiveauCours niveau
  +Boolean publie
  +Int formateurId
  +DateTime createdAt
  +DateTime updatedAt
}

class Lecon {
  +Int id
  +String titre
  +String contenu
  +Int ordre
  +Int coursId
  +DateTime createdAt
  +DateTime updatedAt
}

class Inscription {
  +Int id
  +Int etudiantId
  +Int coursId
  +StatutInscription statut
  +Float progression
  +DateTime createdAt
  +DateTime updatedAt
}

class Quiz {
  +Int id
  +Int inscriptionId
  +Int score
  +DateTime createdAt
}

class QuestionQuiz {
  +Int id
  +Int quizId
  +String enonce
  +String bonneReponse
  +String mauvaisesReponses[]
  +String choix[]
  +String categorie
  +String difficulte
  +String type
}

Utilisateur "1" --> "0..*" Cours : publie
Cours "1" --> "1..*" Lecon : contient
Utilisateur "1" --> "0..*" Inscription : suit
Cours "1" --> "0..*" Inscription : reçoit
Inscription "1" --> "0..*" Quiz : génère
Quiz "1" --> "5" QuestionQuiz : contient

Utilisateur --> Role
Cours --> NiveauCours
Inscription --> StatutInscription