type CoursSujet = {
  titre: string;
  description: string;
  lecons: Array<{
    titre: string;
  }>;
};

export type QuestionTrivia = {
  category?: string;
  question?: string;
  correct_answer?: string;
  incorrect_answers?: string[];
};

const CATEGORIES = [
  { id: 18, nom: "Science: Computers", mots: ["informatique", "ordinateur", "programmation", "programming", "javascript", "typescript", "node", "react", "python", "java", "sql", "web", "logiciel", "code"] },
  { id: 19, nom: "Science: Mathematics", mots: ["math", "mathematique", "algebre", "geometrie", "calcul"] },
  { id: 17, nom: "Science & Nature", mots: ["science", "physique", "chimie", "biologie", "astronomie", "nature"] },
  { id: 24, nom: "History", mots: ["histoire", "historique", "guerre", "civilisation"] },
  { id: 22, nom: "Geography", mots: ["geographie", "pays", "continent", "ville", "territoire"] },
  { id: 21, nom: "Sports", mots: ["sport", "football", "soccer", "hockey", "basketball"] },
  { id: 12, nom: "Music", mots: ["musique", "chanson", "instrument", "artiste"] },
  { id: 11, nom: "Film", mots: ["film", "cinema", "acteur", "realisateur"] },
  { id: 27, nom: "Animals", mots: ["animal", "animaux", "mammifere", "oiseau"] },
] as const;

const MOTS_VIDES = new Set([
  "avec", "dans", "pour", "plus", "moins", "cours", "course", "cours", "formation",
  "introduction", "apprendre", "apprentissage", "notions", "base", "bases", "niveau",
  "the", "and", "with", "from", "about", "course", "learn", "learning", "introduction",
]);

function normaliser(texte: string) {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function extraireMots(texte: string) {
  return normaliser(texte)
    .split(/[^a-z0-9]+/)
    .filter((mot) => mot.length >= 4 && !MOTS_VIDES.has(mot));
}

export function analyserSujet(cours: CoursSujet) {
  const texteSujet = [
    cours.titre,
    cours.description,
    ...cours.lecons.map((lecon) => lecon.titre),
  ].join(" ");

  const motsSujet = [...new Set(extraireMots(texteSujet))];
  const texteNormalise = normaliser(texteSujet);

  const categorie = CATEGORIES
    .map((candidate) => ({
      ...candidate,
      score: candidate.mots.filter((mot) => texteNormalise.includes(mot)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .find((candidate) => candidate.score > 0);

  return {
    motsSujet,
    categorie: categorie
      ? { id: categorie.id, nom: categorie.nom }
      : null,
  };
}

export function filtrerQuestionsLiees(
  questions: QuestionTrivia[],
  sujet: ReturnType<typeof analyserSujet>,
) {
  return questions.filter((question) => {
    if (
      !question.question ||
      !question.correct_answer ||
      !question.incorrect_answers ||
      question.incorrect_answers.length !== 3
    ) {
      return false;
    }

    const texteQuestion = normaliser([
      question.question,
      question.correct_answer,
      ...question.incorrect_answers,
    ].join(" "));

    if (sujet.categorie) {
      return normaliser(question.category ?? "") === normaliser(sujet.categorie.nom);
    }

    return sujet.motsSujet.some((mot) => texteQuestion.includes(mot));
  });
}
