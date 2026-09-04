"use client";

import { FormEvent, useState } from "react";
import api from "@/lib/api";

type Props = {
  onCreated: () => void;
};

export default function CourseForm({ onCreated }: Props) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [niveau, setNiveau] = useState<"DEBUTANT" | "INTERMEDIAIRE" | "AVANCE">("DEBUTANT");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setChargement(true);
      setErreur("");
      setSucces("");

      await api.post("/cours", {
        titre,
        description,
        niveau,
      });

      setSucces("Le cours a été créé avec succès !");
      setTitre("");
      setDescription("");
      setNiveau("DEBUTANT");

      setTimeout(() => {
        onCreated();
      }, 800);
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || "Impossible de créer le cours");
    } finally {
      setChargement(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-header">
        <div style={{ display: "inline-flex", padding: "0.65rem", background: "rgba(124, 58, 237, 0.15)", borderRadius: "12px", color: "#c084fc", marginBottom: "0.75rem" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <h2>Publier un nouveau cours</h2>
        <p>Renseignez les informations pédagogiques de votre formation.</p>
      </div>

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

      {succes && (
        <div className="banner-success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>{succes}</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="titre">
          Titre du cours *
        </label>
        <input
          id="titre"
          type="text"
          className="form-input"
          placeholder="ex: Introduction à TypeScript et Node.js"
          value={titre}
          onChange={(event) => setTitre(event.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">
          Description complète *
        </label>
        <textarea
          id="description"
          className="form-textarea"
          placeholder="Décrivez les compétences visées, le public cible et le programme..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Niveau de difficulté *</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "0.4rem" }}>
          {(["DEBUTANT", "INTERMEDIAIRE", "AVANCE"] as const).map((lvl) => (
            <button
              type="button"
              key={lvl}
              onClick={() => setNiveau(lvl)}
              style={{
                padding: "0.65rem 0.5rem",
                borderRadius: "10px",
                border: niveau === lvl ? "2px solid #8b5cf6" : "1px solid var(--color-border)",
                background: niveau === lvl ? "rgba(124, 58, 237, 0.2)" : "rgba(8, 12, 22, 0.5)",
                color: niveau === lvl ? "white" : "var(--color-text-muted)",
                fontWeight: 600,
                fontSize: "0.85rem",
                textAlign: "center",
                transition: "all 160ms ease",
              }}
            >
              {lvl === "DEBUTANT" ? "🌱 Débutant" : lvl === "INTERMEDIAIRE" ? "⚡ Intermédiaire" : "🔥 Avancé"}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={chargement}
        className="btn-primary"
        style={{ width: "100%", marginTop: "1rem" }}
      >
        {chargement ? "Publication en cours..." : "Créer et publier le cours"}
      </button>
    </form>
  );
}
