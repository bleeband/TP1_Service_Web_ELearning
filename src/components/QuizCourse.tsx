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

// Fonction utilitaire pour décoder les entités HTML renvoyées par Open Trivia DB (&quot;, &#039;, etc.)
function decodeHtml(html: string) {
  if (typeof window === "undefined") return html;
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

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
          enonce: decodeHtml(question.enonce),
          bonneReponse: decodeHtml(question.bonneReponse),
          mauvaisesReponses: question.mauvaisesReponses.map((r) => decodeHtml(r)),
          reponses: melanger([
            decodeHtml(question.bonneReponse),
            ...question.mauvaisesReponses.map((r) => decodeHtml(r)),
          ]),
        }),
      );

      setQuestions(questionsPreparees);
    } catch {
      setErreur("Impossible de générer le quiz. Veuillez réessayer.");
    } finally {
      setChargement(false);
    }
  }

  function choisirReponse(questionId: number, reponse: string) {
    setReponses((anciennesReponses) => ({
      ...anciennesReponses,
      [questionId]: reponse,
    }));
  }

  async function corrigerQuiz() {
    if (!quizId) return;

    if (Object.keys(reponses).length !== questions.length) {
      setErreur("Veuillez répondre à toutes les questions avant de valider.");
      return;
    }

    let bonnesReponses = 0;
    for (const question of questions) {
      if (reponses[question.id] === question.bonneReponse) {
        bonnesReponses++;
      }
    }

    const nouveauScore = Math.round((bonnesReponses / questions.length) * 100);

    try {
      setErreur("");
      await api.put(`/quiz/${quizId}/score`, {
        score: nouveauScore,
      });
      setScore(nouveauScore);
    } catch {
      setErreur("Impossible d'enregistrer votre résultat.");
    }
  }

  return (
    <div className="quiz-container">
      {questions.length === 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <h4 style={{ margin: "0 0 0.25rem", fontSize: "1.05rem", fontWeight: 700 }}>
              🧠 Quiz d'évaluation dynamique
            </h4>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              Testez vos connaissances avec 5 questions certifiées générées via l'API Open Trivia DB.
            </p>
          </div>

          <button
            onClick={genererQuiz}
            disabled={chargement}
            className="btn-primary"
            style={{ fontSize: "0.875rem" }}
          >
            {chargement ? (
              "Génération..."
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Générer un quiz
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ margin: "0 0 0.2rem", fontSize: "1.2rem", fontWeight: 800 }}>
                Quiz en cours
              </h3>
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                {Object.keys(reponses).length} sur {questions.length} questions répondues
              </span>
            </div>

            <button
              onClick={genererQuiz}
              disabled={chargement}
              className="btn-ghost"
              style={{ fontSize: "0.8rem" }}
            >
              ↻ Nouveau tirage
            </button>
          </div>

          {questions.map((question, index) => (
            <div key={question.id} className="quiz-question-box">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.5rem", background: "rgba(124, 58, 237, 0.2)", color: "#c084fc", borderRadius: "6px" }}>
                  Question {index + 1}
                </span>
              </div>

              <p style={{ margin: "0 0 1rem", fontWeight: 600, fontSize: "1rem", color: "#f1f5f9" }}>
                {question.enonce}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {question.reponses.map((reponse) => {
                  const isSelected = reponses[question.id] === reponse;
                  const showResult = score !== null;
                  const isCorrect = reponse === question.bonneReponse;

                  let optionBorderColor = "var(--color-border)";
                  let optionBg = "rgba(8, 12, 22, 0.4)";
                  if (isSelected) {
                    optionBorderColor = "#8b5cf6";
                    optionBg = "rgba(124, 58, 237, 0.18)";
                  }
                  if (showResult && isCorrect) {
                    optionBorderColor = "#10b981";
                    optionBg = "rgba(16, 185, 129, 0.15)";
                  } else if (showResult && isSelected && !isCorrect) {
                    optionBorderColor = "#f43f5e";
                    optionBg = "rgba(244, 63, 94, 0.15)";
                  }

                  return (
                    <label
                      key={reponse}
                      className="quiz-option"
                      style={{
                        borderColor: optionBorderColor,
                        backgroundColor: optionBg,
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={isSelected}
                        onChange={() => choisirReponse(question.id, reponse)}
                        disabled={score !== null}
                        style={{ accentColor: "#8b5cf6" }}
                      />
                      <span style={{ fontSize: "0.925rem", color: isSelected ? "white" : "var(--color-text)" }}>
                        {reponse}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {erreur && (
            <div className="banner-error">
              <span>{erreur}</span>
            </div>
          )}

          {score === null ? (
            <div style={{ textAlign: "right", marginTop: "1rem" }}>
              <button onClick={corrigerQuiz} className="btn-primary">
                Valider et calculer mon score
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                padding: "1.25rem",
                background: "var(--color-surface-hover)",
                borderRadius: "14px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                marginTop: "1rem",
              }}
            >
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Résultat officiel</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
                  <span className={`quiz-score-badge ${score >= 70 ? "high" : "low"}`}>
                    {score} %
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {score >= 70 ? "🎉 Excellent travail ! Quiz réussi." : "💪 Bon essai, continuez à réviser !"}
                  </span>
                </div>
              </div>

              <button onClick={genererQuiz} className="btn-secondary">
                Repasser un autre quiz
              </button>
            </div>
          )}
        </div>
      )}

      {erreur && questions.length === 0 && (
        <div className="banner-error" style={{ marginTop: "1rem" }}>
          <span>{erreur}</span>
        </div>
      )}
    </div>
  );
}
