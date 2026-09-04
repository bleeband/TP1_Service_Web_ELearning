"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Lecon = {
  id: number;
  titre: string;
  ordre: number;
};

type Cours = {
  id: number;
  titre: string;
  description: string;
  niveau: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
  formateur: {
    id: number;
    nom: string;
  };
  lecons?: Lecon[];
};

type Props = {
  refresh: number;
};

export default function CourseList({ refresh }: Props) {
  const { utilisateur } = useAuth();

  const [cours, setCours] = useState<Cours[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [actionId, setActionId] = useState<number | null>(null);

  // Filtres côté client qui appellent les query params du backend
  const [recherche, setRecherche] = useState("");
  const [niveauSelectionne, setNiveauSelectionne] = useState<string>("TOUS");

  useEffect(() => {
    chargerCours();
  }, [refresh, niveauSelectionne, recherche]);

  async function chargerCours() {
    try {
      setChargement(true);
      setErreur("");

      const params: Record<string, string> = {};
      if (niveauSelectionne !== "TOUS") {
        params.niveau = niveauSelectionne;
      }
      if (recherche.trim()) {
        params.recherche = recherche.trim();
      }

      const reponse = await api.get("/cours", { params });
      setCours(reponse.data.cours || []);
    } catch {
      setErreur("Impossible de charger les cours depuis le serveur.");
    } finally {
      setChargement(false);
    }
  }

  async function inscrire(coursId: number) {
    try {
      setActionId(coursId);
      setMessage("");

      await api.post("/inscriptions", { coursId });

      setMessage("Félicitations ! Votre inscription est confirmée. Rendez-vous dans 'Mes cours'.");
    } catch (err: any) {
      const msg = err.response?.data?.erreur || "Impossible de vous inscrire à ce cours.";
      setMessage(msg);
    } finally {
      setActionId(null);
    }
  }

  const getNiveauBadgeClass = (niveau: string) => {
    switch (niveau) {
      case "DEBUTANT":
        return "debutant";
      case "INTERMEDIAIRE":
        return "intermediaire";
      case "AVANCE":
        return "avance";
      default:
        return "debutant";
    }
  };

  const getNiveauLabel = (niveau: string) => {
    switch (niveau) {
      case "DEBUTANT":
        return "Débutant";
      case "INTERMEDIAIRE":
        return "Intermédiaire";
      case "AVANCE":
        return "Avancé";
      default:
        return niveau;
    }
  };

  return (
    <section>
      {/* Barre d'outils avec Recherche et Filtres par niveau */}
      <div className="filter-toolbar">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un cours par titre..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>

        <div className="level-pills">
          {["TOUS", "DEBUTANT", "INTERMEDIAIRE", "AVANCE"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setNiveauSelectionne(lvl)}
              className={`level-btn ${niveauSelectionne === lvl ? "active" : ""}`}
            >
              {lvl === "TOUS" ? "Tous les niveaux" : getNiveauLabel(lvl)}
            </button>
          ))}
        </div>
      </div>

      {/* Messages d'alerte / succès */}
      {message && (
        <div className={message.includes("Félicitations") ? "banner-success" : "banner-error"}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{message}</span>
        </div>
      )}

      {/* 3 États : Chargement */}
      {chargement && (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <div style={{ display: "inline-block", width: "40px", height: "40px", border: "3px solid rgba(124, 58, 237, 0.2)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: "1rem", color: "var(--color-text-muted)" }}>Chargement des cours en direct...</p>
        </div>
      )}

      {/* 3 États : Erreur */}
      {erreur && !chargement && (
        <div className="banner-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>Erreur de chargement</p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>{erreur}</p>
          </div>
        </div>
      )}

      {/* 3 États : Succès avec grille de cours */}
      {!chargement && !erreur && (
        <>
          {cours.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4.5rem 1rem", background: "var(--color-surface)", borderRadius: "18px", border: "1px dashed var(--color-border)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔍</div>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem" }}>Aucun cours trouvé</h3>
              <p style={{ color: "var(--color-text-muted)", maxWidth: "420px", margin: "0 auto" }}>
                Essayez d'ajuster votre recherche ou vos filtres de niveau pour afficher d'autres résultats.
              </p>
            </div>
          ) : (
            <div className="course-grid">
              {cours.map((c) => (
                <article key={c.id} className="course-card animate-fade-in">
                  <div className="card-header">
                    <span className={`level-badge ${getNiveauBadgeClass(c.niveau)}`}>
                      <span style={{ fontSize: "0.85rem" }}>●</span>
                      {getNiveauLabel(c.niveau)}
                    </span>

                    {c.lecons && c.lecons.length > 0 && (
                      <span style={{ fontSize: "0.775rem", color: "var(--color-text-muted)", background: "rgba(255,255,255,0.04)", padding: "0.2rem 0.55rem", borderRadius: "6px" }}>
                        {c.lecons.length} {c.lecons.length > 1 ? "leçons" : "leçon"}
                      </span>
                    )}
                  </div>

                  <h2 className="card-title">{c.titre}</h2>
                  <p className="card-desc">{c.description}</p>

                  <div className="card-meta">
                    <div className="formateur-info">
                      <div className="author-circle">
                        {c.formateur?.nom ? c.formateur.nom[0].toUpperCase() : "F"}
                      </div>
                      <span>{c.formateur?.nom || "Formateur"}</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    {utilisateur?.role === "ETUDIANT" ? (
                      <button
                        onClick={() => inscrire(c.id)}
                        disabled={actionId === c.id}
                        className="btn-primary"
                        style={{ width: "100%" }}
                      >
                        {actionId === c.id ? (
                          "Inscription en cours..."
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                              <circle cx="8.5" cy="7.5" r="4"/>
                              <line x1="20" y1="8" x2="20" y2="14"/>
                              <line x1="23" y1="11" x2="17" y2="11"/>
                            </svg>
                            M'inscrire au cours
                          </>
                        )}
                      </button>
                    ) : !utilisateur ? (
                      <Link 
                        href="/connexion" 
                        className="btn-secondary" 
                        style={{ width: "100%", textAlign: "center", fontSize: "0.875rem" }}
                      >
                        Se connecter pour s'inscrire
                      </Link>
                    ) : (
                      <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                        Connecté en tant que {utilisateur.role}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
