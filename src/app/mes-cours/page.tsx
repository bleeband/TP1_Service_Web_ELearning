"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import QuizCourse from "@/components/QuizCourse";

type Inscription = {
  id: number;
  statut: string;
  progression: number;
  cours: {
    id: number;
    titre: string;
    description: string;
    niveau: string;
  };
};

export default function MesCoursPage() {
  const { utilisateur } = useAuth();

  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (utilisateur?.role === "ETUDIANT") {
      chargerInscriptions();
    } else {
      setChargement(false);
    }
  }, [utilisateur]);

  async function chargerInscriptions() {
    try {
      setChargement(true);
      setErreur("");

      const reponse = await api.get("/inscriptions");
      setInscriptions(reponse.data || []);
    } catch {
      setErreur("Impossible de charger vos inscriptions.");
    } finally {
      setChargement(false);
    }
  }

  async function modifierProgression(
    inscriptionId: number,
    progression: number,
  ) {
    try {
      setUpdatingId(inscriptionId);
      await api.put(`/inscriptions/${inscriptionId}/progression`, {
        progression,
      });

      // Mettre à jour l'état local immédiatement
      setInscriptions((prev) =>
        prev.map((ins) =>
          ins.id === inscriptionId
            ? {
                ...ins,
                progression,
                statut: progression === 100 ? "TERMINEE" : "ACTIVE",
              }
            : ins
        )
      );
    } catch {
      setErreur("Impossible de mettre à jour la progression.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!utilisateur) {
    return (
      <main style={{ textAlign: "center", padding: "5rem 1rem" }}>
        <div className="form-card" style={{ maxWidth: "440px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</div>
          <h2>Connexion requise</h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
            Vous devez être connecté avec un compte étudiant pour accéder à votre espace de formation.
          </p>
          <Link href="/connexion" className="btn-primary" style={{ width: "100%" }}>
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  if (utilisateur.role !== "ETUDIANT") {
    return (
      <main style={{ textAlign: "center", padding: "5rem 1rem" }}>
        <div className="form-card" style={{ maxWidth: "460px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎓</div>
          <h2>Espace réservé aux étudiants</h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
            Votre compte actuel ({utilisateur.role}) est un compte formateur ou administrateur. 
            Les inscriptions aux cours sont réservées aux étudiants.
          </p>
          <Link href="/" className="btn-secondary" style={{ width: "100%" }}>
            Retour aux cours
          </Link>
        </div>
      </main>
    );
  }

  if (chargement) {
    return (
      <main style={{ textAlign: "center", padding: "5rem 1rem" }}>
        <div style={{ display: "inline-block", width: "40px", height: "40px", border: "3px solid rgba(124, 58, 237, 0.2)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: "1rem", color: "var(--color-text-muted)" }}>Chargement de vos cours...</p>
      </main>
    );
  }

  const coursTermines = inscriptions.filter((i) => i.progression === 100).length;
  const progressionMoyenne =
    inscriptions.length > 0
      ? Math.round(
          inscriptions.reduce((acc, curr) => acc + curr.progression, 0) /
            inscriptions.length
        )
      : 0;

  return (
    <main>
      {/* Dashboard Summary Header */}
      <section className="animate-fade-in" style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Tableau de bord étudiant
            </span>
            <h1 style={{ margin: "0.25rem 0 0", fontSize: "2.2rem", fontWeight: 800 }}>
              Mes cours & formations
            </h1>
          </div>

          <Link href="/" className="btn-secondary" style={{ fontSize: "0.875rem" }}>
            + Découvrir d'autres cours
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.25rem", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "14px" }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Cours inscrits</span>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, marginTop: "0.25rem", color: "#38bdf8" }}>
              {inscriptions.length}
            </div>
          </div>

          <div style={{ padding: "1.25rem", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "14px" }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Progression moyenne</span>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, marginTop: "0.25rem", color: "#a855f7" }}>
              {progressionMoyenne} %
            </div>
          </div>

          <div style={{ padding: "1.25rem", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "14px" }}>
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Cours complétés</span>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, marginTop: "0.25rem", color: "#34d399" }}>
              {coursTermines} / {inscriptions.length}
            </div>
          </div>
        </div>
      </section>

      {erreur && (
        <div className="banner-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{erreur}</span>
        </div>
      )}

      {inscriptions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 1.5rem", background: "var(--color-surface)", borderRadius: "20px", border: "1px dashed var(--color-border)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📖</div>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem" }}>Vous n'êtes inscrit à aucun cours</h3>
          <p style={{ color: "var(--color-text-muted)", maxWidth: "420px", margin: "0 auto 1.5rem" }}>
            Explorez notre catalogue de formations pour vous inscrire à votre premier cours et commencer à progresser !
          </p>
          <Link href="/" className="btn-primary">
            Voir les cours disponibles
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {inscriptions.map((inscription) => (
            <article
              key={inscription.id}
              className="course-card animate-fade-in"
              style={{ padding: "1.75rem" }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div>
                  <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.4rem", fontWeight: 800 }}>
                    {inscription.cours.titre}
                  </h2>
                  <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.95rem", maxWidth: "680px" }}>
                    {inscription.cours.description}
                  </p>
                </div>

                <span
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    background:
                      inscription.progression === 100
                        ? "rgba(16, 185, 129, 0.15)"
                        : "rgba(56, 189, 248, 0.15)",
                    color:
                      inscription.progression === 100 ? "#34d399" : "#38bdf8",
                    border: `1px solid ${
                      inscription.progression === 100
                        ? "rgba(16, 185, 129, 0.35)"
                        : "rgba(56, 189, 248, 0.35)"
                    }`,
                  }}
                >
                  {inscription.progression === 100 ? "✓ Complété" : "En cours"}
                </span>
              </div>

              {/* Progress Bar interactive */}
              <div style={{ margin: "1.25rem 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Progression de l'apprentissage</span>
                  <span style={{ color: "#38bdf8" }}>{inscription.progression} %</span>
                </div>

                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${inscription.progression}%` }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginRight: "0.25rem" }}>
                    Mettre à jour :
                  </span>
                  {[25, 50, 75, 100].map((pourcentage) => (
                    <button
                      key={pourcentage}
                      onClick={() => modifierProgression(inscription.id, pourcentage)}
                      disabled={updatingId === inscription.id}
                      style={{
                        padding: "0.3rem 0.75rem",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        border:
                          inscription.progression === pourcentage
                            ? "1px solid #38bdf8"
                            : "1px solid var(--color-border)",
                        background:
                          inscription.progression === pourcentage
                            ? "rgba(56, 189, 248, 0.15)"
                            : "rgba(255, 255, 255, 0.04)",
                        color:
                          inscription.progression === pourcentage
                            ? "#38bdf8"
                            : "var(--color-text-muted)",
                        transition: "all 160ms ease",
                      }}
                    >
                      {pourcentage} %
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Quiz Trivia */}
              <QuizCourse coursId={inscription.cours.id} />
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
