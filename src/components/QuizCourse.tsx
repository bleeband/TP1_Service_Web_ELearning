"use client";

import { useState } from "react";

import api from "@/lib/api";

type Question = {
  id: number;
  enonce: string;
  bonneReponse: string;
  mauvaisesReponses: string[];
};

type QuestionAffichee = Question & {
  reponses: string[];
};

type Props = {
  coursId: number;
};

export default function QuizCourse({ coursId }: Props) {
  const [quizId, setQuizId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionAffichee[]>([]);
  const [reponses, setReponses] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  function melanger(tableau: string[]) {
    return [...tableau].sort(() => Math.random() - 0.5);
  }

  async function genererQuiz() {
    try {
      setChargement(true);
      setErreur("");
      setScore(null);
      setReponses({});

      const reponse = await api.post("/quiz/generer", {
        coursId,
      });

      setQuizId(reponse.data.quiz.id);

      const questionsPreparees = reponse.data.questions.map(
        (question: Question) => ({
          ...question,
          reponses: melanger([
            question.bonneReponse,
            ...question.mauvaisesReponses,
          ]),
        }),
      );

      setQuestions(questionsPreparees);
    } catch {
      setErreur("Impossible de generer le quiz");
    } finally {
      setChargement(false);
    }
  }

  function choisirReponse(
    questionId: number,
    reponse: string,
  ) {
    setReponses((anciennesReponses) => ({
      ...anciennesReponses,
      [questionId]: reponse,
    }));
  }

  async function corrigerQuiz() {
    if (!quizId) return;

    if (Object.keys(reponses).length !== questions.length) {
      setErreur("Vous devez repondre a toutes les questions");
      return;
    }

    let bonnesReponses = 0;

    for (const question of questions) {
      if (reponses[question.id] === question.bonneReponse) {
        bonnesReponses++;
      }
    }

    const nouveauScore = Math.round(
      (bonnesReponses / questions.length) * 100,
    );

    try {
      setErreur("");

      await api.put(`/quiz/${quizId}/score`, {
        score: nouveauScore,
      });

      setScore(nouveauScore);
    } catch {
      setErreur("Impossible d'enregistrer le score");
    }
  }

  return (
    <div className="quiz">
      {questions.length === 0 ? (
        <>
          <button
            onClick={genererQuiz}
            disabled={chargement}
          >
            {chargement
              ? "Generation..."
              : "Generer un quiz"}
          </button>

          {erreur && (
            <p className="erreur">{erreur}</p>
          )}
        </>
      ) : (
        <>
          <h3>Quiz</h3>

          {questions.map((question, index) => (
            <div
              key={question.id}
              className="question"
            >
              <p>
                <strong>Question {index + 1} :</strong>{" "}
                {question.enonce}
              </p>

              {question.reponses.map((reponse) => (
                <label
                  key={reponse}
                  className="reponse"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={
                      reponses[question.id] === reponse
                    }
                    onChange={() =>
                      choisirReponse(
                        question.id,
                        reponse,
                      )
                    }
                  />

                  {reponse}
                </label>
              ))}
            </div>
          ))}

          {erreur && (
            <p className="erreur">{erreur}</p>
          )}

          {score === null ? (
            <button onClick={corrigerQuiz}>
              Corriger le quiz
            </button>
          ) : (
            <p className="resultat-quiz">
              Votre score : {score} %
            </p>
          )}
        </>
      )}
    </div>
  );
}
