"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import api from "@/lib/api";

export default function InscriptionPage() {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setChargement(true);
      setErreur("");
      setSucces("");

      await api.post("/auth/register", {
        nom,
        email,
        motDePasse,
      });

      setSucces("Compte créé avec succès ! Redirection vers la page de connexion...");
      setTimeout(() => {
        router.push("/connexion");
      }, 1200);
    } catch (err: any) {
      setErreur(err.response?.data?.message || "Impossible de créer le compte. L'adresse email est peut-être déjà utilisée.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 120px)" }}>
      <form className="form-card animate-fade-in" onSubmit={handleSubmit} style={{ maxWidth: "460px" }}>
        <div className="form-header">
          <div className="brand-icon" style={{ margin: "0 auto 1rem", width: "48px", height: "48px", borderRadius: "14px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7.5" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h1>Rejoindre l'Académie</h1>
          <p>Créez votre compte étudiant pour débuter votre parcours.</p>
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
          <label className="form-label" htmlFor="nom">
            Nom complet
          </label>
          <input
            id="nom"
            type="text"
            className="form-input"
            placeholder="ex: Marie Curie"
            value={nom}
            onChange={(event) => setNom(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Adresse courriel
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="nom@exemple.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="motDePasse">
            Mot de passe
          </label>
          <input
            id="motDePasse"
            type="password"
            className="form-input"
            placeholder="Minimum 6 caractères"
            value={motDePasse}
            onChange={(event) => setMotDePasse(event.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={chargement}
          className="btn-primary"
          style={{ width: "100%", marginTop: "1rem" }}
        >
          {chargement ? "Création en cours..." : "Créer mon compte"}
        </button>

        <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
          Déjà inscrit ?{" "}
          <Link href="/connexion" style={{ color: "#c084fc", fontWeight: 600, textDecoration: "none" }}>
            Se connecter
          </Link>
        </p>
      </form>
    </main>
  );
}
