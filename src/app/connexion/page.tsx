"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function ConnexionPage() {
  const router = useRouter();
  const { connexion } = useAuth();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setChargement(true);
      setErreur("");

      await connexion(email, motDePasse);
      router.push("/");
    } catch {
      setErreur("Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 120px)" }}>
      <form className="form-card animate-fade-in" onSubmit={handleSubmit} style={{ maxWidth: "440px" }}>
        <div className="form-header">
          <div className="brand-icon" style={{ margin: "0 auto 1rem", width: "48px", height: "48px", borderRadius: "14px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <h1>Connexion</h1>
          <p>Accédez à votre espace d'apprentissage en ligne.</p>
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
            placeholder="••••••••"
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
          {chargement ? "Connexion en cours..." : "Se connecter"}
        </button>

        <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
          Pas encore de compte ?{" "}
          <Link href="/inscription" style={{ color: "#c084fc", fontWeight: 600, textDecoration: "none" }}>
            Créer un compte
          </Link>
        </p>
      </form>
    </main>
  );
}
