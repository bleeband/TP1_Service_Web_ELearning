"use client";

import { useState } from "react";

import CourseForm from "@/components/CourseForm";
import CourseList from "@/components/CourseList";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { utilisateur } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);

  function rafraichirCours() {
    setRefresh((valeur) => valeur + 1);
    setShowCreateForm(false);
  }

  return (
    <main>
      {/* Hero Header */}
      <section className="hero-container animate-fade-in">
        <div className="hero-glow" />
        <div className="hero-kicker">
          <span>✦</span>
          <span>Plateforme d'apprentissage officielle</span>
        </div>

        <h1 className="hero-title">
          De la théorie à la pratique avec des cours{" "}
          <span className="gradient-text">interactifs & certifiés</span>.
        </h1>

        <p className="hero-sub">
          Découvrez notre catalogue de formations, suivez votre progression en temps réel
          et mesurez vos compétences grâce à des quiz générés dynamiquement.
        </p>

        {utilisateur?.role === "FORMATEUR" && (
          <div style={{ marginTop: "1.5rem" }}>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {showCreateForm ? "Fermer le formulaire" : "Créer un nouveau cours"}
            </button>
          </div>
        )}
      </section>

      {/* Formulaire Formateur avec animation */}
      {utilisateur?.role === "FORMATEUR" && showCreateForm && (
        <div className="animate-fade-in" style={{ marginBottom: "3rem" }}>
          <CourseForm onCreated={rafraichirCours} />
        </div>
      )}

      {/* Liste des cours avec filtres dynamiques */}
      <CourseList refresh={refresh} />
    </main>
  );
}
